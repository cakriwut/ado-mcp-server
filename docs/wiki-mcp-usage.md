# Using MCP Server for Wiki Operations

This document explains how to use the Model Context Protocol (MCP) server to search for wiki pages and update them with MCP content.

## Overview

The Azure DevOps MCP Server provides tools to interact with Azure DevOps wikis, including:
- `get_wikis`: List all wikis in a project
- `list_wiki_pages`: List pages in a wiki
- `get_wiki_page`: Get a specific wiki page by path
- `update_wiki_page`: Update a wiki page
- `create_wiki_page`: Create a new wiki page
- `search_wiki_page`: Search for pages in a wiki by text

## Prerequisites

Before using the MCP server for wiki operations, ensure you have:

1. A Personal Access Token (PAT) with the following permissions:
   - **Wiki**: Read, Write
   - **Project**: Read
   - **Work Items**: Read, Write (if using work item related tools)

2. Environment variables set up in a `.env` file:
   ```
   AZURE_DEVOPS_PAT=your_personal_access_token
   AZURE_DEVOPS_ORG=your_organization_name
   AZURE_DEVOPS_PROJECT=your_project_name
   ```

## Searching for Wiki Pages

To search for wiki pages containing specific text:

```javascript
// Using MCP Tool
const searchResult = await use_mcp_tool({
  server_name: "azure-devops-mcp-server",
  tool_name: "search_wiki_page",
  arguments: {
    wikiIdentifier: "your_wiki_id",
    searchText: "Your search text",
    projectName: "Your project name",
    includeContent: true
  }
});

// Using CLI
node build/cli/index.js wiki search -w your_wiki_id -s "Your search text" --project your_project_name --include-content
```

## Getting Wiki Page Content

To get the content of a specific wiki page:

```javascript
// Using MCP Tool
const pageResult = await use_mcp_tool({
  server_name: "azure-devops-mcp-server",
  tool_name: "get_wiki_page",
  arguments: {
    wikiIdentifier: "your_wiki_id",
    path: "/Your/Page/Path",
    projectName: "Your project name",
    includeContent: true
  }
});

// Using CLI
node build/cli/index.js wiki page -w your_wiki_id -p "/Your/Page/Path" --project your_project_name --include-content
```

## Updating Wiki Pages

To update a wiki page with new content:

```javascript
// Using MCP Tool
const updateResult = await use_mcp_tool({
  server_name: "azure-devops-mcp-server",
  tool_name: "update_wiki_page",
  arguments: {
    wikiIdentifier: "your_wiki_id",
    path: "/Your/Page/Path",
    content: "Your new content",
    comment: "Your update comment",
    projectName: "Your project name"
  }
});

// Using CLI
node build/cli/index.js wiki update -w your_wiki_id -p "/Your/Page/Path" -c "Your new content" --comment "Your update comment" --project your_project_name
```

## Creating Wiki Pages

To create a new wiki page:

```javascript
// Using MCP Tool
const createResult = await use_mcp_tool({
  server_name: "azure-devops-mcp-server",
  tool_name: "create_wiki_page",
  arguments: {
    wikiIdentifier: "your_wiki_id",
    path: "/Your/New/Page/Path",
    content: "Your page content",
    comment: "Your creation comment",
    projectName: "Your project name"
  }
});

// Using CLI
node build/cli/index.js wiki create-page -w your_wiki_id -p "/Your/New/Page/Path" -c "Your page content" --comment "Your creation comment" --project your_project_name
```

## Example: Search and Update Wiki Pages

The following example demonstrates how to search for wiki pages containing specific text and update them with MCP content:

```javascript
// Example script to search for wiki pages containing "Test MCP Page" and update them with MCP content
import dotenv from 'dotenv';
import { createConfig } from '../build/config/environment.js';
import { wikiTools } from '../build/tools/wiki/index.js';

// Load environment variables from .env file
dotenv.config();

async function main() {
  try {
    // Create configuration from environment variables
    const config = createConfig();
    console.log(`Using organization: ${config.org}, project: ${config.project}`);
    
    // Initialize wiki tools
    const tools = wikiTools.initialize(config);
    
    // Wiki information
    const wikiInfo = {
      wikiIdentifier: "your_wiki_id",
      name: "your_wiki_name",
      projectName: "your_project_name"
    };
    
    // Step 1: Search for wiki pages containing "Test MCP Page"
    console.log(`\nSearching for wiki pages containing "Test MCP Page"...`);
    const searchResult = await tools.searchWikiPage({
      wikiIdentifier: wikiInfo.wikiIdentifier,
      searchText: "Test MCP Page",
      projectName: wikiInfo.projectName,
      includeContent: true
    });
    
    const searchData = JSON.parse(searchResult.content[0].text);
    console.log(`Found ${searchData.count} pages containing "Test MCP Page"`);
    
    if (searchData.count > 0) {
      // If pages are found, get the content of the first found page
      const firstPage = searchData.results[0];
      const getResult = await tools.getWikiPage({
        wikiIdentifier: wikiInfo.wikiIdentifier,
        path: firstPage.path,
        projectName: wikiInfo.projectName,
        includeContent: true
      });
      
      const pageData = JSON.parse(getResult.content[0].text);
      
      // Update the page with MCP content if it doesn't already exist
      let newContent = pageData.content || '';
      
      if (!newContent.includes('## Model Context Protocol (MCP)')) {
        newContent += `

## Model Context Protocol (MCP)

The Model Context Protocol (MCP) is a powerful framework that enables communication between AI systems and external tools or resources. It allows AI models to:

1. **Access external data sources** - Connect to databases, APIs, and file systems
2. **Execute specialized tools** - Perform complex operations beyond the model's built-in capabilities
3. **Maintain context** - Keep track of state across interactions
4. **Enhance capabilities** - Extend functionality through custom server implementations

MCP servers can be implemented to provide domain-specific functionality, such as this Azure DevOps integration that allows for wiki page management.

### Key Benefits

- Seamless integration with existing systems
- Enhanced AI capabilities through specialized tools
- Improved context management
- Extensible architecture for custom implementations
`;
        
        // Update the wiki page with the new content
        const updateResult = await tools.updateWikiPage({
          wikiIdentifier: wikiInfo.wikiIdentifier,
          path: firstPage.path,
          content: newContent,
          comment: "Added section about Model Context Protocol (MCP)",
          projectName: wikiInfo.projectName
        });
        
        console.log('Wiki page updated successfully!');
      }
    }
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : String(error));
  }
}

main();
```

## Troubleshooting

If you encounter authorization issues when using the wiki tools:

1. **Check PAT Permissions**:
   - Ensure your PAT has the required permissions (Wiki Read/Write, Project Read)
   - Verify your PAT is not expired

2. **Environment Variables**:
   - Check that your environment variables are correctly set in the `.env` file
   - Ensure the organization and project names are correct

3. **Wiki Identifier**:
   - Verify that the wiki identifier is correct
   - Use the `get_wikis` tool to list all available wikis and their IDs

4. **Project Name**:
   - Always include the project name parameter when using wiki tools
   - The project name is case-sensitive

## Known Issues

1. **Authorization Errors**:
   - The `update_wiki_page` and `create_wiki_page` tools may fail with "Unauthorized" errors due to PAT permission issues
   - Ensure your PAT has the required permissions and is correctly set in the `.env` file

2. **Wiki Not Found Errors**:
   - The `update_wiki_page` tool may fail with "Wiki not found" errors even when the wiki exists
   - This may be due to issues with the wiki identifier format or permissions

3. **API Limitations**:
   - Some operations may be limited by the Azure DevOps API
   - Refer to the Azure DevOps API documentation for more information