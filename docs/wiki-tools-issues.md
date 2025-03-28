# Wiki Tools Issues and Fixes

## Issue: CLI Command for Wiki Pages Not Working

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