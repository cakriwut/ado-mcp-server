// Test script for work item CLI commands
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Path to the CLI script
const cliPath = path.resolve(__dirname, '../build/cli/index.js');

/**
 * Execute a CLI command and return the output
 * @param {string[]} args - Command line arguments
 * @returns {Promise<string>} - Command output
 */
function executeCommand(args) {
  return new Promise((resolve, reject) => {
    const command = spawn('node', [cliPath, ...args]);
    
    let stdout = '';
    let stderr = '';
    
    command.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    command.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    command.on('close', (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(`Command failed with code ${code}: ${stderr}`));
      }
    });
  });
}

/**
 * Test the work-item get command
 */
async function testGetWorkItem() {
  try {
    console.log('Testing work-item get command...');
    
    // Replace 1 with a valid work item ID in your project
    const workItemId = 1;
    
    const output = await executeCommand(['work-item', 'get', '-i', workItemId.toString()]);
    console.log('Command output:');
    console.log(output);
    
    return JSON.parse(output);
  } catch (error) {
    console.error('Error testing work-item get command:', error.message);
  }
}

/**
 * Test the work-item list command
 */
async function testListWorkItems() {
  try {
    console.log('Testing work-item list command...');
    
    // Use the project name from environment variables or default to 'Cybersmart-Next'
    const projectName = process.env.AZURE_DEVOPS_PROJECT || 'Cybersmart-Next';
    
    const query = `SELECT [System.Id], [System.Title], [System.State] 
                  FROM WorkItems 
                  WHERE [System.TeamProject] = '${projectName}' 
                  ORDER BY [System.ChangedDate] DESC`;
    
    const output = await executeCommand(['work-item', 'list', '-q', query]);
    console.log('Command output:');
    console.log(output);
    
    return JSON.parse(output);
  } catch (error) {
    console.error('Error testing work-item list command:', error.message);
  }
}

/**
 * Test the work-item create command
 */
async function testCreateWorkItem() {
  try {
    console.log('Testing work-item create command...');
    
    const document = [
      {
        op: 'add',
        path: '/fields/System.Title',
        value: 'Test Task Created by CLI'
      },
      {
        op: 'add',
        path: '/fields/System.Description',
        value: 'This is a test task created by the CLI test script'
      },
      {
        op: 'add',
        path: '/fields/System.Tags',
        value: 'Test;CLI;Automation'
      }
    ];
    
    const output = await executeCommand([
      'work-item', 
      'create', 
      '-t', 'Task', 
      '-d', JSON.stringify(document)
    ]);
    
    console.log('Command output:');
    console.log(output);
    
    return JSON.parse(output);
  } catch (error) {
    console.error('Error testing work-item create command:', error.message);
  }
}

/**
 * Test the work-item update command
 */
async function testUpdateWorkItem(workItemId) {
  try {
    console.log(`Testing work-item update command for ID ${workItemId}...`);
    
    const document = [
      {
        op: 'replace',
        path: '/fields/System.Title',
        value: 'Updated Test Task by CLI'
      },
      {
        op: 'replace',
        path: '/fields/System.State',
        value: 'Active'
      }
    ];
    
    const output = await executeCommand([
      'work-item', 
      'update', 
      '-i', workItemId.toString(), 
      '-d', JSON.stringify(document)
    ]);
    
    console.log('Command output:');
    console.log(output);
    
    return JSON.parse(output);
  } catch (error) {
    console.error('Error testing work-item update command:', error.message);
  }
}

/**
 * Run all tests
 */
async function runTests() {
  try {
    // Test listing work items
    await testListWorkItems();
    
    // Test getting a work item
    // Uncomment if you have a valid work item ID
    // await testGetWorkItem();
    
    // Test creating a work item
    const createdWorkItem = await testCreateWorkItem();
    
    // Test updating the work item we just created
    if (createdWorkItem) {
      // Extract the ID from the response
      let workItemId;
      if (createdWorkItem.content && createdWorkItem.content[0]) {
        // Parse the text content to get the ID
        const workItemData = JSON.parse(createdWorkItem.content[0].text);
        workItemId = workItemData.id;
      } else if (createdWorkItem.id) {
        workItemId = createdWorkItem.id;
      }
      
      if (workItemId) {
        console.log(`Updating work item with ID: ${workItemId}`);
        await testUpdateWorkItem(workItemId);
      } else {
        console.error('Could not extract work item ID from creation response');
      }
    }
    
    console.log('All work item CLI tests completed');
  } catch (error) {
    console.error('Error running work item CLI tests:', error);
  }
}

// Run the tests
runTests();