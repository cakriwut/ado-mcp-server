import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { AzureDevOpsConnection } from '../../api/connection.js';
import { AzureDevOpsConfig } from '../../config/environment.js';
import { WikiType } from 'azure-devops-node-api/interfaces/WikiInterfaces.js';

interface CreateWikiArgs {
  name: string;
  projectId?: string;
  mappedPath?: string;
}

export async function createWiki(args: CreateWikiArgs, config: AzureDevOpsConfig) {
  if (!args.name) {
    throw new McpError(ErrorCode.InvalidParams, 'Wiki name is required');
  }

  AzureDevOpsConnection.initialize(config);
  const connection = AzureDevOpsConnection.getInstance();
  const wikiApi = await connection.getWikiApi();

  try {
    const wikiCreateParams: any = {
      name: args.name,
      projectId: args.projectId || config.project,
      type: WikiType.ProjectWiki,
    };

    // Only add mappedPath for non-ProjectWiki types or if explicitly provided
    if (args.mappedPath && wikiCreateParams.type !== WikiType.ProjectWiki) {
      wikiCreateParams.mappedPath = args.mappedPath;
    }

    const wiki = await wikiApi.createWiki(wikiCreateParams, config.project);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(wiki, null, 2),
        },
      ],
    };
  } catch (error: unknown) {
    if (error instanceof McpError) throw error;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to create wiki: ${errorMessage}`
    );
  }
}