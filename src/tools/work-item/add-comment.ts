import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { AzureDevOpsConnection } from '../../api/connection.js';
import { AzureDevOpsConfig } from '../../config/environment.js';

/**
 * Add a comment to a work item
 * @param args - The arguments for adding a comment
 * @param config - The Azure DevOps configuration
 * @returns The added comment
 */
export async function addWorkItemComment(args: { id: number; text: string }, config: AzureDevOpsConfig) {
  if (!args.id) {
    throw new McpError(ErrorCode.InvalidParams, 'Work item ID is required');
  }

  if (!args.text || args.text.trim() === '') {
    throw new McpError(ErrorCode.InvalidParams, 'Comment text is required');
  }

  AzureDevOpsConnection.initialize(config);
  const connection = AzureDevOpsConnection.getInstance();
  const workItemTrackingApi = await connection.getWorkItemTrackingApi();

  try {
    // Add the comment to the work item
    const comment = await workItemTrackingApi.addComment({
      text: args.text
    }, config.project, args.id);

    // Return the comment information
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            id: comment.id,
            text: comment.text,
            workItemId: args.id,
            createdBy: comment.createdBy ? {
              displayName: comment.createdBy.displayName,
              id: comment.createdBy.id,
              uniqueName: comment.createdBy.uniqueName
            } : null,
            createdDate: comment.createdDate,
            url: comment.url
          }, null, 2),
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new McpError(ErrorCode.InvalidParams, `Failed to add comment to work item ${args.id}: ${errorMessage}`);
  }
}