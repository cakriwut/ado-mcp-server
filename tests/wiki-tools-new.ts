import { getWikiApi, project } from './utils.js';
import fs from 'fs/promises';
import path from 'path';

// Add immediate console output to verify script execution
console.log('=== SCRIPT STARTING ===');
console.log('Current working directory:', process.cwd());
console.log('Environment variables check:');
console.log('- AZURE_DEVOPS_ORG:', process.env.AZURE_DEVOPS_ORG ? 'Set' : 'Not set');
console.log('- AZURE_DEVOPS_PROJECT:', process.env.AZURE_DEVOPS_PROJECT ? 'Set' : 'Not set');
console.log('- AZURE_DEVOPS_PAT:', process.env.AZURE_DEVOPS_PAT ? 'Set (hidden)' : 'Not set');

// Ensure project is defined
if (!project) {
  console.error('ERROR: Project is not defined in environment variables');
  throw new Error('Project is not defined in environment variables');
}

// Use a non-null assertion since we've already checked that project is defined
const projectName = project!;
console.log('Using project:', projectName);

/**
 * Test for get_wikis tool
 * This tool retrieves all wikis in a project
 */
async function testGetWikis() {
  try {
    console.log('Testing get_wikis tool...');
    
    const wikiApi = await getWikiApi();
    
    // Get all wikis in the project
    const wikis = await wikiApi.getAllWikis(projectName);
    
    console.log(`Successfully retrieved ${wikis.length} wikis:`);
    console.log(JSON.stringify(wikis, null, 2));
    
    return wikis;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error testing get_wikis:', errorMessage);
    throw error;
  }
}

/**
 * Test for list_wiki_pages tool
 * This tool retrieves a list of wiki pages in a project
 */
async function testListWikiPages() {
  try {
    console.log('Testing list_wiki_pages tool...');
    
    // First get all wikis
    const wikis = await testGetWikis();
    
    if (!wikis || wikis.length === 0) {
      console.log('No wikis found to test list_wiki_pages');
      return null;
    }
    
    const wikiApi = await getWikiApi();
    const wikiIdentifier = wikis[0].id;
    
    // Create a request to get wiki pages
    const pagesBatchRequest = {
      // Optional: Get pages viewed in the last 30 days
      pageViewsForDays: 30,
      // Optional: Maximum number of pages to return
      top: 100
      // Optional: continuationToken can be used for pagination
    };
    
    // Get the wiki pages
    const wikiPages = await wikiApi.getPagesBatch(pagesBatchRequest, projectName, wikiIdentifier);
    
    console.log('Successfully retrieved wiki pages:');
    console.log(JSON.stringify(wikiPages, null, 2));
    
    return wikiPages;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error testing list_wiki_pages:', errorMessage);
    throw error;
  }
}

/**
 * Test for list_wiki_pages tool using the wikis.json file
 * This function loads the wikis.json file, extracts the id from the first wiki,
 * and uses it to call the API directly
 */
async function testListWikiPagesFromJson() {
  try {
    console.log('=== Testing list_wiki_pages tool using wikis.json file ===');
    console.log('1. Loading wikis.json file...');
    
    // Load the wikis.json file
    const wikisJsonPath = path.resolve(process.cwd(), 'examples/output/wikis.json');
    console.log(`   File path: ${wikisJsonPath}`);
    
    const wikisJsonContent = await fs.readFile(wikisJsonPath, 'utf-8');
    const wikis = JSON.parse(wikisJsonContent);
    
    console.log(`2. Successfully loaded wikis.json with ${wikis.length} entries`);
    
    if (!wikis || wikis.length === 0) {
      console.log('   No wikis found in wikis.json file');
      return null;
    }
    
    // Get the first wiki entry
    const firstWiki = wikis[0];
    console.log('3. First wiki entry from wikis.json:');
    console.log(JSON.stringify(firstWiki, null, 2));
    
    // Extract the id field
    const wikiIdentifier = firstWiki.id;
    console.log(`4. Extracted wiki identifier: ${wikiIdentifier}`);
    
    // Get the Wiki API
    console.log('5. Getting Wiki API...');
    const wikiApi = await getWikiApi();
    
    // Create a request to get wiki pages
    const pagesBatchRequest = {
      pageViewsForDays: 30,
      top: 100
    };
    
    console.log('6. Request parameters:');
    console.log(JSON.stringify({
      pagesBatchRequest,
      projectName,
      wikiIdentifier
    }, null, 2));
    
    // Get the wiki pages
    console.log('7. Calling getPagesBatch API...');
    const wikiPages = await wikiApi.getPagesBatch(pagesBatchRequest, projectName, wikiIdentifier);
    
    console.log('8. Successfully retrieved wiki pages:');
    console.log(JSON.stringify(wikiPages, null, 2));
    
    return wikiPages;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error testing list_wiki_pages from JSON:', errorMessage);
    throw error;
  }
}

/**
 * Test for get_wiki_page tool
 * This tool retrieves a wiki page by path
 */
async function testGetWikiPage() {
  try {
    console.log('Testing get_wiki_page tool...');
    
    // First get all wikis
    const wikis = await testGetWikis();
    
    if (!wikis || wikis.length === 0) {
      console.log('No wikis found to test get_wiki_page');
      return null;
    }
    
    const wikiApi = await getWikiApi();
    const wikiIdentifier = wikis[0].id;
    
    // Get the wiki information
    const wiki = await wikiApi.getWiki(projectName, wikiIdentifier);
    
    console.log('Successfully retrieved wiki:');
    console.log(JSON.stringify(wiki, null, 2));
    
    return wiki;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error testing get_wiki_page:', errorMessage);
    throw error;
  }
}

/**
 * Test for create_wiki tool
 * This tool creates a new wiki
 */
async function testCreateWiki() {
  try {
    console.log('Testing create_wiki tool...');
    
    const wikiApi = await getWikiApi();
    
    // Create a new wiki
    const wikiCreateParams = {
      name: `Test Wiki ${new Date().getTime()}`,
      projectId: projectName,
      type: 0  // ProjectWiki = 0, CodeWiki = 1
    };
    
    const wiki = await wikiApi.createWiki(wikiCreateParams);
    
    console.log('Successfully created wiki:');
    console.log(JSON.stringify(wiki, null, 2));
    
    return wiki;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error testing create_wiki:', errorMessage);
    throw error;
  }
}

/**
 * Test for update_wiki_page tool
 * This tool updates a wiki page
 */
async function testUpdateWikiPage() {
  try {
    console.log('Testing update_wiki_page tool...');
    
    // First get all wikis
    const wikis = await testGetWikis();
    
    if (!wikis || wikis.length === 0) {
      console.log('No wikis found to test update_wiki_page');
      return null;
    }
    
    const wikiApi = await getWikiApi();
    const wikiIdentifier = wikis[0].id;
    
    // Get the wiki information
    const wiki = await wikiApi.getWiki(projectName, wikiIdentifier);
    
    // Note: The Azure DevOps API doesn't currently support direct wiki page updates
    // This is a simulation of what would be sent
    const pageContent = `# Test Page
This is a test page created by the MCP tool test script.
Last updated: ${new Date().toISOString()}`;
    
    const updateParams = {
      content: pageContent,
      comment: 'Test page update via MCP tool'
    };
    
    console.log('Wiki page update simulation:');
    console.log(JSON.stringify({
      wiki,
      path: 'TestPage',
      message: 'Wiki page update is not supported in the current API version',
      requestedUpdate: updateParams
    }, null, 2));
    
    return {
      wiki,
      updateParams
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error testing update_wiki_page:', errorMessage);
    throw error;
  }
}

// Run the tests
async function runTests() {
  console.log('=== STARTING TEST EXECUTION ===');
  try {
    console.log('Running testListWikiPagesFromJson...');
    // Uncomment the tests you want to run
    // await testGetWikis();
    // await testListWikiPages();
    await testListWikiPagesFromJson(); // New test using wikis.json
    // await testGetWikiPage();
    // await testCreateWiki();
    // await testUpdateWikiPage();
    
    console.log('All wiki tool tests completed');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error running wiki tool tests:', errorMessage);
    console.error('Full error:', error);
    
    // Print stack trace if available
    if (error instanceof Error && error.stack) {
      console.error('Stack trace:', error.stack);
    }
  } finally {
    console.log('=== TEST EXECUTION FINISHED ===');
  }
}

// Run the tests if this file is executed directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
console.log('Is main module:', isMainModule);
console.log('import.meta.url:', import.meta.url);
console.log('process.argv[1]:', process.argv[1]);

// Force run tests regardless of module check
runTests().catch(err => {
  console.error('Error caught in main:', err);
});

export {
  testGetWikis,
  testListWikiPages,
  testListWikiPagesFromJson, // Export the new function
  testGetWikiPage,
  testCreateWiki,
  testUpdateWikiPage
};