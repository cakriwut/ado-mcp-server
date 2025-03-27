#!/usr/bin/env node
/**
 * This script demonstrates how to use the Azure DevOps Wiki CLI tool
 * with command-line arguments.
 * 
 * Usage:
 * 1. Create a .env file with your Azure DevOps credentials
 * 2. Run this script with Node.js
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Verify environment variables
const requiredEnvVars = ['AZURE_DEVOPS_PAT', 'AZURE_DEVOPS_ORG', 'AZURE_DEVOPS_PROJECT'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  console.error('Please set these variables in your .env file or environment');
  process.exit(1);
}

// Create output directory if it doesn't exist
const outputDir = join(process.cwd(), 'examples', 'output');
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

// Function to run a command and save output to a file
function runCommandAndSaveOutput(command, outputFile) {
  console.log(`Running command: ${command}`);
  try {
    const output = execSync(command, { encoding: 'utf8' });
    const outputPath = join(outputDir, outputFile);
    writeFileSync(outputPath, output);
    console.log(`Output saved to ${outputPath}`);
    return output;
  } catch (error) {
    console.error(`Command failed: ${error.message}`);
    if (error.stdout) console.error('Command output:', error.stdout);
    if (error.stderr) console.error('Command error:', error.stderr);
    // Re-throw the error so the caller can handle it
    throw error;
  }
}

// Example 1: List all wikis
console.log('\nExample 1: List all wikis');
const wikisOutput = runCommandAndSaveOutput('node ./build/cli/index.js wiki list', 'wikis.json');

// Parse the output to get wiki IDs
let wikis = [];
try {
  if (wikisOutput) {
    // The output is already valid JSON as a string
    const wikisData = JSON.parse(wikisOutput);
    // The output is an array directly, not wrapped in a value property
    wikis = wikisData || [];
    console.log(`Found ${wikis.length} wikis`);
  }
} catch (error) {
  console.error('Failed to parse wikis output:', error.message);
  console.error('Output received:', wikisOutput);
}

// Example 2: List pages in the first wiki (if available)
if (wikis.length > 0) {
  const wikiId = wikis[0].id;
  const wikiName = wikis[0].name;
  
  console.log(`\nExample 2: List pages in wiki ${wikiName} (ID: ${wikiId})`);
  try {
    runCommandAndSaveOutput(`node ./build/cli/index.js wiki pages -w ${wikiId}`, 'wiki-pages.json');
  } catch (error) {
    console.log(`Note: Could not list pages in wiki ${wikiName}. This might be due to API limitations or permissions.`);
  }

  // Example 3: Get a specific wiki page (if available)
  console.log(`\nExample 3: Get wiki page /Home from wiki ${wikiName} (ID: ${wikiId})`);
  try {
    runCommandAndSaveOutput(
      `node ./build/cli/index.js wiki page -w ${wikiId} -p /Home`,
      'wiki-page-home.json'
    );
  } catch (error) {
    console.log(`Note: Could not get page /Home from wiki ${wikiName}. This might be due to API limitations or permissions.`);
  }
  
  // Example 4: Show how to create a new wiki (without actually creating it)
  console.log('\nExample 4: Create a new wiki (command example only)');
  console.log('Command: node ./build/cli/index.js wiki create -n "Project Documentation"');
  
  // Example 5: Show how to update a wiki page (without actually updating it)
  console.log('\nExample 5: Update a wiki page (command example only)');
  console.log(`Command: node ./build/cli/index.js wiki update -w ${wikiId} -p /Home -c "# Welcome to the Wiki\\n\\nThis is the home page."`);
} else {
  console.log('\nNo wikis found, skipping wiki pages examples');
}

console.log('\nAll examples completed!');