import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import * as azdev from 'azure-devops-node-api';
import { AzureDevOpsConnection } from '../../api/connection.js';
import { AzureDevOpsConfig } from '../../config/environment.js';
import fetch from 'node-fetch';

interface GetWikiPageArgs {
  wikiIdentifier: string;
  path: string;
  projectName?: string;
  version?: string;
  includeContent?: boolean;
}

interface ListWikiPagesArgs {
  wikiIdentifier: string;
  projectName?: string;
  pageViewsForDays?: number;
  top?: number;
  continuationToken?: string;
}

export async function getWikis(args: Record<string, never>, config: AzureDevOpsConfig) {
  AzureDevOpsConnection.initialize(config);
  const connection = AzureDevOpsConnection.getInstance();
  const wikiApi = await connection.getWikiApi();
  
  const wikis = await wikiApi.getAllWikis(config.project);

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(wikis, null, 2),
      },
    ],
  };
}

export async function listWikiPages(args: ListWikiPagesArgs, config: AzureDevOpsConfig) {
  if (!args.wikiIdentifier) {
    throw new McpError(
      ErrorCode.InvalidParams,
      'Wiki identifier is required'
    );
  }

  try {
    // Initialize the connection
    AzureDevOpsConnection.initialize(config);
    const connection = AzureDevOpsConnection.getInstance();
    
    // Get the Wiki API directly from the Azure DevOps Node API
    const wikiApi = await connection.getWikiApi();
    
    // Create request parameters for getting wiki pages
    const pagesBatchRequest = {
      pageViewsForDays: args.pageViewsForDays || 30,
      top: args.top || 20,
      continuationToken: args.continuationToken
    };

    // Use the project name from args if provided, otherwise use the one from config
    const projectName = args.projectName || config.project;
    
    // Get wiki pages using the Azure DevOps Node API directly
    const wikiPages = await wikiApi.getPagesBatch(pagesBatchRequest, projectName, args.wikiIdentifier);

    // Extract only the required fields from each wiki page
    const formattedPages = wikiPages.map((page: any) => ({
      path: page.path,
      id: page.id,
      wikiIdentifier: args.wikiIdentifier,
      projectName: projectName
    }));

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(formattedPages, null, 2),
        },
      ],
    };
  } catch (error: unknown) {
    if (error instanceof McpError) throw error;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to get wiki pages: ${errorMessage}`
    );
  }
}

export async function getWikiPage(args: GetWikiPageArgs, config: AzureDevOpsConfig) {
  if (!args.wikiIdentifier || !args.path) {
    throw new McpError(
      ErrorCode.InvalidParams,
      'Wiki identifier and page path are required'
    );
  }

  try {
    // Initialize the connection
    AzureDevOpsConnection.initialize(config);
    const connection = AzureDevOpsConnection.getInstance();
    
    // Use the project name from args if provided, otherwise use the one from config
    const projectName = args.projectName || config.project;
    
    // Use fetch API directly to avoid circular structure issues
    const baseUrl = `https://dev.azure.com/${config.org}/${projectName}/_apis/wiki/wikis/${args.wikiIdentifier}`;
    const token = Buffer.from(`:${config.pat}`).toString('base64');
    const authHeader = `Basic ${token}`;
    
    // First verify the wiki exists
    const wikiResponse = await fetch(`${baseUrl}?api-version=7.0`, {
      headers: {
        Authorization: authHeader,
      },
    });
    
    if (!wikiResponse.ok) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Wiki ${args.wikiIdentifier} not found`
      );
    }
    
    const wiki = await wikiResponse.json();
    
    // Create response object
    const responseObj: any = {
      id: wiki.id,
      name: wiki.name,
      path: args.path,
      projectName: projectName,
      version: args.version || "latest"
    };
    
    // Try to get the wiki page content if requested
    if (args.includeContent) {
      try {
        const encodedPath = encodeURIComponent(args.path);
        const pageResponse = await fetch(
          `${baseUrl}/pages?path=${encodedPath}&includeContent=true&api-version=7.0`,
          {
            headers: {
              Authorization: authHeader,
            },
          }
        );
        
        if (pageResponse.ok) {
          const pageData = await pageResponse.json();
          responseObj.content = pageData.content || "No content available";
        } else {
          responseObj.contentStatus = `Failed to retrieve content: ${pageResponse.statusText}`;
        }
      } catch (pageError) {
        // If we can't get the page content, add an error message
        responseObj.contentStatus = "Failed to retrieve content";
        responseObj.contentError = pageError instanceof Error ? pageError.message : String(pageError);
      }
    } else {
      // If content is not requested, just indicate that it's available
      responseObj.contentStatus = "Content available but not requested";
    }
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(responseObj, null, 2),
        },
      ],
    };
  } catch (error: unknown) {
    if (error instanceof McpError) throw error;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to get wiki page: ${errorMessage}`
    );
  }
}