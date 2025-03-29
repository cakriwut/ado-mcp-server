import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { AzureDevOpsConnection } from '../../api/connection.js';
import { AzureDevOpsConfig } from '../../config/environment.js';
import { WikiApi } from '../../api/wiki.js';
import { processEscapeSequences } from '../../utils/index.js';

interface CreateWikiPageArgs {
  wikiIdentifier: string;
  path: string;
  content: string;
  comment?: string;
  projectName?: string;
}

export async function createWikiPage(args: CreateWikiPageArgs, config: AzureDevOpsConfig) {
  if (!args.wikiIdentifier || !args.path || !args.content) {
    throw new McpError(
      ErrorCode.InvalidParams,
      'Wiki identifier, page path, and content are required'
    );
  }

  AzureDevOpsConnection.initialize(config);
  const wikiApi = AzureDevOpsConnection.getWikiApi();

  try {
    // Use the project name from args if provided, otherwise use the one from config
    const projectName = args.projectName || config.project;
    
    // We'll directly try to create/update the page
    // If the wiki doesn't exist, the updateWikiPage method will throw an appropriate error
    
    // Process escape sequences in the content
    const processedContent = processEscapeSequences(args.content);
    
    console.log(`Processing content with escape sequences. Original length: ${args.content.length}, Processed length: ${processedContent.length}`);
    
    // Use the updateWikiPage method to create a new page
    // In Azure DevOps, the PUT operation will create the page if it doesn't exist
    const createdPage = await wikiApi.updateWikiPage(
      args.wikiIdentifier,
      args.path,
      processedContent,
      args.comment || `Created page ${args.path}`
    );
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(createdPage, null, 2),
        },
      ],
    };
  } catch (error: unknown) {
    if (error instanceof McpError) throw error;
    
    // If the error is "Wiki not found", add a more helpful message
    if (error instanceof Error && error.message.includes('Wiki not found')) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Wiki ${args.wikiIdentifier} not found. Make sure to provide the correct projectName parameter.`
      );
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to create wiki page: ${errorMessage}`
    );
  }
}