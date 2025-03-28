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

interface SearchWikiPageArgs {
  wikiIdentifier: string;
  searchText: string;
  projectName?: string;
  top?: number;
  includeContent?: boolean;
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

export async function searchWikiPage(args: SearchWikiPageArgs, config: AzureDevOpsConfig) {
  if (!args.wikiIdentifier || !args.searchText) {
    throw new McpError(
      ErrorCode.InvalidParams,
      'Wiki identifier and search text are required'
    );
  }

  try {
    // Initialize the connection
    AzureDevOpsConnection.initialize(config);
    const connection = AzureDevOpsConnection.getInstance();
    
    // Use the project name from args if provided, otherwise use the one from config
    const projectName = args.projectName || config.project;
    
    console.log(`Searching for "${args.searchText}" in wiki "${args.wikiIdentifier}" in project "${projectName}"`);
    
    // Get the wiki API
    const wikiApi = await connection.getWikiApi();
    
    // First, get all wiki pages
    const pagesBatchRequest = {
      pageViewsForDays: 30,
      top: 100, // Get a larger number of pages to search through
      continuationToken: undefined
    };
    
    console.log(`Getting wiki pages for wiki ${args.wikiIdentifier}...`);
    const wikiPages = await wikiApi.getPagesBatch(pagesBatchRequest, projectName, args.wikiIdentifier);
    console.log(`Retrieved ${wikiPages.length} wiki pages`);
    
    // Create a case-insensitive regex for the search text
    const searchRegex = new RegExp(args.searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    
    // Array to store matching pages
    const matchingPages: any[] = [];
    
    // For each page, check if it matches the search text
    for (const page of wikiPages) {
      // Check if the path matches (handle undefined path)
      const pagePath = page.path || '';
      const pathMatches = searchRegex.test(pagePath);
      
      let contentMatches = false;
      let content = null;
      
      // If includeContent is true or the path doesn't match, check the content
      if (args.includeContent || !pathMatches) {
        try {
          // Get the page content
          const token = Buffer.from(`:${config.pat}`).toString('base64');
          const authHeader = `Basic ${token}`;
          const baseUrl = `https://dev.azure.com/${config.org}/${projectName}/_apis/wiki/wikis/${args.wikiIdentifier}`;
          const encodedPath = encodeURIComponent(pagePath);
          
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
            content = pageData.content;
            
            // Check if content matches
            if (content) {
              contentMatches = searchRegex.test(content);
            }
          }
        } catch (pageError) {
          console.error(`Error getting content for page ${page.path}:`, pageError);
        }
      }
      
      // If either the path or content matches, add to results
      if (pathMatches || contentMatches) {
        const matchingPage: any = {
          id: page.id,
          path: pagePath,
          wikiIdentifier: args.wikiIdentifier,
          projectName: projectName,
          matchType: pathMatches ? (contentMatches ? 'path_and_content' : 'path') : 'content',
          fileName: pagePath.split('/').pop() || 'Unknown'
        };
        
        // Include content if requested
        if (args.includeContent && content) {
          matchingPage.content = content;
        }
        
        matchingPages.push(matchingPage);
        
        // If we've reached the requested number of results, stop
        if (matchingPages.length >= (args.top || 20)) {
          break;
        }
      }
    }
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            count: matchingPages.length,
            searchText: args.searchText,
            results: matchingPages
          }, null, 2),
        },
      ],
    };
  } catch (error: unknown) {
    if (error instanceof McpError) throw error;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in searchWikiPage:', errorMessage);
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to search wiki pages: ${errorMessage}`
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