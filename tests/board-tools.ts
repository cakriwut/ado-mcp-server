import { getWorkApi, project } from './utils.js';

// Ensure project is defined
if (!project) {
  throw new Error('Project is not defined in environment variables');
}

// Use a non-null assertion since we've already checked that project is defined
const projectName = project!;

/**
 * Test for get_boards tool
 * This tool retrieves all boards in a project
 */
async function testGetBoards() {
  try {
    console.log('Testing get_boards tool...');
    
    const workApi = await getWorkApi();
    
    // Get all team project references
    const teamContext = {
      project: projectName,
      team: `${projectName} Team` // Default team name
    };
    
    // Get all boards (team settings)
    const boards = await workApi.getBoards(teamContext);
    
    console.log(`Successfully retrieved ${boards.length} boards:`);
    console.log(JSON.stringify(boards, null, 2));
    
    return boards;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error testing get_boards:', errorMessage);
    throw error;
  }
}

// Run the tests
async function runTests() {
  try {
    // Uncomment the test you want to run
    // await testGetBoards();
    
    console.log('All board tool tests completed');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error running board tool tests:', errorMessage);
  }
}

// Run the tests if this file is executed directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  runTests();
}

export {
  testGetBoards
};