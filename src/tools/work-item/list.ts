import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { AzureDevOpsConnection } from '../../api/connection.js';
import { AzureDevOpsConfig } from '../../config/environment.js';
import { Wiql } from 'azure-devops-node-api/interfaces/WorkItemTrackingInterfaces.js';

// Extended interface to include pagination parameters
export interface WorkItemListArgs extends Wiql {
  page?: number;
}

export async function listWorkItems(args: WorkItemListArgs, config: AzureDevOpsConfig) {
  if (!args.query) {
    throw new McpError(ErrorCode.InvalidParams, 'Invalid WIQL query');
  }

  AzureDevOpsConnection.initialize(config);
  const connection = AzureDevOpsConnection.getInstance();
  const workItemTrackingApi = await connection.getWorkItemTrackingApi();
  
  const queryResult = await workItemTrackingApi.queryByWiql(
    args,
    { project: config.project }
  );

  // Get the page number (default to 1 if not provided)
  const page = args.page || 1;
  const pageSize = 10;
  
  // Extract the work item IDs from the query result and filter out undefined values
  const workItemIds = (queryResult.workItems?.map(wi => wi.id).filter(id => id !== undefined) as number[]) || [];
  
  // Calculate total pages
  const totalItems = workItemIds.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  
  // Calculate start and end indices for the current page
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  
  // Get the IDs for the current page
  const pagedIds = workItemIds.slice(startIndex, endIndex);
  
  // If no work items found for this page, return empty result with pagination metadata
  if (pagedIds.length === 0) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            asof: new Date().toISOString(),
            workItems: [],
            pagination: {
              page,
              pageSize,
              totalItems,
              totalPages,
              hasNextPage: page < totalPages,
              hasPreviousPage: page > 1
            }
          }, null, 2),
        },
      ],
    };
  }

  // Get the work items with the fields we need
  const workItems = await workItemTrackingApi.getWorkItems(
    pagedIds,
    ['System.Id', 'System.State', 'System.Title']
  );

  // Format the result with only the requested fields
  const formattedResult = {
    asof: new Date().toISOString(),
    workItems: workItems.map(item => ({
      id: item.id,
      state: item.fields?.['System.State'] || 'Unknown',
      title: item.fields?.['System.Title'] || 'Untitled',
      url: item._links?.html?.href || `${config.orgUrl}/${config.project}/_workitems/edit/${item.id}`
    })),
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    }
  };

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(formattedResult, null, 2),
      },
    ],
  };
}