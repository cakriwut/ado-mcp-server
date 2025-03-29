import { getWorkItemApi, project } from './utils.js';

// Ensure project is defined
if (!project) {
  throw new Error('Project is not defined in environment variables');
}

// Use a non-null assertion since we've already checked that project is defined
const projectName = project;

/**
 * Test for get_work_item_comments tool
 * This tool retrieves comments from a work item
 */
async function testGetWorkItemComments() {
  try {
    console.log('Testing get_work_item_comments tool...');
    
    const workItemApi = await getWorkItemApi();
    
    // Example work item ID - replace with a valid ID in your project
    const workItemId = 52; // Using work item ID 52 as specified in the task
    
    // Get comments from the work item
    const comments = await workItemApi.getComments(projectName, workItemId);
    
    console.log(`Successfully retrieved comments from work item ${workItemId}:`);
    console.log(`Total comments: ${comments.count}`);
    
    if (comments.comments && comments.comments.length > 0) {
      console.log('Latest comments:');
      // Display the latest 5 comments or all if less than 5
      const latestComments = comments.comments.slice(-5);
      latestComments.forEach((comment, index) => {
        console.log(`Comment ${index + 1}:`);
        console.log(`  ID: ${comment.id}`);
        console.log(`  Text: ${comment.text}`);
        console.log(`  Created by: ${comment.createdBy?.displayName || 'Unknown'}`);
        console.log(`  Created date: ${comment.createdDate}`);
        console.log('---');
      });
    } else {
      console.log('No comments found for this work item');
    }
    
    return comments;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error testing get_work_item_comments:', errorMessage);
    throw error;
  }
}

// Run the test
async function runTest() {
  try {
    await testGetWorkItemComments();
    console.log('Work item get comments test completed');
  } catch (error) {
    console.error('Error running work item get comments test:', error);
  }
}

// Run the test if this file is executed directly
runTest();

export {
  testGetWorkItemComments
};