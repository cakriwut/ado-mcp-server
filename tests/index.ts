import { testGetWorkItem, testListWorkItems, testCreateWorkItem, testUpdateWorkItem } from './work-item-tools.js';
import { testGetBoards } from './board-tools.js';
import { testGetWikis, testGetWikiPage, testCreateWiki, testUpdateWikiPage } from './wiki-tools.js';
import { testListProjects } from './project-tools.js';
import { testListPipelines, testTriggerPipeline } from './pipeline-tools.js';
import { testListPullRequests, testCreatePullRequest, testUpdatePullRequest } from './pull-request-tools.js';

/**
 * Main function to run all tests
 */
async function runAllTests() {
  console.log('=== Azure DevOps MCP Server Test Suite ===');
  console.log('Running tests for all MCP Server Commands...\n');

  try {
    // Work Item Tools
    console.log('\n=== Work Item Tools ===');
    await testGetWorkItem().catch(e => console.error(`Error in testGetWorkItem: ${e.message}`));
    await testListWorkItems().catch(e => console.error(`Error in testListWorkItems: ${e.message}`));
    await testCreateWorkItem().catch(e => console.error(`Error in testCreateWorkItem: ${e.message}`));
    await testUpdateWorkItem().catch(e => console.error(`Error in testUpdateWorkItem: ${e.message}`));

    // Board Tools
    console.log('\n=== Board Tools ===');
    await testGetBoards().catch(e => console.error(`Error in testGetBoards: ${e.message}`));

    // Wiki Tools
    console.log('\n=== Wiki Tools ===');
    await testGetWikis().catch(e => console.error(`Error in testGetWikis: ${e.message}`));
    await testGetWikiPage().catch(e => console.error(`Error in testGetWikiPage: ${e.message}`));
    await testCreateWiki().catch(e => console.error(`Error in testCreateWiki: ${e.message}`));
    await testUpdateWikiPage().catch(e => console.error(`Error in testUpdateWikiPage: ${e.message}`));

    // Project Tools
    console.log('\n=== Project Tools ===');
    await testListProjects().catch(e => console.error(`Error in testListProjects: ${e.message}`));

    // Pipeline Tools
    console.log('\n=== Pipeline Tools ===');
    await testListPipelines().catch(e => console.error(`Error in testListPipelines: ${e.message}`));
    await testTriggerPipeline().catch(e => console.error(`Error in testTriggerPipeline: ${e.message}`));

    // Pull Request Tools
    console.log('\n=== Pull Request Tools ===');
    await testListPullRequests().catch(e => console.error(`Error in testListPullRequests: ${e.message}`));
    await testCreatePullRequest().catch(e => console.error(`Error in testCreatePullRequest: ${e.message}`));
    await testUpdatePullRequest().catch(e => console.error(`Error in testUpdatePullRequest: ${e.message}`));

    console.log('\n=== All tests completed ===');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error running tests:', errorMessage);
  }
}

// Run all tests if this file is executed directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  runAllTests();
}

export {
  runAllTests
};