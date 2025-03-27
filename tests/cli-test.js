#!/usr/bin/env node
import { execSync } from 'child_process';
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

// Build the project
console.log('Building the project...');
execSync('npm run build', { stdio: 'inherit' });

// Test the CLI
console.log('\nTesting the wiki CLI commands:');

try {
  // Test wiki list command
  console.log('\n1. Testing wiki list command:');
  const wikiListOutput = execSync('node ./build/cli/index.js wiki list', { encoding: 'utf8' });
  console.log('Wiki list output:', wikiListOutput);

  // If there are wikis, test the pages command with the first wiki
  const wikis = JSON.parse(wikiListOutput).value;
  if (wikis && wikis.length > 0) {
    const wikiId = wikis[0].id;
    console.log(`\n2. Testing wiki pages command with wiki ID: ${wikiId}`);
    const wikiPagesOutput = execSync(`node ./build/cli/index.js wiki pages -w ${wikiId}`, { encoding: 'utf8' });
    console.log('Wiki pages output:', wikiPagesOutput);
  } else {
    console.log('\nNo wikis found to test the pages command');
  }

  console.log('\nAll tests completed successfully!');
} catch (error) {
  console.error('\nTest failed:', error.message);
  console.error('Command output:', error.stdout);
  console.error('Command error:', error.stderr);
  process.exit(1);
}