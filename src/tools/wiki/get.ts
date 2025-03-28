import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import * as azdev from 'azure-devops-node-api';
import { AzureDevOpsConnection } from '../../api/connection.js';
import { AzureDevOpsConfig } from '../../config/environment.js';

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
    const authHandler = azdev.getPersonalAccessTokenHandler(config.pat);
    const connection = new azdev.WebApi(`https://dev.azure.com/${config.org}`, authHandler);
    
    // Get the Wiki API directly from the Azure DevOps Node API
    const wikiApi = await connection.getWikiApi();
    
    // Use the project name from args if provided, otherwise use the one from config
    const projectName = args.projectName || config.project;
    
    // First get all wikis to verify the wiki exists
    const wikis = await wikiApi.getAllWikis(projectName);
    const wiki = wikis.find(w => w.id === args.wikiIdentifier);
    
    if (!wiki || !wiki.id) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Wiki ${args.wikiIdentifier} not found`
      );
    }

    // Try to get the wiki page
    try {
      const wikiPage = await wikiApi.getPageText(
        projectName,
        args.wikiIdentifier,
        args.path
      );

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              id: wiki.id,
              name: wiki.name,
              path: args.path,
              projectName: projectName,
              content: wikiPage ? "Content retrieved successfully" : "No content available",
              version: args.version || "latest"
            }, null, 2),
          },
        ],
      };
    } catch (pageError) {
      // If we can't get the page content, just return the wiki information
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              id: wiki.id,
              name: wiki.name,
              path: args.path,
              projectName: projectName,
              message: 'Wiki page content retrieval failed, but wiki exists',
              error: pageError instanceof Error ? pageError.message : String(pageError)
            }, null, 2),
          },
        ],
      };
    }
  } catch (error: unknown) {
    if (error instanceof McpError) throw error;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to get wiki page: ${errorMessage}`
    );
  }
}