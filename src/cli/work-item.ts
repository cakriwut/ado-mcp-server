import { Command } from 'commander';
import { AzureDevOpsConfig, createConfig } from '../config/environment.js';
import { workItemTools } from '../tools/work-item/index.js';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export function workItemCommands(program: Command): void {
  const workItem = program
    .command('work-item')
    .description('Work item management commands');

  // Get work items by IDs
  workItem
    .command('get')
    .description('Get work items by IDs')
    .requiredOption('-i, --ids <ids>', 'Work item IDs (comma-separated)')
    .option('-f, --fields <fields>', 'Fields to include (comma-separated)')
    .option('-a, --as-of <date>', 'As of a specific date (ISO 8601)')
    .option('-e, --expand <expand>', 'Expand options (None=0, Relations=1, Fields=2, Links=3, All=4)')
    .option('--error-policy <policy>', 'Error policy (Fail=1, Omit=2)')
    .option('-p, --project <projectName>', 'Project name (defaults to the one in config)')
    .action(async (options) => {
      try {
        const config = createConfig();
        const tools = workItemTools.initialize(config);
        
        // Parse IDs from comma-separated string to array of numbers
        const ids = options.ids.split(',').map((id: string) => parseInt(id.trim(), 10));
        
        // Parse fields if provided
        const fields = options.fields ? options.fields.split(',').map((field: string) => field.trim()) : undefined;
        
        const result = await tools.getWorkItem({
          ids,
          fields,
          asOf: options.asOf,
          $expand: options.expand ? parseInt(options.expand, 10) : undefined,
          errorPolicy: options.errorPolicy ? parseInt(options.errorPolicy, 10) : undefined
        });
        
        // Ensure we're outputting valid JSON
        console.log(JSON.stringify(result, null, 2));
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });

  // List work items using WIQL query
  workItem
    .command('list')
    .description('List work items using WIQL query')
    .requiredOption('-q, --query <query>', 'WIQL query to filter work items')
    .option('-p, --project <projectName>', 'Project name (defaults to the one in config)')
    .option('--page <page>', 'Page number for pagination (defaults to 1)', '1')
    .action(async (options) => {
      try {
        const config = createConfig();
        const tools = workItemTools.initialize(config);
        
        const result = await tools.listWorkItems({
          query: options.query,
          page: parseInt(options.page, 10)
        });
        
        // Ensure we're outputting valid JSON
        console.log(JSON.stringify(result, null, 2));
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });

  // Create a new work item
  workItem
    .command('create')
    .description('Create a new work item')
    .requiredOption('-t, --type <type>', 'Work item type (e.g., "Bug", "Task", "User Story")')
    .requiredOption('-d, --document <document>', 'JSON patch operations document')
    .option('-p, --project <projectName>', 'Project name (defaults to the one in config)')
    .action(async (options) => {
      try {
        const config = createConfig();
        const tools = workItemTools.initialize(config);
        
        // Parse the document JSON string to an object
        const document = JSON.parse(options.document);
        
        const result = await tools.createWorkItem({
          type: options.type,
          document
        });
        
        // Ensure we're outputting valid JSON
        console.log(JSON.stringify(result, null, 2));
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });

  // Update an existing work item
  workItem
    .command('update')
    .description('Update an existing work item')
    .requiredOption('-i, --id <id>', 'ID of the work item to update')
    .requiredOption('-d, --document <document>', 'JSON patch operations document')
    .option('-p, --project <projectName>', 'Project name (defaults to the one in config)')
    .action(async (options) => {
      try {
        const config = createConfig();
        const tools = workItemTools.initialize(config);
        
        // Parse the document JSON string to an object
        const document = JSON.parse(options.document);
        
        const result = await tools.updateWorkItem({
          id: parseInt(options.id, 10),
          document
        });
        
        // Ensure we're outputting valid JSON
        console.log(JSON.stringify(result, null, 2));
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });

  // Search for work items
  workItem
    .command('search')
    .description('Search for work items using text search')
    .requiredOption('-s, --search-text <searchText>', 'Text to search for in work items')
    .option('-t, --top <top>', 'Maximum number of results to return (default: 10)')
    .option('--skip <skip>', 'Number of results to skip (for pagination)')
    .option('-p, --project <projectName>', 'Project name (defaults to the one in config)')
    .action(async (options) => {
      try {
        const config = createConfig();
        const tools = workItemTools.initialize(config);
        
        const result = await tools.searchWorkItems({
          searchText: options.searchText,
          top: options.top ? parseInt(options.top, 10) : undefined,
          skip: options.skip ? parseInt(options.skip, 10) : undefined
        });
        
        // Ensure we're outputting valid JSON
        console.log(JSON.stringify(result, null, 2));
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });
}