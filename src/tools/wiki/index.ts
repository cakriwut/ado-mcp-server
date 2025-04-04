import { getWikis, listWikiPages, searchWikiPage } from './get.js';
import { getWikiPage } from './get.js';
import { createWiki } from './create.js';
import { updateWikiPage } from './update.js';
import { createWikiPage } from './create-page.js';
import { AzureDevOpsConfig } from '../../config/environment.js';

const definitions = [
  {
    name: 'get_wikis',
    description: 'List all wikis in the project',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'list_wiki_pages',
    description: 'List pages in a wiki in the project',
    inputSchema: {
      type: 'object',
      properties: {
        wikiIdentifier: {
          type: 'string',
          description: 'Wiki identifier',
        },
        projectName: {
          type: 'string',
          description: 'Project name (optional, defaults to the one in config)',
        },
        pageViewsForDays: {
          type: 'number',
          description: 'Last N days from the current day for which page views is to be returned (optional, defaults to 30)',
        },
        top: {
          type: 'number',
          description: 'Total count of pages to return (optional, defaults to 100)',
        },
        continuationToken: {
          type: 'string',
          description: 'Continuation token for pagination (optional)',
        },
      },
      required: ['wikiIdentifier'],
    },
  },
  {
    name: 'search_wiki_page',
    description: 'Search for pages in a wiki by text',
    inputSchema: {
      type: 'object',
      properties: {
        wikiIdentifier: {
          type: 'string',
          description: 'Wiki identifier',
        },
        searchText: {
          type: 'string',
          description: 'Text to search for in wiki pages',
        },
        projectName: {
          type: 'string',
          description: 'Project name (optional, defaults to the one in config)',
        },
        top: {
          type: 'number',
          description: 'Maximum number of results to return (optional, defaults to 20)',
        },
        includeContent: {
          type: 'boolean',
          description: 'Include page content in results (optional, defaults to false)',
        },
      },
      required: ['wikiIdentifier', 'searchText'],
    },
  },
  {
    name: 'get_wiki_page',
    description: 'Get a wiki page by path',
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
        projectName: {
          type: 'string',
          description: 'Project name (optional, defaults to the one in config)',
        },
        version: {
          type: 'string',
          description: 'Version (optional, defaults to main)',
        },
        includeContent: {
          type: 'boolean',
          description: 'Include page content (optional, defaults to true)',
        },
      },
      required: ['wikiIdentifier', 'path'],
    },
  },
  {
    name: 'create_wiki',
    description: 'Create a new wiki',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Wiki name',
        },
        projectId: {
          type: 'string',
          description: 'Project ID (optional, defaults to current project)',
        },
        mappedPath: {
          type: 'string',
          description: 'Mapped path (optional, defaults to /)',
        },
      },
      required: ['name'],
    },
  },
  {
    name: 'update_wiki_page',
    description: 'Create or update a wiki page',
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
          description: 'Comment for the update (optional)',
        },
        projectName: {
          type: 'string',
          description: 'Project name (optional, defaults to the one in config)',
        },
      },
      required: ['wikiIdentifier', 'path', 'content'],
    },
  },
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
  },
];

export const wikiTools = {
  initialize: (config: AzureDevOpsConfig) => ({
    getWikis: (args: Record<string, never>) => getWikis(args, config),
    listWikiPages: (args: { wikiIdentifier: string; projectName?: string; pageViewsForDays?: number; top?: number; continuationToken?: string }) =>
      listWikiPages(args, config),
    searchWikiPage: (args: { wikiIdentifier: string; searchText: string; projectName?: string; top?: number; includeContent?: boolean }) =>
      searchWikiPage(args, config),
    getWikiPage: (args: { wikiIdentifier: string; path: string; projectName?: string; version?: string; includeContent?: boolean }) =>
      getWikiPage(args, config),
    createWiki: (args: { name: string; projectId?: string; mappedPath?: string }) =>
      createWiki(args, config),
    updateWikiPage: (args: { wikiIdentifier: string; path: string; content: string; comment?: string; projectName?: string }) =>
      updateWikiPage(args, config),
    createWikiPage: (args: { wikiIdentifier: string; path: string; content: string; comment?: string; projectName?: string }) =>
      createWikiPage(args, config),
    definitions,
  }),
  definitions,
};