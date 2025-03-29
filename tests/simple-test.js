// Import required modules
import dotenv from 'dotenv';
import * as azdev from 'azure-devops-node-api';

// Load environment variables from .env file
dotenv.config();

// Get environment variables
const orgUrl = `https://dev.azure.com/${process.env.AZURE_DEVOPS_ORG}`;
const token = process.env.AZURE_DEVOPS_PAT;
const project = process.env.AZURE_DEVOPS_PROJECT;

// Validate environment variables
if (!token) {
  console.error('Error: AZURE_DEVOPS_PAT environment variable is not set');
  process.exit(1);
}

if (!process.env.AZURE_DEVOPS_ORG) {
  console.error('Error: AZURE_DEVOPS_ORG environment variable is not set');
  process.exit(1);
}

if (!project) {
  console.error('Error: AZURE_DEVOPS_PROJECT environment variable is not set');
  process.exit(1);
}

console.log(`Using organization: ${process.env.AZURE_DEVOPS_ORG}`);
console.log(`Using project: ${project}`);

// Create a connection to Azure DevOps
const authHandler = azdev.getPersonalAccessTokenHandler(token);
const connection = new azdev.WebApi(orgUrl, authHandler);

// Test functions
async function testListProjects() {
  try {
    console.log('\n=== Testing list_projects ===');
    
    const coreApi = await connection.getCoreApi();
    
    // Get all projects
    const projects = await coreApi.getProjects();
    
    console.log(`Successfully retrieved ${projects.length} projects:`);
    console.log(JSON.stringify(projects.slice(0, 2), null, 2)); // Show only first 2 for brevity
    
    return projects;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error testing list_projects: ${errorMessage}`);
    throw error;
  }
}

async function testGetBoards() {
  try {
    console.log('\n=== Testing get_boards ===');
    
    const workApi = await connection.getWorkApi();
    
    // Get all team project references
    const teamContext = {
      project: project,
      team: `${project} Team` // Default team name
    };
    
    // Get all boards (team settings)
    const boards = await workApi.getBoards(teamContext);
    
    console.log(`Successfully retrieved ${boards.length} boards:`);
    console.log(JSON.stringify(boards.slice(0, 2), null, 2)); // Show only first 2 for brevity
    
    return boards;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error testing get_boards: ${errorMessage}`);
    throw error;
  }
}

async function testGetWikis() {
  try {
    console.log('\n=== Testing get_wikis ===');
    
    const wikiApi = await connection.getWikiApi();
    
    // Get all wikis in the project
    const wikis = await wikiApi.getAllWikis(project);
    
    console.log(`Successfully retrieved ${wikis.length} wikis:`);
    console.log(JSON.stringify(wikis.slice(0, 2), null, 2)); // Show only first 2 for brevity
    
    return wikis;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error testing get_wikis: ${errorMessage}`);
    throw error;
  }
}

async function testListPipelines() {
  try {
    console.log('\n=== Testing list_pipelines ===');
    
    const buildApi = await connection.getBuildApi();
    
    // Get all pipelines (build definitions)
    const pipelines = await buildApi.getDefinitions(project);
    
    console.log(`Successfully retrieved ${pipelines.length} pipelines:`);
    console.log(JSON.stringify(pipelines.slice(0, 2), null, 2)); // Show only first 2 for brevity
    
    return pipelines;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error testing list_pipelines: ${errorMessage}`);
    throw error;
  }
}

async function testListWorkItems() {
  try {
    console.log('\n=== Testing list_work_items ===');
    
    const workItemApi = await connection.getWorkItemTrackingApi();
    
    // Example WIQL query to get recent work items
    const wiql = {
      query: `SELECT [System.Id], [System.Title], [System.State] 
              FROM WorkItems 
              WHERE [System.TeamProject] = '${project}' 
              ORDER BY [System.ChangedDate] DESC`
    };
    
    const queryResult = await workItemApi.queryByWiql(wiql, { project });
    
    if (queryResult.workItems && queryResult.workItems.length > 0) {
      console.log(`Found ${queryResult.workItems.length} work items:`);
      console.log(JSON.stringify(queryResult.workItems.slice(0, 2), null, 2)); // Show only first 2 for brevity
    } else {
      console.log('No work items found');
    }
    
    return queryResult;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error testing list_work_items: ${errorMessage}`);
    throw error;
  }
}

async function testListPullRequests() {
  try {
    console.log('\n=== Testing list_pull_requests ===');
    
    const gitApi = await connection.getGitApi();
    
    // First get repositories in the project
    const repositories = await gitApi.getRepositories(project);
    
    if (!repositories || repositories.length === 0) {
      console.log('No repositories found to test list_pull_requests');
      return null;
    }
    
    // Use the first repository for testing
    const repositoryId = repositories[0].id;
    
    if (!repositoryId) {
      console.log('Repository ID is undefined');
      return null;
    }
    
    // Search criteria for pull requests
    const searchCriteria = {
      status: 1 // Active
    };
    
    // Get pull requests
    const pullRequests = await gitApi.getPullRequests(repositoryId, searchCriteria);
    
    console.log(`Successfully retrieved ${pullRequests.length} pull requests:`);
    console.log(JSON.stringify(pullRequests.slice(0, 2), null, 2)); // Show only first 2 for brevity
    
    return pullRequests;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error testing list_pull_requests: ${errorMessage}`);
    throw error;
  }
}

// Main function to run all tests
async function runAllTests() {
  console.log('=== Azure DevOps MCP Server Test Suite ===');
  console.log('Running tests for MCP Server Commands...\n');

  try {
    await testListProjects().catch(e => console.error(`Error in testListProjects: ${e.message}`));
    await testGetBoards().catch(e => console.error(`Error in testGetBoards: ${e.message}`));
    await testGetWikis().catch(e => console.error(`Error in testGetWikis: ${e.message}`));
    await testListPipelines().catch(e => console.error(`Error in testListPipelines: ${e.message}`));
    await testListWorkItems().catch(e => console.error(`Error in testListWorkItems: ${e.message}`));
    await testListPullRequests().catch(e => console.error(`Error in testListPullRequests: ${e.message}`));

    console.log('\n=== All tests completed ===');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error running tests:', errorMessage);
  }
}

// Run all tests
runAllTests();

// For ES modules
export {
  testListProjects,
  testGetBoards,
  testGetWikis,
  testListPipelines,
  testListWorkItems,
  testListPullRequests,
  runAllTests
};