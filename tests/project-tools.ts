import { getCoreApi } from './utils.js';

/**
 * Test for list_projects tool
 * This tool retrieves all projects in the Azure DevOps organization
 */
async function testListProjects() {
  try {
    console.log('Testing list_projects tool...');
    
    const coreApi = await getCoreApi();
    
    // Get all projects
    const projects = await coreApi.getProjects();
    
    console.log(`Successfully retrieved ${projects.length} projects:`);
    console.log(JSON.stringify(projects.slice(0, 5), null, 2)); // Show only first 5 for brevity
    
    return projects;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error testing list_projects:', errorMessage);
    throw error;
  }
}

// Run the tests
async function runTests() {
  try {
    // Uncomment the test you want to run
    // await testListProjects();
    
    console.log('All project tool tests completed');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error running project tool tests:', errorMessage);
  }
}

// Run the tests if this file is executed directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  runTests();
}

// Export functions
export {
  testListProjects
};