# Wiki Tools Issues and Fixes

## Issue 1: CLI Command for Wiki Pages Not Working

### Problem
The CLI command `node .\build\cli\index.js wiki pages -w <wikiIdentifier>` was not working because it wasn't passing the project name parameter to the API call.

In the test file `tests/wiki-tools-new.ts`, the working implementation explicitly passes the project name as a parameter to the `getPagesBatch` function:

```javascript
const wikiPages = await wikiApi.getPagesBatch(pagesBatchRequest, projectName, wikiIdentifier);
```

However, the CLI implementation was only using the project from the configuration.

### Solution
We made two key changes to fix this issue:

1. Added a new optional `projectName` parameter to:
   - The `ListWikiPagesArgs` interface
   - The `listWikiPages` function
   - The CLI command
   - The tool definition schema

2. Simplified the implementation to use the Azure DevOps Node API directly, similar to how it's done in the test file.

This allows users to specify a project name when calling the CLI command, which will override the default project from the configuration.

### Usage
```bash
# Using default project from environment variable AZURE_DEVOPS_PROJECT
node .\build\cli\index.js wiki pages -w <wikiIdentifier>

# Specifying a project explicitly
node .\build\cli\index.js wiki pages -w <wikiIdentifier> -p <projectName>

# Example with actual values
node .\build\cli\index.js wiki pages -w 40a12984-af55-49fc-9b4d-378a6ef44d8d -p cybersmart-next
```

### Technical Details
- The Azure DevOps API requires a project name when calling `getPagesBatch`
- Previously, the CLI command was only using the project from the config
- Now, you can override the project name with the `-p` or `--project` option
- If no project name is provided, it falls back to using the project from the config
- The implementation now uses the Azure DevOps Node API directly, which simplifies the code and makes it more consistent with the test implementation

### Changes Made
1. Updated `ListWikiPagesArgs` interface in `src/tools/wiki/get.ts` to include an optional `projectName` parameter
2. Simplified the `listWikiPages` function to use the Azure DevOps Node API directly and use the provided `projectName` parameter if available
3. Updated the CLI implementation in `src/cli/wiki.ts` to add a project option to the `pages` command
4. Updated the tool definition in `src/tools/wiki/index.ts` to include the new parameter

### Testing
The solution has been tested with both approaches:
1. Using the project parameter: `node .\build\cli\index.js wiki pages -w 40a12984-af55-49fc-9b4d-378a6ef44d8d -p cybersmart-next`
2. Using the environment variable: `$env:AZURE_DEVOPS_PROJECT = "cybersmart-next"; node .\build\cli\index.js wiki pages -w 40a12984-af55-49fc-9b4d-378a6ef44d8d`

Both approaches successfully retrieve the wiki pages.

## Issue 2: CLI Command for Wiki Page Not Working

### Problem
The CLI command `node .\build\cli\index.js wiki page -w <wikiIdentifier> -p <path>` was not working because it wasn't passing the project name parameter to the API call, similar to the issue with the `wiki pages` command.

In the test file `tests/wiki-tools-new.ts`, the working implementation explicitly passes the project name as a parameter to the `getWiki` function:

```javascript
const wiki = await wikiApi.getWiki(projectName, wikiIdentifier);
```

However, the CLI implementation was only using the project from the configuration.

### Solution
We made similar changes to fix this issue:

1. Added a new optional `projectName` parameter to:
   - The `GetWikiPageArgs` interface
   - The `getWikiPage` function
   - The CLI command
   - The tool definition schema

2. Completely rewrote the implementation to use the REST API directly with fetch:
   - Instead of using the Azure DevOps Node API which was causing circular structure errors
   - Now using the fetch API to directly call the Azure DevOps REST API endpoints
   - Added support for retrieving the actual wiki page content with the `--include-content` option

This allows users to specify a project name when calling the CLI command, which will override the default project from the configuration.

### Usage
```bash
# Using default project from environment variable AZURE_DEVOPS_PROJECT
node .\build\cli\index.js wiki page -w <wikiIdentifier> -p <path>

# Specifying a project explicitly
node .\build\cli\index.js wiki page -w <wikiIdentifier> -p <path> --project <projectName>

# Including the actual content of the wiki page
node .\build\cli\index.js wiki page -w <wikiIdentifier> -p <path> --include-content

# Example with actual values (with project and content)
node .\build\cli\index.js wiki page -w 40a12984-af55-49fc-9b4d-378a6ef44d8d -p "/Howto Guide/Using components in Cybersmart Library" --project cybersmart-next --include-content
```

### Technical Details
- The Azure DevOps API requires a project name when calling `getWiki` and `getPageText`
- Previously, the CLI command was only using the project from the config
- Now, you can override the project name with the `--project` option
- If no project name is provided, it falls back to using the project from the config
- The implementation now uses the Azure DevOps Node API directly, which simplifies the code and makes it more consistent with the test implementation

### Changes Made
1. Updated `GetWikiPageArgs` interface in `src/tools/wiki/get.ts` to include an optional `projectName` parameter
2. Completely rewrote the `getWikiPage` function to use the Azure DevOps Node API directly and use the provided `projectName` parameter if available
3. Updated the CLI implementation in `src/cli/wiki.ts` to add a project option to the `page` command
4. Updated the tool definition in `src/tools/wiki/index.ts` to include the new parameter

### Testing
The solution has been tested with multiple approaches:
1. Using the project parameter: `node .\build\cli\index.js wiki page -w 40a12984-af55-49fc-9b4d-378a6ef44d8d -p "/Howto Guide/Using components in Cybersmart Library" --project cybersmart-next`
2. Using the environment variable: `$env:AZURE_DEVOPS_PROJECT = "cybersmart-next"; node .\build\cli\index.js wiki page -w 40a12984-af55-49fc-9b4d-378a6ef44d8d -p "/Howto Guide/Using components in Cybersmart Library"`
3. Including content: `node .\build\cli\index.js wiki page -w 40a12984-af55-49fc-9b4d-378a6ef44d8d -p "/Howto Guide/Using components in Cybersmart Library" --project cybersmart-next --include-content`

All approaches successfully retrieve the wiki page information, and the `--include-content` option successfully retrieves the actual content of the wiki page.