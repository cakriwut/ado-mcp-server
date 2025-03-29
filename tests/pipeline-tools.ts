import { getBuildApi, project } from './utils.js';

// Ensure project is defined
if (!project) {
  throw new Error('Project is not defined in environment variables');
}

// Use a non-null assertion since we've already checked that project is defined
const projectName = project!;

/**
 * Test for list_pipelines tool
 * This tool retrieves all pipelines in a project
 */
async function testListPipelines() {
  try {
    console.log('Testing list_pipelines tool...');
    
    const buildApi = await getBuildApi();
    
    // Get all pipelines (build definitions)
    const pipelines = await buildApi.getDefinitions(projectName);
    
    console.log(`Successfully retrieved ${pipelines.length} pipelines:`);
    console.log(JSON.stringify(pipelines.slice(0, 5), null, 2)); // Show only first 5 for brevity
    
    return pipelines;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error testing list_pipelines:', errorMessage);
    throw error;
  }
}

/**
 * Test for trigger_pipeline tool
 * This tool triggers a pipeline run
 */
async function testTriggerPipeline() {
  try {
    console.log('Testing trigger_pipeline tool...');
    
    // First get all pipelines
    const pipelines = await testListPipelines();
    
    if (!pipelines || pipelines.length === 0) {
      console.log('No pipelines found to test trigger_pipeline');
      return null;
    }
    
    const buildApi = await getBuildApi();
    
    // Use the first pipeline for testing
    const pipelineId = pipelines[0].id;
    
    if (!pipelineId) {
      console.log('Pipeline ID is undefined');
      return null;
    }
    
    // Create build parameters
    const build = {
      definition: {
        id: pipelineId
      },
      project: {
        id: projectName
      },
      // You can add more parameters like sourceBranch, sourceVersion, etc.
    };
    
    // Queue a new build
    const queuedBuild = await buildApi.queueBuild(build, projectName);
    
    console.log('Successfully triggered pipeline:');
    console.log(JSON.stringify(queuedBuild, null, 2));
    
    return queuedBuild;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error testing trigger_pipeline:', errorMessage);
    throw error;
  }
}

// Run the tests
async function runTests() {
  try {
    // Uncomment the tests you want to run
    // await testListPipelines();
    // await testTriggerPipeline();
    
    console.log('All pipeline tool tests completed');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error running pipeline tool tests:', errorMessage);
  }
}

// Run the tests if this file is executed directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  runTests();
}

export {
  testListPipelines,
  testTriggerPipeline
};