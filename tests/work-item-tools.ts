import { getWorkItemApi, project } from './utils.js';

// Ensure project is defined
if (!project) {
  throw new Error('Project is not defined in environment variables');
}

// Use a non-null assertion since we've already checked that project is defined
const projectName = project!;

/**
 * Test for get_work_item tool
 * This tool retrieves work items by their IDs
 */
async function testGetWorkItem() {
  try {
    console.log('Testing get_work_item tool...');
    
    const workItemApi = await getWorkItemApi();
    
    // Example work item ID - replace with a valid ID in your project
    const workItemId = 1;
    
    const workItem = await workItemApi.getWorkItem(
      workItemId,
      undefined,
      undefined,
      undefined,
      projectName
    );
    
    console.log(`Successfully retrieved work item ${workItemId}:`);
    console.log(JSON.stringify(workItem, null, 2));
    
    return workItem;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error testing get_work_item:', errorMessage);
    throw error;
  }
}

/**
 * Test for list_work_items tool
 * This tool lists work items based on a WIQL query
 */
async function testListWorkItems() {
  try {
    console.log('Testing list_work_items tool...');
    
    const workItemApi = await getWorkItemApi();
    
    // Example WIQL query to get recent work items
    const wiql = {
      query: `SELECT [System.Id], [System.Title], [System.State]
              FROM WorkItems
              WHERE [System.TeamProject] = '${projectName}'
              ORDER BY [System.ChangedDate] DESC`
    };
    
    const queryResult = await workItemApi.queryByWiql(wiql, { project: projectName });
    
    if (queryResult.workItems && queryResult.workItems.length > 0) {
      console.log(`Found ${queryResult.workItems.length} work items:`);
      console.log(JSON.stringify(queryResult.workItems.slice(0, 5), null, 2));
    } else {
      console.log('No work items found');
    }
    
    return queryResult;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error testing list_work_items:', errorMessage);
    throw error;
  }
}

/**
 * Test for create_work_item tool
 * This tool creates a new work item using JSON patch operations
 */
async function testCreateWorkItem() {
  try {
    console.log('Testing create_work_item tool...');
    
    const workItemApi = await getWorkItemApi();
    
    // Example document for creating a task
    const document = [
      {
        op: 'add',
        path: '/fields/System.Title',
        value: 'Test Task Created by MCP Tool'
      },
      {
        op: 'add',
        path: '/fields/System.Description',
        value: 'This is a test task created by the MCP tool test script'
      },
      {
        op: 'add',
        path: '/fields/System.Tags',
        value: 'Test;MCP;Automation'
      }
    ];
    
    const workItem = await workItemApi.createWorkItem(
      undefined,
      document,
      projectName,
      'Task'
    );
    
    console.log('Successfully created work item:');
    console.log(JSON.stringify(workItem, null, 2));
    
    return workItem;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error testing create_work_item:', errorMessage);
    throw error;
  }
}

/**
 * Test for update_work_item tool
 * This tool updates an existing work item using JSON patch operations
 */
async function testUpdateWorkItem() {
  try {
    console.log('Testing update_work_item tool...');
    
    // First create a work item to update
    const workItem = await testCreateWorkItem();
    
    if (!workItem || !workItem.id) {
      throw new Error('Failed to create work item for update test');
    }
    
    const workItemApi = await getWorkItemApi();
    
    // Example document for updating the task
    const document = [
      {
        op: 'replace',
        path: '/fields/System.Title',
        value: 'Updated Test Task by MCP Tool'
      },
      {
        op: 'replace',
        path: '/fields/System.State',
        value: 'Doing'
      }
    ];
    
    const updatedWorkItem = await workItemApi.updateWorkItem(
      undefined,
      document,
      workItem.id
    );
    
    console.log(`Successfully updated work item ${workItem.id}:`);
    console.log(JSON.stringify(updatedWorkItem, null, 2));
    
    return updatedWorkItem;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error testing update_work_item:', errorMessage);
    throw error;
  }
}

// Run the tests
async function runTests() {
  try {
    // Uncomment the tests you want to run
    // await testGetWorkItem();
    // await testListWorkItems();
    // await testCreateWorkItem();
    // await testUpdateWorkItem();
    
    console.log('All work item tool tests completed');
  } catch (error) {
    console.error('Error running work item tool tests:', error);
  }
}

// Run the tests if this file is executed directly
// Using import.meta.url to detect if this is the main module
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  runTests();
}

export {
  testGetWorkItem,
  testListWorkItems,
  testCreateWorkItem,
  testUpdateWorkItem
};