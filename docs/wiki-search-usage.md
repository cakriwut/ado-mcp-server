# Wiki Search Functionality

This document explains how to use the `search_wiki_page` functionality in the Azure DevOps MCP Server.

## Overview

The `search_wiki_page` tool allows you to search for pages in a wiki by text. It performs a client-side search across wiki pages, matching both page paths and content.

## Usage

### CLI Usage

You can use the `search_wiki_page` functionality via the CLI as follows:

```bash
node build/cli/index.js wiki search -w <wikiIdentifier> -s <searchText> [options]
```

#### Required Parameters

- `-w, --wiki <wikiIdentifier>`: The identifier of the wiki to search in. This can be the wiki ID or name.
- `-s, --search <searchText>`: The text to search for in wiki pages.

#### Optional Parameters

- `--project <projectName>`: The name or ID of the project containing the wiki (defaults to the one in config).
- `-t, --top <count>`: Maximum number of results to return (defaults to 20).
- `--include-content`: Include page content in results.

### Examples

1. Search for "Guide" in a wiki:

```bash
node build/cli/index.js wiki search -w "40a12984-af55-49fc-9b4d-378a6ef44d8d" -s "Guide"
```

2. Search with project name specified:

```bash
node build/cli/index.js wiki search -w "40a12984-af55-49fc-9b4d-378a6ef44d8d" -s "Guide" --project "48bebfa4-fb32-4e53-84f2-48aa51b85a1e"
```

3. Search with content included in results:

```bash
node build/cli/index.js wiki search -w "40a12984-af55-49fc-9b4d-378a6ef44d8d" -s "Guide" --include-content
```

4. Limit search results to 10:

```bash
node build/cli/index.js wiki search -w "40a12984-af55-49fc-9b4d-378a6ef44d8d" -s "Guide" -t 10
```

## API Usage

You can also use the `search_wiki_page` functionality programmatically:

```typescript
import { wikiTools } from './src/tools/wiki/index.js';
import { createConfig } from './src/config/environment.js';

const config = createConfig();
const tools = wikiTools.initialize(config);

const result = await tools.searchWikiPage({
  wikiIdentifier: 'your-wiki-id',
  searchText: 'your-search-text',
  projectName: 'your-project-name', // optional
  top: 20, // optional
  includeContent: false // optional
});

console.log(result.content[0].text);
```

## Implementation Details

The search functionality works by:

1. Retrieving all wiki pages for the specified wiki
2. Creating a case-insensitive regular expression from the search text
3. Checking if each page's path matches the search text
4. If requested or if the path doesn't match, checking if the page's content matches the search text
5. Returning pages that match either in path or content

The search results include:
- Page ID
- Page path
- Wiki identifier
- Project name
- Match type (path, content, or both)
- File name (derived from the path)
- Content (if requested)

## Troubleshooting

If you encounter issues with the search functionality:

1. Verify that the wiki identifier is correct
2. Check that you have permission to access the wiki
3. Try using a simpler search term
4. Increase the number of results to return using the `-t` option