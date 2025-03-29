import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { AzureDevOpsConnection } from '../../api/connection.js';
import { AzureDevOpsConfig } from '../../config/environment.js';

/**
 * Get comments from a work item
 * @param args - The arguments for getting comments
 * @param config - The Azure DevOps configuration
 * @returns The comments from the work item
 */
export async function getWorkItemComments(args: { id: number }, config: AzureDevOpsConfig) {
  if (!args.id) {
    throw new McpError(ErrorCode.InvalidParams, 'Work item ID is required');
  }

  AzureDevOpsConnection.initialize(config);
  const connection = AzureDevOpsConnection.getInstance();
  const workItemTrackingApi = await connection.getWorkItemTrackingApi();

  try {
    // Get the comments from the work item
    const comments = await workItemTrackingApi.getComments(config.project, args.id);

    // Format the comments for the response
    const formattedComments = comments.comments?.map(comment => ({
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
    })) || [];

    // Return the comments
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            count: formattedComments.length,
            comments: formattedComments
          }, null, 2),
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new McpError(ErrorCode.InvalidParams, `Failed to get comments from work item ${args.id}: ${errorMessage}`);
  }
}