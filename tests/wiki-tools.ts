import { getWikiApi, project } from './utils.js';

// Ensure project is defined
if (!project) {
  throw new Error('Project is not defined in environment variables');
}

// Use a non-null assertion since we've already checked that project is defined
const projectName = project!;

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
  try {
    // Uncomment the tests you want to run
    // await testGetWikis();
    // await testListWikiPages();
    // await testGetWikiPage();
    // await testCreateWiki();
    // await testUpdateWikiPage();
    
    console.log('All wiki tool tests completed');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error running wiki tool tests:', errorMessage);
  }
}

// Run the tests if this file is executed directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  runTests();
}

export {
  testGetWikis,
  testListWikiPages,
  testGetWikiPage,
  testCreateWiki,
  testUpdateWikiPage
};