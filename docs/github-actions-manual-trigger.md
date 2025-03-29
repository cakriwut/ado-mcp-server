# Manually Triggering GitHub Actions

This document explains how to manually trigger GitHub Actions workflows in this repository.

## Prerequisites

- The workflow must include the `workflow_dispatch` event trigger in its YAML configuration
- You must have appropriate permissions to the repository

## How to Manually Trigger a Workflow

1. Navigate to the GitHub repository in your web browser
2. Click on the "Actions" tab at the top of the repository
3. In the left sidebar, find and click on the workflow you want to run
4. Click the "Run workflow" button (blue button with a dropdown arrow) on the right side
5. Select the branch you want to run the workflow on from the dropdown menu
6. Click the green "Run workflow" button to start the execution

## Viewing Workflow Results

After triggering a workflow:
1. The workflow will appear in the list of workflow runs
2. Click on the workflow run to see its progress and results
3. You can view logs for each job and step in the workflow

## Additional Options

When manually triggering a workflow, you may have additional input options if they were defined in the workflow file using `inputs` under the `workflow_dispatch` event. These inputs allow you to customize the workflow run.

Example workflow configuration with inputs:

```yaml
on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy to'
        required: true
        default: 'staging'
        type: choice
        options:
        - staging
        - production
```

## Troubleshooting

If you encounter issues when manually triggering workflows:

1. Ensure you have the necessary permissions to run workflows
2. Check that the workflow file contains the `workflow_dispatch` event
3. Verify that the workflow file is valid YAML and properly configured
4. Review any error messages in the Actions tab