// Test script for search_wiki_page functionality
import { McpServer } from '@modelcontextprotocol/sdk';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Initialize dotenv
dotenv.config();

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create an MCP server instance
const server = new McpServer({
  name: 'azure-devops-mcp-server',
  description: 'Azure DevOps MCP Server',
  version: '1.0.0',
});

// Import the server module
import serverModule from '../build/index.js';

// Initialize the server with the module
server.initialize(serverModule);

async function testSearchWikiPage() {
  try {
    console.log('Testing search_wiki_page with search text "Test MCP Page"...');
    
    // Get the wiki identifier from environment variables or use a default
    const wikiIdentifier = process.env.WIKI_IDENTIFIER || 'MyWiki';
    
    // Call the search_wiki_page tool
    const result = await server.callTool('search_wiki_page', {
      wikiIdentifier,
      searchText: 'Test MCP Page',
      includeContent: true
    });
    
    console.log('Search results:');
    console.log(JSON.stringify(result, null, 2));
    
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Error testing search_wiki_page:', error);
  }
}

// Run the test
testSearchWikiPage();