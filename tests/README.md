# Azure DevOps MCP Server Test Scripts

This directory contains test scripts for the Azure DevOps MCP Server commands. Each script tests a specific category of commands.

## Prerequisites

1. Make sure you have a valid `.env` file in the root directory with the following variables:
   ```
   AZURE_DEVOPS_ORG=your-organization
   AZURE_DEVOPS_PROJECT=your-project
   AZURE_DEVOPS_PAT=your-personal-access-token
   ```

2. Install dependencies:
   ```
   npm install
   ```

## Running Tests

### Run All Tests

To run all tests:

```
npm test
```

### Run Tests for Specific Command Categories

To run tests for specific command categories:

```
npm run test:work-item     # Test Work Item Tools
npm run test:board         # Test Board Tools
npm run test:wiki          # Test Wiki Tools
npm run test:project       # Test Project Tools
npm run test:pipeline      # Test Pipeline Tools
npm run test:pull-request  # Test Pull Request Tools
```

### Run Simple Test

For a quick test of all MCP Server Commands without TypeScript compilation:

```
npm run test:simple
```

This runs a simple JavaScript test that tests all the main commands in one file.

### Run Quick Test

For an even quicker test that only tests the list_projects command:

```
npm run test:quick
```

This is useful for quickly verifying that your Azure DevOps connection is working correctly.

## Test Files

- `work-item-tools.ts`: Tests for Work Item Tools (get_work_item, list_work_items, create_work_item, update_work_item)
- `board-tools.ts`: Tests for Board Tools (get_boards)
- `wiki-tools.ts`: Tests for Wiki Tools (get_wikis, get_wiki_page, create_wiki, update_wiki_page)
- `project-tools.ts`: Tests for Project Tools (list_projects)
- `pipeline-tools.ts`: Tests for Pipeline Tools (list_pipelines, trigger_pipeline)
- `pull-request-tools.ts`: Tests for Pull Request Tools (list_pull_requests, create_pull_request, update_pull_request)
- `utils.ts`: Common utilities for all tests
- `index.ts`: Main test runner

## Customizing Tests

Each test file has individual test functions that are commented out in the `runTests()` function. To run specific tests, uncomment the tests you want to run in the respective file.

For example, in `work-item-tools.ts`:

```typescript
async function runTests() {
  try {
    // Uncomment the tests you want to run
    await testGetWorkItem();
    // await testListWorkItems();
    // await testCreateWorkItem();
    // await testUpdateWorkItem();
    
    console.log('All work item tool tests completed');
  } catch (error) {
    console.error('Error running work item tool tests:', error);
  }
}
```

## Notes

- Some tests depend on the results of other tests. For example, `testUpdateWorkItem` depends on `testCreateWorkItem` to create a work item to update.
- Some tests may fail if the required resources don't exist in your Azure DevOps project. For example, `testTriggerPipeline` will fail if there are no pipelines in your project.
- The Wiki and Pull Request tests include simulations for operations that are not fully supported by the Azure DevOps API.