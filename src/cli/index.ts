#!/usr/bin/env node
import { program } from 'commander';
import { wikiCommands } from './wiki.js';
import { createConfig } from '../config/environment.js';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Set up the main program
program
  .name('azure-devops-cli')
  .description('Azure DevOps CLI tools')
  .version('0.1.0');

// Add wiki commands
wikiCommands(program);

// Parse arguments
program.parse(process.argv);

// If no arguments provided, show help
if (process.argv.length <= 2) {
  program.help();
}