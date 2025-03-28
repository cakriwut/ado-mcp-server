import { WebApi } from 'azure-devops-node-api';
import { AzureDevOpsConfig } from '../config/environment.js';
import { WikiError, WikiNotFoundError, WikiPageNotFoundError } from '../errors.js';
import fetch from 'node-fetch';
import type { Wiki, WikiPage, WikiPageResponse, WikiType, WikiCreateParameters, WikiPageCreateOrUpdateParameters } from 'azure-devops-node-api/interfaces/WikiInterfaces.js';

interface WikiListResponse {
  count: number;
  value: Wiki[];
}

interface WikiCreateResponse extends WikiCreateParameters {
  id: string;
  createdBy: {
    id: string;
    displayName: string;
    uniqueName: string;
  };
  createdDate: string;
}

interface WikiPageUpdateResponse extends WikiPageResponse {
  lastUpdatedBy: {
    id: string;
    displayName: string;
    uniqueName: string;
  };
  lastUpdatedDate: string;
}

export class WikiApi {
  private connection: WebApi;
  private baseUrl: string;
  private config: AzureDevOpsConfig;

  constructor(connection: WebApi, config: AzureDevOpsConfig) {
    this.connection = connection;
    this.config = config;
    this.baseUrl = `${config.orgUrl}/${config.project}/_apis/wiki`;
  }

  private async getAuthHeader(): Promise<string> {
    const token = Buffer.from(`:${this.config.pat}`).toString('base64');
    return `Basic ${token}`;
  }

  async createWiki(name: string, projectId?: string, mappedPath?: string): Promise<WikiCreateResponse> {
    const authHeader = await this.getAuthHeader();
    const response = await fetch(`${this.baseUrl}?api-version=7.0`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify({
        name,
        projectId: projectId || this.config.project,
        type: 'projectWiki',
        mappedPath: mappedPath || '/',
      }),
    });

    if (!response.ok) {
      throw new WikiError(
        `Failed to create wiki: ${response.statusText}`,
        response.status,
        undefined,
        undefined,
        await response.text()
      );
    }

    return response.json();
  }

  async getWiki(projectName: string, wikiIdentifier: string): Promise<Wiki> {
    const authHeader = await this.getAuthHeader();
    console.log(`Getting wiki with ID ${wikiIdentifier} in project ${projectName}`);
    console.log(`URL: ${this.config.orgUrl}/${projectName}/_apis/wiki/wikis/${wikiIdentifier}?api-version=7.0`);
    
    const response = await fetch(`${this.config.orgUrl}/${projectName}/_apis/wiki/wikis/${wikiIdentifier}?api-version=7.0`, {
      headers: {
        Authorization: authHeader,
      },
    });
    
    console.log(`Response status: ${response.status} ${response.statusText}`);

    if (response.status === 404) {
      throw new WikiNotFoundError(wikiIdentifier);
    }

    if (!response.ok) {
      throw new WikiError(
        `Failed to get wiki: ${response.statusText}`,
        response.status,
        wikiIdentifier,
        undefined,
        await response.text()
      );
    }

    return response.json();
  }

  async getAllWikis(): Promise<WikiListResponse> {
    const authHeader = await this.getAuthHeader();
    const response = await fetch(`${this.baseUrl}?api-version=7.0`, {
      headers: {
        Authorization: authHeader,
      },
    });

    if (!response.ok) {
      throw new WikiError(
        `Failed to get wikis: ${response.statusText}`,
        response.status,
        undefined,
        undefined,
        await response.text()
      );
    }

    return response.json();
  }

  async getWikiPage(wikiIdentifier: string, path: string): Promise<WikiPage> {
    const authHeader = await this.getAuthHeader();
    const encodedPath = encodeURIComponent(path);
    const response = await fetch(
      `${this.baseUrl}/${wikiIdentifier}/pages?path=${encodedPath}&api-version=7.0`,
      {
        headers: {
          Authorization: authHeader,
        },
      }
    );

    if (response.status === 404) {
      if (response.statusText.includes('Wiki not found')) {
        throw new WikiNotFoundError(wikiIdentifier);
      }
      throw new WikiPageNotFoundError(wikiIdentifier, path);
    }

    if (!response.ok) {
      throw new WikiError(
        `Failed to get wiki page: ${response.statusText}`,
        response.status,
        wikiIdentifier,
        path,
        await response.text()
      );
    }

    return response.json();
  }

  async searchWikiPages(wikiIdentifier: string, searchText: string, projectName: string, top: number = 20): Promise<any> {
    const authHeader = await this.getAuthHeader();
    const encodedSearchText = encodeURIComponent(searchText);
    
    // Use the search endpoint
    const response = await fetch(
      `${this.config.orgUrl}/${projectName}/_apis/wiki/wikis/${wikiIdentifier}/searchResults?searchText=${encodedSearchText}&top=${top}&api-version=7.0`,
      {
        headers: {
          Authorization: authHeader,
        },
      }
    );

    if (response.status === 404) {
      if (response.statusText.includes('Wiki not found')) {
        throw new WikiNotFoundError(wikiIdentifier);
      }
      throw new WikiError(
        `Failed to search wiki pages: ${response.statusText}`,
        response.status,
        wikiIdentifier,
        undefined,
        await response.text()
      );
    }

    if (!response.ok) {
      throw new WikiError(
        `Failed to search wiki pages: ${response.statusText}`,
        response.status,
        wikiIdentifier,
        undefined,
        await response.text()
      );
    }

    return response.json();
  }

  async updateWikiPage(
    wikiIdentifier: string,
    path: string,
    content: string,
    comment?: string
  ): Promise<WikiPageUpdateResponse> {
    const authHeader = await this.getAuthHeader();
    const encodedPath = encodeURIComponent(path);
    const response = await fetch(
      `${this.baseUrl}/${wikiIdentifier}/pages?path=${encodedPath}&api-version=7.0`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
        },
        body: JSON.stringify({
          content,
          comment: comment || `Updated page ${path}`,
        }),
      }
    );

    if (response.status === 404) {
      if (response.statusText.includes('Wiki not found')) {
        throw new WikiNotFoundError(wikiIdentifier);
      }
      throw new WikiPageNotFoundError(wikiIdentifier, path);
    }

    if (!response.ok) {
      throw new WikiError(
        `Failed to update wiki page: ${response.statusText}`,
        response.status,
        wikiIdentifier,
        path,
        await response.text()
      );
    }

    return response.json();
  }
}