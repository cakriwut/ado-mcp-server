import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { AzureDevOpsConnection } from '../../api/connection.js';
import { AzureDevOpsConfig } from '../../config/environment.js';
import { WorkItemBatchGetRequest, WorkItemExpand, WorkItemErrorPolicy } from 'azure-devops-node-api/interfaces/WorkItemTrackingInterfaces.js';

export async function getWorkItem(args: WorkItemBatchGetRequest, config: AzureDevOpsConfig) {
  if (!args.ids || !args.ids.length) {
    throw new McpError(ErrorCode.InvalidParams, 'Invalid work item ID');
  }

  AzureDevOpsConnection.initialize(config);
  const connection = AzureDevOpsConnection.getInstance();
  const workItemTrackingApi = await connection.getWorkItemTrackingApi();
  
  // Determine whether to use fields or expand
  let fieldsToUse = undefined;
  let expandToUse = undefined;
  
  if (args.fields) {
    // If fields are explicitly provided, use them and don't use expand
    fieldsToUse = args.fields;
    expandToUse = undefined;
  } else {
    // If fields are not provided, use expand
    fieldsToUse = undefined;
    expandToUse = args.$expand !== undefined ? args.$expand : WorkItemExpand.All;
  }
  
  const workItems = await workItemTrackingApi.getWorkItems(
    args.ids,
    fieldsToUse,
    args.asOf,
    expandToUse,
    args.errorPolicy,
    config.project
  );

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(workItems, null, 2),
      },
    ],
  };
}