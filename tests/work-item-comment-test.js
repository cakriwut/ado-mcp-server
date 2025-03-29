import { getWorkItemApi, project } from './utils.js';

// Ensure project is defined
if (!project) {
  throw new Error('Project is not defined in environment variables');
}

// Use a non-null assertion since we've already checked that project is defined
const projectName = project;

/**
 * Test for add_work_item_comment tool
 * This tool adds a comment to a work item
 */
async function testAddWorkItemComment() {
  try {
    console.log('Testing add_work_item_comment tool...');
    
    const workItemApi = await getWorkItemApi();
    
    // Example work item ID - replace with a valid ID in your project
    const workItemId = 52; // Using work item ID 52 as specified in the task
    
    // Add a comment to the work item
    const comment = await workItemApi.addComment(
      {
        text: "This is a test comment added by the MCP tool"
      },
      projectName,
      workItemId
    );
    
    console.log(`Successfully added comment to work item ${workItemId}:`);
    console.log(JSON.stringify(comment, null, 2));
    
    return comment;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error testing add_work_item_comment:', errorMessage);
    throw error;
  }
}

// Run the test
async function runTest() {
  try {
    await testAddWorkItemComment();
    console.log('Work item comment test completed');
  } catch (error) {
    console.error('Error running work item comment test:', error);
  }
}

// Run the test if this file is executed directly
runTest();

export {
  testAddWorkItemComment
};