import { getGitApi, project } from './utils.js';

// Define types since we don't have the actual type definitions
interface GitPullRequestSearchCriteria {
  status?: number;
}

enum PullRequestStatus {
  Active = 1,
  Abandoned = 2,
  Completed = 3
}

// Ensure project is defined
if (!project) {
  throw new Error('Project is not defined in environment variables');
}

// Use a non-null assertion since we've already checked that project is defined
const projectName = project!;

/**
 * Test for list_pull_requests tool
 * This tool retrieves pull requests in a project
 */
async function testListPullRequests() {
  try {
    console.log('Testing list_pull_requests tool...');
    
    const gitApi = await getGitApi();
    
    // First get repositories in the project
    const repositories = await gitApi.getRepositories(projectName);
    
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
    const searchCriteria: GitPullRequestSearchCriteria = {
      status: PullRequestStatus.Active
    };
    
    // Get pull requests
    const pullRequests = await gitApi.getPullRequests(repositoryId, searchCriteria);
    
    console.log(`Successfully retrieved ${pullRequests.length} pull requests:`);
    console.log(JSON.stringify(pullRequests.slice(0, 5), null, 2)); // Show only first 5 for brevity
    
    return pullRequests;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error testing list_pull_requests:', errorMessage);
    throw error;
  }
}

/**
 * Test for create_pull_request tool
 * This tool creates a new pull request
 */
async function testCreatePullRequest() {
  try {
    console.log('Testing create_pull_request tool...');
    
    const gitApi = await getGitApi();
    
    // First get repositories in the project
    const repositories = await gitApi.getRepositories(projectName);
    
    if (!repositories || repositories.length === 0) {
      console.log('No repositories found to test create_pull_request');
      return null;
    }
    
    // Use the first repository for testing
    const repository = repositories[0];
    
    if (!repository.id) {
      console.log('Repository ID is undefined');
      return null;
    }
    
    // Get repository details to find branches
    const refs = await gitApi.getRefs(repository.id, undefined, 'heads/');
    
    if (!refs || refs.length < 2) {
      console.log('Not enough branches found to create a pull request');
      return null;
    }
    
    // For testing, we'll use the first two branches
    // In a real scenario, you'd want to use specific branches like 'main' and a feature branch
    const sourceBranch = refs[0].name;
    const targetBranch = refs[1].name;
    
    // Create pull request
    const pullRequestToCreate = {
      sourceRefName: sourceBranch,
      targetRefName: targetBranch,
      title: 'Test Pull Request from MCP Tool',
      description: 'This is a test pull request created by the MCP tool test script',
      isDraft: true // Create as draft to avoid accidental merges
    };
    
    // Note: In a real test, you would create a new branch with changes first
    // This example will likely fail if the branches are the same or have no differences
    console.log(`Attempting to create PR from ${sourceBranch} to ${targetBranch}`);
    
    const pullRequest = await gitApi.createPullRequest(pullRequestToCreate, repository.id);
    
    console.log('Successfully created pull request:');
    console.log(JSON.stringify(pullRequest, null, 2));
    
    return pullRequest;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error testing create_pull_request:', errorMessage);
    throw error;
  }
}

/**
 * Test for update_pull_request tool
 * This tool updates an existing pull request
 */
async function testUpdatePullRequest() {
  try {
    console.log('Testing update_pull_request tool...');
    
    // First get existing pull requests
    const pullRequests = await testListPullRequests();
    
    if (!pullRequests || pullRequests.length === 0) {
      console.log('No pull requests found to test update_pull_request');
      return null;
    }
    
    const gitApi = await getGitApi();
    
    // Use the first pull request for testing
    const pullRequest = pullRequests[0];
    
    if (!pullRequest.repository || !pullRequest.repository.id || !pullRequest.pullRequestId) {
      console.log('Repository ID or Pull Request ID is undefined');
      return null;
    }
    
    // Update pull request
    const pullRequestToUpdate = {
      title: `Updated: ${pullRequest.title || 'Test Pull Request'}`,
      description: `Updated description: ${new Date().toISOString()}`
    };
    
    const updatedPullRequest = await gitApi.updatePullRequest(
      pullRequestToUpdate,
      pullRequest.repository.id,
      pullRequest.pullRequestId
    );
    
    console.log('Successfully updated pull request:');
    console.log(JSON.stringify(updatedPullRequest, null, 2));
    
    return updatedPullRequest;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error testing update_pull_request:', errorMessage);
    throw error;
  }
}

// Run the tests
async function runTests() {
  try {
    // Uncomment the tests you want to run
    // await testListPullRequests();
    // await testCreatePullRequest();
    // await testUpdatePullRequest();
    
    console.log('All pull request tool tests completed');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error running pull request tool tests:', errorMessage);
  }
}

// Run the tests if this file is executed directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  runTests();
}

export {
  testListPullRequests,
  testCreatePullRequest,
  testUpdatePullRequest
};