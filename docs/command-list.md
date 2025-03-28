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

4. update_wiki_page - ❌ Error: Wiki not found
   - Failed to update wiki page with error: "Wiki 40a12984-af55-49fc-9b4d-378a6ef44d8d not found"
   - Command: `use_mcp_tool` with server_name: "azure-devops-mcp-server", tool_name: "update_wiki_page"
   - Parameters: wikiIdentifier: "40a12984-af55-49fc-9b4d-378a6ef44d8d", path: "/Test MCP Page", content: "...", comment: "Test page update via MCP tool", projectName: "Cybersmart-Next"
   - Issue: The update_wiki_page tool doesn't have a projectName parameter in its interface or implementation, unlike the list_wiki_pages and get_wiki_page tools

### Recommendations for update_wiki_page Tool
1. Update the UpdateWikiPageArgs interface in src/tools/wiki/update.ts to include an optional projectName parameter:
   ```typescript
   interface UpdateWikiPageArgs {
     wikiIdentifier: string;
     path: string;
     content: string;
     comment?: string;
     projectName?: string;  // Add this line
   }
   ```

2. Update the updateWikiPage function to use the provided projectName parameter if available:
   ```typescript
   export async function updateWikiPage(args: UpdateWikiPageArgs, config: AzureDevOpsConfig) {
     // ...
     const projectName = args.projectName || config.project;
     const wiki = await wikiApi.getWiki(projectName, args.wikiIdentifier);
     // ...
   }
   ```

3. Update the tool definition in src/tools/wiki/index.ts to include the new parameter:
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

4. Update the tool initialization in src/tools/wiki/index.ts:
   ```typescript
   updateWikiPage: (args: { wikiIdentifier: string; path: string; content: string; comment?: string; projectName?: string }) =>
     updateWikiPage(args, config),
   ```