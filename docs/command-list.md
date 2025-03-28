# Azure DevOps MCP Server Commands

## Work Item Tools
- [ ] get_work_item (Error: The expand parameter can not be used with the fields parameter)
- [X] list_work_items (Response too large and breaks the model, must have default limit)
- [ ] create_work_item (Error: Unknown tool: create_work_item)
- [ ] update_work_item (Error: Unknown tool: update_work_item)

## Board Tools
- [X] get_boards

## Wiki Tools
- [X] get_wikis
- [X] list_wiki_pages
- [X] get_wiki_page
- [X] create_wiki (Tested, no need to retest. Please skip.)
- [ ] update_wiki_page (Error: Wiki not found)
- [ ] create_wiki_page (New tool to create a wiki page)
- [ ] search_wiki_page (Search wiki using in Azure Devops by 'search text')

## Project Tools
- [X] list_projects

## Pipeline Tools
- [X] list_pipelines
- [X] trigger_pipeline

## Pull Request Tools
- [ ] list_pull_requests (Error: A project name is required in order to reference a Git repository by name)
- [ ] create_pull_request (Error: A source and a target reference cannot be the same)
- [ ] update_pull_request (Error: Pull Request with ID 1 not found)

## Test Results

### Wiki Tools Test (2025-03-28)
1. list_projects - ✅ Success
2. get_wikis - ✅ Success
3. list_wiki_pages - ❌ Error: Wiki not found
   - The tool is defined in the code but not registered in the main index.ts file's switch statement
4. create_wiki - ❌ Error: Wiki already exists for project 'Cybersmart-Next'
   - The implementation always includes mappedPath parameter even for project wikis
5. get_wiki_page - ❌ Error: Failed to get wiki page: Cannot read properties of null (reading 'id')
   - Unable to find wiki despite it being returned by get_wikis

### Wiki Tools Test (2025-03-28) - After Fix Implementation
1. list_projects - ✅ Success
2. get_wikis - ✅ Success
3. list_wiki_pages - ❌ Error: Wiki not found
   - Despite the fix being implemented, the tool still fails to find the wiki
   - The issue might be in the API implementation where the wiki ID format is not correctly handled
4. create_wiki - ❌ Error: Wiki already exists for project 'Cybersmart-Next'
   - This is expected since a wiki already exists for the project
   - The error message is now more informative
5. get_wiki_page - ❌ Error: Failed to get wiki page: Cannot read properties of null (reading 'id')
   - The issue persists despite the improved wiki lookup mechanism
   - The error suggests a problem with the API response handling

### Wiki Tools Test (2025-03-28) - Latest Verification
1. list_projects - ✅ Success
   - Successfully retrieved all projects in the organization
   - Found "Cybersmart-Next" project with ID "48bebfa4-fb32-4e53-84f2-48aa51b85a1e"
2. get_wikis - ✅ Success
   - Successfully retrieved wiki for Cybersmart-Next project
   - Wiki ID: "40a12984-af55-49fc-9b4d-378a6ef44d8d", Name: "Cybersmart-Next.wiki"
3. list_wiki_pages - ✅ Success (After Fix)
   - Successfully retrieved wiki pages with project parameter
   - Command: `node .\build\cli\index.js wiki pages -w wikiId -p project-name`
   - Also works with environment variable: `$env:AZURE_DEVOPS_PROJECT = "project_name"; node .\build\cli\index.js wiki pages -w wikiId`
   - Fixed by adding project parameter and simplifying implementation to use Azure DevOps Node API directly
4. create_wiki - ❌ Error: Wiki already exists for project 'Cybersmart-Next'
   - This is expected behavior since a wiki already exists for the project
   - Cannot verify if the mappedPath parameter fix works correctly
5. get_wiki_page - ✅ Success (After Fix)
   - Successfully retrieved wiki page with project parameter
   - Command: `node .\build\cli\index.js wiki page -w 40a12984-af55-49fc-9b4d-378a6ef44d8d -p "/Howto Guide/Using components in Cybersmart Library" --project cybersmart-next`
   - Also works with environment variable: `$env:AZURE_DEVOPS_PROJECT = "cybersmart-next"; node .\build\cli\index.js wiki page -w 40a12984-af55-49fc-9b4d-378a6ef44d8d -p "/Howto Guide/Using components in Cybersmart Library"`
   - Fixed by adding project parameter and simplifying implementation to use Azure DevOps Node API directly

### Wiki CLI Commands
```bash
# List all wikis in the project
node .\build\cli\index.js wiki list

# List pages in a wiki (with project parameter)
node .\build\cli\index.js wiki pages -w <wikiIdentifier> -p <projectName>

# List pages in a wiki (using default project from environment)
node .\build\cli\index.js wiki pages -w <wikiIdentifier>

# Get a wiki page by path (with project parameter)
node .\build\cli\index.js wiki page -w <wikiIdentifier> -p <path> --project <projectName>

# Get a wiki page by path (using default project from environment)
node .\build\cli\index.js wiki page -w <wikiIdentifier> -p <path>

# Get a wiki page with content
node .\build\cli\index.js wiki page -w <wikiIdentifier> -p <path> --include-content

# Create a new wiki
node .\build\cli\index.js wiki create -n <name>

# Update a wiki page
node .\build\cli\index.js wiki update -w <wikiIdentifier> -p <path> -c <content>

# Create a new wiki page
node .\build\cli\index.js wiki create-page -w <wikiIdentifier> -p <path> -c <content> --project <projectName>
```

### Wiki Tools Test (2025-03-28) - Latest MCP Tool Test Results
1. get_wikis - ✅ Success
   - Successfully retrieved wiki for Cybersmart-Next project
   - Wiki ID: "40a12984-af55-49fc-9b4d-378a6ef44d8d", Name: "Cybersmart-Next.wiki"

2. list_wiki_pages - ✅ Success
   - Successfully retrieved wiki pages with project parameter
   - Command: `use_mcp_tool` with server_name: "azure-devops-mcp-server", tool_name: "list_wiki_pages"
   - Parameters: wikiIdentifier: "40a12984-af55-49fc-9b4d-378a6ef44d8d", projectName: "Cybersmart-Next"
   - Returns a list of wiki pages with their paths and IDs

3. get_wiki_page - ✅ Success
   - Successfully retrieved wiki page with project parameter and content
   - Command: `use_mcp_tool` with server_name: "azure-devops-mcp-server", tool_name: "get_wiki_page"
   - Parameters: wikiIdentifier: "40a12984-af55-49fc-9b4d-378a6ef44d8d", path: "/Getting Started", projectName: "Cybersmart-Next", includeContent: true
   - Returns the wiki page details including content

4. update_wiki_page - ❌ Error: Unauthorized
   - Failed to update wiki page with error: "Failed to update wiki page: Unauthorized"
   - Command: `node .\build\cli\index.js wiki update -w 40a12984-af55-49fc-9b4d-378a6ef44d8d -p "/Test MCP Page" -c "# Test MCP Page..." --project Cybersmart-Next`
   - Issue: The update_wiki_page tool now has the projectName parameter, but there seems to be an authorization issue with the Azure DevOps API

5. create_wiki_page - ❌ Error: Unknown tool
   - Failed to create wiki page with error: "Unknown tool: create_wiki_page"
   - Command: `use_mcp_tool` with server_name: "azure-devops-mcp-server", tool_name: "create_wiki_page"
   - Issue: The create_wiki_page tool has been implemented but requires restarting the MCP server to register the new tool

5. create_wiki_page - ⚠️ Not Implemented
   - This is a new tool that needs to be implemented
   - Should allow users to create a new wiki page in a specific wiki of a project
   - Recommended implementation provided in the recommendations section below

### Implemented Changes for Wiki Tools

#### 1. Update Wiki Page Tool
We've implemented the following changes to the update_wiki_page tool:

1. Added projectName parameter to the UpdateWikiPageArgs interface:
   ```typescript
   interface UpdateWikiPageArgs {
     wikiIdentifier: string;
     path: string;
     content: string;
     comment?: string;
     projectName?: string;  // Added this line
   }
   ```

2. Updated the updateWikiPage function to use the provided projectName parameter:
   ```typescript
   export async function updateWikiPage(args: UpdateWikiPageArgs, config: AzureDevOpsConfig) {
     // ...
     const projectName = args.projectName || config.project;
     const wiki = await wikiApi.getWiki(projectName, args.wikiIdentifier);
     // ...
   }
   ```

3. Updated the tool definition in src/tools/wiki/index.ts to include the new parameter:
   ```typescript
   {
     name: 'update_wiki_page',
     description: 'Create or update a wiki page',
     inputSchema: {
       type: 'object',
       properties: {
         // ...
         projectName: {
           type: 'string',
           description: 'Project name (optional, defaults to the one in config)',
         },
       },
       required: ['wikiIdentifier', 'path', 'content'],
     },
   }
   ```

4. Updated the CLI implementation in src/cli/wiki.ts to add a project option to the update command:
   ```typescript
   .option('--project <projectName>', 'Project name (defaults to the one in config)')
   ```

#### 2. Create Wiki Page Tool
We've implemented a new create_wiki_page tool with the following components:

1. Created src/tools/wiki/create-page.ts with the createWikiPage function:
   ```typescript
   export async function createWikiPage(args: CreateWikiPageArgs, config: AzureDevOpsConfig) {
     // Implementation that uses the updateWikiPage method of the WikiApi class
     // to create a new page (PUT operation creates the page if it doesn't exist)
   }
   ```

2. Added the tool definition in src/tools/wiki/index.ts:
   ```typescript
   {
     name: 'create_wiki_page',
     description: 'Create a new wiki page',
     inputSchema: {
       type: 'object',
       properties: {
         wikiIdentifier: {
           type: 'string',
           description: 'Wiki identifier',
         },
         // ... other properties
       },
       required: ['wikiIdentifier', 'path', 'content'],
     },
   }
   ```

3. Added the CLI implementation in src/cli/wiki.ts:
   ```typescript
   wiki
     .command('create-page')
     .description('Create a new wiki page')
     .requiredOption('-w, --wiki <wikiIdentifier>', 'Wiki identifier')
     // ... other options
   ```

4. Added the tool handler in src/index.ts:
   ```typescript
   case 'create_wiki_page':
     result = await tools.wiki.createWikiPage(request.params.arguments);
     break;
   ```

#### 3. Added getWiki Method to WikiApi
We've implemented the getWiki method in the WikiApi class to support the update_wiki_page and create_wiki_page tools:
```typescript
async getWiki(projectName: string, wikiIdentifier: string): Promise<Wiki> {
  const authHeader = await this.getAuthHeader();
  const response = await fetch(`${this.config.orgUrl}/${projectName}/_apis/wiki/wikis/${wikiIdentifier}?api-version=7.0`, {
    headers: {
      Authorization: authHeader,
    },
  });

  // Error handling...

  return response.json();
}
```

### Recommendations for Future Work

1. **Authorization Issues**: The update_wiki_page and create_wiki_page tools are currently failing with "Unauthorized" errors. This suggests that there might be issues with the Personal Access Token (PAT) or permissions. Future work should focus on:
   - Ensuring the PAT has the correct permissions for wiki operations
   - Implementing better error handling for authorization issues
   - Adding detailed logging to help diagnose authentication problems

2. **MCP Server Restart**: The create_wiki_page tool requires restarting the MCP server to register the new tool. Future work should consider:
   - Implementing dynamic tool registration that doesn't require server restart
   - Adding a reload mechanism to refresh tool definitions without restarting
   - Documenting the restart requirement in the developer documentation

3. **Testing with Real Data**: The tools should be tested with real data in a controlled environment to ensure they work correctly. This includes:
   - Creating test wikis and pages
   - Updating existing pages
   - Verifying the content is correctly saved
   - Testing error cases and edge conditions

4. **Consistent Parameter Naming**: Ensure all tools follow consistent parameter naming conventions:
   - Use projectName consistently across all tools
   - Document the parameter requirements clearly
   - Provide helpful error messages when required parameters are missing

5. **Error Handling Improvements**: Enhance error handling to provide more helpful error messages:
   - Include specific error codes from the Azure DevOps API
   - Provide suggestions for resolving common errors
   - Add detailed logging for debugging purposes

### Recommendations for create_wiki_page Tool
1. Create a new file src/tools/wiki/create-page.ts with the following content:
   ```typescript
   import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
   import { AzureDevOpsConnection } from '../../api/connection.js';
   import { AzureDevOpsConfig } from '../../config/environment.js';
   
   interface CreateWikiPageArgs {
     wikiIdentifier: string;
     path: string;
     content: string;
     comment?: string;
     projectName?: string;
   }
   
   export async function createWikiPage(args: CreateWikiPageArgs, config: AzureDevOpsConfig) {
     if (!args.wikiIdentifier || !args.path || !args.content) {
       throw new McpError(
         ErrorCode.InvalidParams,
         'Wiki identifier, page path, and content are required'
       );
     }
   
     AzureDevOpsConnection.initialize(config);
     const connection = AzureDevOpsConnection.getInstance();
     const wikiApi = await connection.getWikiApi();
   
     try {
       // Use the project name from args if provided, otherwise use the one from config
       const projectName = args.projectName || config.project;
       
       // First verify the wiki exists
       const wiki = await wikiApi.getWiki(projectName, args.wikiIdentifier);
       if (!wiki || !wiki.id) {
         throw new McpError(
           ErrorCode.InvalidParams,
           `Wiki ${args.wikiIdentifier} not found`
         );
       }
       
       // Create the wiki page
       const pageCreateParams = {
         content: args.content,
         comment: args.comment || `Created page ${args.path}`
       };
       
       // Use the Azure DevOps REST API to create the page
       // Note: This is a placeholder implementation as the Azure DevOps Node API
       // doesn't have a direct method for creating wiki pages
       const createdPage = await wikiApi.createOrUpdatePage(
         wiki.id,
         args.path,
         pageCreateParams,
         projectName
       );
       
       return {
         content: [
           {
             type: 'text',
             text: JSON.stringify(createdPage, null, 2),
           },
         ],
       };
     } catch (error: unknown) {
       if (error instanceof McpError) throw error;
       const errorMessage = error instanceof Error ? error.message : 'Unknown error';
       throw new McpError(
         ErrorCode.InternalError,
         `Failed to create wiki page: ${errorMessage}`
       );
     }
   }
   ```

2. Update the tool definition in src/tools/wiki/index.ts to include the new tool:
   ```typescript
   {
     name: 'create_wiki_page',
     description: 'Create a new wiki page',
     inputSchema: {
       type: 'object',
       properties: {
         wikiIdentifier: {
           type: 'string',
           description: 'Wiki identifier',
         },
         path: {
           type: 'string',
           description: 'Page path',
         },
         content: {
           type: 'string',
           description: 'Page content in markdown format',
         },
         comment: {
           type: 'string',
           description: 'Comment for the creation (optional)',
         },
         projectName: {
           type: 'string',
           description: 'Project name (optional, defaults to the one in config)',
         },
       },
       required: ['wikiIdentifier', 'path', 'content'],
     },
   }
   ```

3. Update the tool initialization in src/tools/wiki/index.ts:
   ```typescript
   createWikiPage: (args: { wikiIdentifier: string; path: string; content: string; comment?: string; projectName?: string }) =>
     createWikiPage(args, config),
   ```

4. Update the imports in src/tools/wiki/index.ts:
   ```typescript
   import { getWikis, listWikiPages } from './get.js';
   import { getWikiPage } from './get.js';
   import { createWiki } from './create.js';
   import { updateWikiPage } from './update.js';
   import { createWikiPage } from './create-page.js';
   import { AzureDevOpsConfig } from '../../config/environment.js';
   ```

5. Add the new tool to the CLI implementation in src/cli/wiki.ts:
   ```typescript
   program
     .command('create-page')
     .description('Create a new wiki page')
     .requiredOption('-w, --wiki <wikiIdentifier>', 'Wiki identifier')
     .requiredOption('-p, --path <path>', 'Page path')
     .requiredOption('-c, --content <content>', 'Page content in markdown format')
     .option('--comment <comment>', 'Comment for the creation')
     .option('--project <projectName>', 'Project name (optional, defaults to the one in config)')
     .action(async (options) => {
       try {
         const result = await wikiTools.createWikiPage({
           wikiIdentifier: options.wiki,
           path: options.path,
           content: options.content,
           comment: options.comment,
           projectName: options.project,
         });
         console.log(result.content[0].text);
       } catch (error) {
         console.error('Error creating wiki page:', error);
       }
     });
   ```