// Import required modules
import dotenv from 'dotenv';
import * as azdev from 'azure-devops-node-api';

// Load environment variables from .env file
dotenv.config();

// Get environment variables
const orgUrl = `https://dev.azure.com/${process.env.AZURE_DEVOPS_ORG}`;
const token = process.env.AZURE_DEVOPS_PAT;
const project = process.env.AZURE_DEVOPS_PROJECT;

// Validate environment variables
if (!token) {
  console.error('Error: AZURE_DEVOPS_PAT environment variable is not set');
  process.exit(1);
}

if (!process.env.AZURE_DEVOPS_ORG) {
  console.error('Error: AZURE_DEVOPS_ORG environment variable is not set');
  process.exit(1);
}

if (!project) {
  console.error('Error: AZURE_DEVOPS_PROJECT environment variable is not set');
  process.exit(1);
}

console.log(`Using organization: ${process.env.AZURE_DEVOPS_ORG}`);
console.log(`Using project: ${project}`);

// Create a connection to Azure DevOps
const authHandler = azdev.getPersonalAccessTokenHandler(token);
const connection = new azdev.WebApi(orgUrl, authHandler);

// Test function for list_projects
async function testListProjects() {
  try {
    console.log('\n=== Testing list_projects ===');
    
    const coreApi = await connection.getCoreApi();
    
    // Get all projects
    const projects = await coreApi.getProjects();
    
    console.log(`Successfully retrieved ${projects.length} projects:`);
    console.log(JSON.stringify(projects, null, 2));
    
    return projects;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error testing list_projects: ${errorMessage}`);
    throw error;
  }
}

// Run the test
testListProjects()
  .then(() => console.log('\nTest completed successfully'))
  .catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
  });