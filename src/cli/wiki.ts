import { Command } from 'commander';
import { AzureDevOpsConfig, createConfig } from '../config/environment.js';
import { wikiTools } from '../tools/wiki/index.js';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export function wikiCommands(program: Command): void {
  const wiki = program
    .command('wiki')
    .description('Wiki management commands');

  // Get all wikis
  wiki
    .command('list')
    .description('List all wikis in the project')
    .action(async () => {
      try {
        const config = createConfig();
        const tools = wikiTools.initialize(config);
        const result = await tools.getWikis({});
        // Ensure we're outputting valid JSON
        console.log(result.content[0].text);
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });

  // Get wiki pages
  wiki
    .command('pages')
    .description('List pages in a wiki')
    .requiredOption('-w, --wiki <wikiIdentifier>', 'Wiki identifier')
    .option('-p, --project <projectName>', 'Project name (defaults to the one in config)')
    .option('-d, --days <days>', 'Page views for days', '30')
    .option('-t, --top <count>', 'Number of pages to return', '100')
    .option('-c, --continuation <token>', 'Continuation token')
    .action(async (options) => {
      try {
        const config = createConfig();
        const tools = wikiTools.initialize(config);
        const result = await tools.listWikiPages({
          wikiIdentifier: options.wiki,
          projectName: options.project,
          pageViewsForDays: parseInt(options.days, 10),
          top: parseInt(options.top, 10),
          continuationToken: options.continuation
        });
        // Ensure we're outputting valid JSON
        console.log(result.content[0].text);
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });

  // Get wiki page
  wiki
    .command('page')
    .description('Get a wiki page by path')
    .requiredOption('-w, --wiki <wikiIdentifier>', 'Wiki identifier')
    .requiredOption('-p, --path <path>', 'Page path')
    .option('-v, --version <version>', 'Version')
    .option('--include-content', 'Include page content')
    .action(async (options) => {
      try {
        const config = createConfig();
        const tools = wikiTools.initialize(config);
        const result = await tools.getWikiPage({
          wikiIdentifier: options.wiki,
          path: options.path,
          version: options.version,
          includeContent: options.includeContent
        });
        // Ensure we're outputting valid JSON
        console.log(result.content[0].text);
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });

  // Create wiki
  wiki
    .command('create')
    .description('Create a new wiki')
    .requiredOption('-n, --name <name>', 'Wiki name')
    .option('-p, --project <projectId>', 'Project ID')
    .option('-m, --mapped-path <path>', 'Mapped path')
    .action(async (options) => {
      try {
        const config = createConfig();
        const tools = wikiTools.initialize(config);
        const result = await tools.createWiki({
          name: options.name,
          projectId: options.project,
          mappedPath: options.mappedPath
        });
        // Ensure we're outputting valid JSON
        console.log(result.content[0].text);
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });

  // Update wiki page
  wiki
    .command('update')
    .description('Update a wiki page')
    .requiredOption('-w, --wiki <wikiIdentifier>', 'Wiki identifier')
    .requiredOption('-p, --path <path>', 'Page path')
    .requiredOption('-c, --content <content>', 'Page content')
    .option('--comment <comment>', 'Comment for the update')
    .action(async (options) => {
      try {
        const config = createConfig();
        const tools = wikiTools.initialize(config);
        const result = await tools.updateWikiPage({
          wikiIdentifier: options.wiki,
          path: options.path,
          content: options.content,
          comment: options.comment
        });
        // Ensure we're outputting valid JSON
        console.log(result.content[0].text);
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });
}