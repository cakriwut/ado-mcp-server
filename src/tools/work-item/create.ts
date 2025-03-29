import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { AzureDevOpsConnection } from '../../api/connection.js';
import { AzureDevOpsConfig } from '../../config/environment.js';
import { JsonPatchOperation } from 'azure-devops-node-api/interfaces/common/VSSInterfaces.js';

export async function createWorkItem(args: { type: string; document: JsonPatchOperation[] }, config: AzureDevOpsConfig) {
  if (!args.type || !args.document || !args.document.length) {
    throw new McpError(ErrorCode.InvalidParams, 'Work item type and patch document are required');
  }

  AzureDevOpsConnection.initialize(config);
  const connection = AzureDevOpsConnection.getInstance();
  const workItemTrackingApi = await connection.getWorkItemTrackingApi();

  const workItem = await workItemTrackingApi.createWorkItem(
    undefined,
    args.document,
    config.project,
    args.type
  );

  // Filter CreatedBy and AssignedTo to only include specific fields
  const filterPerson = (person: any) => {
    if (!person) return null;
    return {
      displayName: person.displayName,
      id: person.id,
      url: person.url,
      uniqueName: person.uniqueName,
      descriptor: person.descriptor
    };
  };

  // Extract only the requested fields
  const filteredWorkItem = {
    id: workItem.id,
    rev: workItem.rev,
    TeamProject: workItem.fields?.['System.TeamProject'],
    Area: workItem.fields?.['System.AreaPath'],
    Iteration: workItem.fields?.['System.IterationPath'],
    Title: workItem.fields?.['System.Title'],
    Description: workItem.fields?.['System.Description'],
    State: workItem.fields?.['System.State'],
    Url: workItem.url,
    CreatedBy: filterPerson(workItem.fields?.['System.CreatedBy']),
    CreatedDate: workItem.fields?.['System.CreatedDate'],
    AssignedTo: filterPerson(workItem.fields?.['System.AssignedTo'])
  };

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(filteredWorkItem, null, 2),
      },
    ],
  };
}