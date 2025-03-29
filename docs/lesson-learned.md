# Lessons Learned: Azure DevOps MCP Server Development

## Summary of Issues and Solutions

### Issue 1: Wiki Pages CLI Command Not Working
The CLI command `wiki pages` was failing because it wasn't passing the project name parameter to the API call. We fixed this by:
1. Adding an optional `projectName` parameter to the `ListWikiPagesArgs` interface
2. Modifying the `listWikiPages` function to use the provided parameter or fall back to config
3. Updating the CLI implementation to accept a project parameter
4. Simplifying the implementation to use the Azure DevOps Node API directly

### Issue 2: Wiki Page CLI Command Not Working
The CLI command `wiki page` had similar issues, plus we needed to add content retrieval. We fixed this by:
1. Adding an optional `projectName` parameter to the `GetWikiPageArgs` interface
2. Completely rewriting the implementation to use the REST API directly with fetch
3. Adding support for retrieving the actual wiki page content with the `--include-content` option
4. Handling error cases gracefully

## Our Approach

Our development approach follows these steps:

1. **CLI as a Tool Calling Simulator**: We create CLI commands that use the tools to simulate tool calling with parameters. This allows us to test the tools in isolation and verify their behavior.

2. **Parameter Testing and Evaluation**: We provide parameters to the CLI and evaluate the results. This helps us identify issues with parameter handling, API calls, and response processing.

3. **Simplification and Best Practices**: When we encounter errors or unsuccessful results, we fix the tools using best practices and the simplest approach. For example:
   - Using the Azure DevOps library directly when appropriate
   - Using fetch API for REST calls when the library causes issues
   - Properly handling errors and edge cases

## Evaluation and Future Recommendations

Based on what we've learned, here are recommendations for future development:

### 1. API Consistency
- **Consistent Parameter Naming**: Ensure parameter names are consistent across all tools and CLI commands
- **Optional vs. Required Parameters**: Clearly document which parameters are optional and which are required
- **Default Values**: Provide sensible defaults for optional parameters

### 2. Error Handling
- **Graceful Error Recovery**: Implement proper error handling that provides useful information to the user
- **Detailed Error Messages**: Include specific error messages that help diagnose the issue
- **Fallback Mechanisms**: When possible, provide fallback mechanisms when primary approaches fail

### 3. Implementation Strategies
- **Direct API Usage**: When appropriate, use the Azure DevOps Node API directly for simplicity
- **REST API Fallback**: When the Node API causes issues (like circular references), fall back to direct REST API calls
- **Avoid Custom Wrappers**: Minimize custom wrapper classes that may not implement all required methods

### 4. Testing
- **Test with Real Data**: Always test with real data and real API calls
- **Test Edge Cases**: Test with missing parameters, invalid parameters, and other edge cases
- **Document Test Results**: Document test results and any issues encountered

### 5. Documentation
- **Clear Usage Examples**: Provide clear examples of how to use the tools and CLI commands
- **Parameter Documentation**: Document all parameters, their types, and their purpose
- **Error Documentation**: Document common errors and how to resolve them

By following these recommendations, we can create more robust, reliable, and user-friendly tools for interacting with Azure DevOps.