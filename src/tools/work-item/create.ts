import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { AzureDevOpsConnection } from '../../api/connection.js';
import { AzureDevOpsConfig } from '../../config/environment.js';
import { JsonPatchOperation } from 'azure-devops-node-api/interfaces/common/VSSInterfaces.js';
import { processEscapeSequences } from '../../utils/index.js';

export async function createWorkItem(args: { type: string; document: JsonPatchOperation[] }, config: AzureDevOpsConfig) {
  if (!args.type || !args.document || !args.document.length) {
    throw new McpError(ErrorCode.InvalidParams, 'Work item type and patch document are required');
  }

  AzureDevOpsConnection.initialize(config);
  const connection = AzureDevOpsConnection.getInstance();
  const workItemTrackingApi = await connection.getWorkItemTrackingApi();

  // Process escape sequences in text fields of the document
  const processedDocument = args.document.map(operation => {
    // Check if the operation type is add or replace
    if (operation.op && (operation.op === 'add' || operation.op === 'replace')) {
      // Check if the value is a string and process escape sequences
      if (typeof operation.value === 'string') {
        return {
          ...operation,
          value: processEscapeSequences(operation.value)
        };
      }
    }
    return operation;
  });

  console.log('Processing escape sequences in work item document');

  const workItem = await workItemTrackingApi.createWorkItem(
    undefined,
    processedDocument,
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