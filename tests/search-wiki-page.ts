import { getWikiApi, project, orgUrl, token } from './utils.js';
import fetch from 'node-fetch';

// Ensure project is defined
if (!project) {
  throw new Error('Project is not defined in environment variables');
}

// Use a non-null assertion since we've already checked that project is defined
const projectName = project!;

/**
 * Test for search_wiki_page tool
 * This tool searches for pages in a wiki by text
 */
async function testSearchWikiPage() {
  try {
    console.log('Testing search_wiki_page tool...');
    
    // First get the wiki API
    const wikiApi = await getWikiApi();
    
    // Get all wikis in the project
    const wikisResponse = await wikiApi.getWikis();
    const wikis = wikisResponse.value;
    
    if (!wikis || wikis.length === 0) {
      console.log('No wikis found to test search_wiki_page');
      return null;
    }
    
    // Use the first wiki for testing
    const wikiIdentifier = wikis[0].id;
    
    // Search for "Test MCP Page" in the wiki
    const searchText = 'Test MCP Page';
    console.log(`Searching for "${searchText}" in wiki ${wikiIdentifier}...`);
    
    // Use fetch API directly to search wiki pages
    const encodedSearchText = encodeURIComponent(searchText);
    const top = 20;
    const authToken = Buffer.from(`:${token}`).toString('base64');
    
    const searchResponse = await fetch(
      `${orgUrl}/${projectName}/_apis/wiki/wikis/${wikiIdentifier}/searchResults?searchText=${encodedSearchText}&top=${top}&api-version=7.0`,
      {
        headers: {
          Authorization: `Basic ${authToken}`,
        },
      }
    );
    
    if (!searchResponse.ok) {
      throw new Error(`Failed to search wiki pages: ${searchResponse.statusText}`);
    }
    
    const searchResults = await searchResponse.json();
    
    console.log('Search results:');
    console.log(JSON.stringify(searchResults, null, 2));
    
    return searchResults;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error testing search_wiki_page:', errorMessage);
    throw error;
  }
}

// Run the test if this file is executed directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  testSearchWikiPage()
    .then(() => console.log('Search wiki page test completed'))
    .catch(error => console.error('Error running search wiki page test:', error));
}

export {
  testSearchWikiPage
};