import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { AzureDevOpsConnection } from '../../api/connection.js';
import { AzureDevOpsConfig } from '../../config/environment.js';

interface GetWikiPageArgs {
  wikiIdentifier: string;
  path: string;
  version?: string;
  includeContent?: boolean;
}

interface ListWikiPagesArgs {
  wikiIdentifier: string;
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

  AzureDevOpsConnection.initialize(config);
  const connection = AzureDevOpsConnection.getInstance();
  const wikiApi = await connection.getWikiApi();

  try {
    // Get wiki information to verify it exists
    const wiki = await wikiApi.getWiki(config.project, args.wikiIdentifier);
    if (!wiki || !wiki.id) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Wiki ${args.wikiIdentifier} not found`
      );
    }

    // Create request parameters for getting wiki pages
    const pagesBatchRequest = {
      pageViewsForDays: args.pageViewsForDays || 30,
      top: args.top || 100,
      continuationToken: args.continuationToken
    };

    // Get wiki pages
    const wikiPages = await wikiApi.getPagesBatch(pagesBatchRequest, config.project, args.wikiIdentifier);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(wikiPages, null, 2),
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

  AzureDevOpsConnection.initialize(config);
  const connection = AzureDevOpsConnection.getInstance();
  const wikiApi = await connection.getWikiApi();

  try {
    // Get wiki information
    const wiki = await wikiApi.getWiki(config.project, args.wikiIdentifier);
    if (!wiki || !wiki.id) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Wiki ${args.wikiIdentifier} not found`
      );
    }

    // For now, we can only return the wiki information since the page API is not available
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            id: wiki.id,
            name: wiki.name,
            path: args.path,
            message: 'Wiki page content retrieval is not supported in the current API version'
          }, null, 2),
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