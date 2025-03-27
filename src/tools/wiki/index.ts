import { getWikis, listWikiPages } from './get.js';
import { getWikiPage } from './get.js';
import { createWiki } from './create.js';
import { updateWikiPage } from './update.js';
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
      },
      required: ['wikiIdentifier', 'path', 'content'],
    },
  },
];

export const wikiTools = {
  initialize: (config: AzureDevOpsConfig) => ({
    getWikis: (args: Record<string, never>) => getWikis(args, config),
    listWikiPages: (args: { wikiIdentifier: string; pageViewsForDays?: number; top?: number; continuationToken?: string }) =>
      listWikiPages(args, config),
    getWikiPage: (args: { wikiIdentifier: string; path: string; version?: string; includeContent?: boolean }) =>
      getWikiPage(args, config),
    createWiki: (args: { name: string; projectId?: string; mappedPath?: string }) =>
      createWiki(args, config),
    updateWikiPage: (args: { wikiIdentifier: string; path: string; content: string; comment?: string }) =>
      updateWikiPage(args, config),
    definitions,
  }),
  definitions,
};