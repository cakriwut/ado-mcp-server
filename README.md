# Azure DevOps MCP (ADO-MCP-Server) for Cline
[![smithery badge](https://smithery.ai/badge/@cakriwut/ado-mcp-server)](https://smithery.ai/server/@cakriwut/ado-mcp-server)


This Model Context Protocol (MCP) server provides integration with Azure DevOps, allowing Cline and Roo Code to interact with Azure DevOps services.

The project repository is located at: https://github.com/cakriwut/ado-mcp-server


## Prerequisites

- Node.js (v20 LTS or higher)
- npm (comes with Node.js)
- A Cline installation
- Azure DevOps account with access tokens

## Installation

### Installing via Smithery

To install Azure DevOps MCP Server (ADO-MCP-Server) automatically via [Smithery](https://smithery.ai/server/@cakriwut/ado-mcp-server):

```bash
npx -y @smithery/cli install @cakriwut/ado-mcp-server --client claude
```

### Manual Installation
1. Clone this repository:
```bash
git clone https://github.com/cakriwut/ado-mcp-server.git
cd ado-mcp-server
```

2. Install dependencies:
```bash
npm install
```

3. Build the server:
```bash
npm run build
```

Note: The build output (`build/` directory) is not included in version control. You must run the build command after cloning the repository.

## Configuration

### 1. Get Azure DevOps Personal Access Token (PAT)

1. Go to Azure DevOps and sign in
2. Click on your profile picture in the top right
3. Select "Security"
4. Click "New Token"
5. Give your token a name and select the required scopes:
   - `Code (read, write)` - For Pull Request operations
   - `Work Items (read, write)` - For Work Item management
   - `Build (read, execute)` - For Pipeline operations
   - `Wiki (read, write)` - For Wiki operations
   - `Project and Team (read)` - For Project and Board information
6. Copy the generated token

### 2. Configure MCP Settings

Add the server configuration to your MCP settings file:

#### For Roo Code (VSCode extension)
Configuration file location: `%APPDATA%/Code/User/globalStorage/rooveterinaryinc.roo-cline/settings/cline_mcp_settings.json`

#### For Cline Desktop App
Configuration file location: `%LOCALAPPDATA%/Claude/claude_desktop_config.json`

Add the following configuration to the `mcpServers` object:

```json
{
  "mcpServers": {
    "azure-devops-mcp-server": {
      "command": "node",
      "args": ["C:/absolute/path/to/ado-mcp-server/build/index.js"],
      "env": {
        "AZURE_DEVOPS_ORG": "your-organization",
        "AZURE_DEVOPS_PAT": "your-personal-access-token",
        "AZURE_DEVOPS_PROJECT": "your-project-name"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

Replace the following values:
- `C:/absolute/path/to/ado-mcp-server`: The absolute path to where you cloned this repository (use forward slashes)
- `your-organization`: Your Azure DevOps organization name
- `your-project-name`: Your Azure DevOps project name
- `your-personal-access-token`: The PAT you generated in step 1

#### Important Notes for Windows Users
- Use forward slashes (/) in the path, not backslashes (\)
- Provide the full absolute path to the build/index.js file
- Restart Roo Code or Cline after making changes to the configuration

## Available Tools

### Work Items
- `get_work_item`: Get a work item by ID
- `list_work_items`: Query work items using WIQL
- `create_work_item`: Create a new work item (Bug, Task, User Story)
- `update_work_item`: Update an existing work item
- `search_work_items`: Search for work items using text search
- `add_work_item_comment`: Add a comment to a work item
- `get_work_item_comments`: Get comments from a work item

### Boards
- `get_boards`: Get available boards in the project

### Pipelines
- `list_pipelines`: List all pipelines in the project
- `trigger_pipeline`: Execute a pipeline

### Pull Requests
- `list_pull_requests`: List pull requests
- `create_pull_request`: Create a new pull request
- `update_pull_request`: Update a pull request

### Wiki
- `get_wikis`: List all wikis in the project
- `list_wiki_pages`: List pages in a wiki
- `get_wiki_page`: Get a wiki page by path
- `create_wiki`: Create a new wiki
- `update_wiki_page`: Create or update a wiki page
- `create_wiki_page`: Create a new wiki page
- `search_wiki_page`: Search for pages in a wiki by text

### Projects
- `list_projects`: List all projects in the Azure DevOps organization

## Command Line Interface (CLI)

ADO-MCP-Server includes a command-line interface that allows you to interact with Azure DevOps directly from the terminal. The CLI is available as `azure-devops-cli` after building the project.

### Environment Setup

Before using the CLI, set up your environment variables:

```powershell
# PowerShell
$env:AZURE_DEVOPS_ORG = "your-organization"
$env:AZURE_DEVOPS_PROJECT = "your-project-name"
$env:AZURE_DEVOPS_PAT = "your-personal-access-token"
```

### Common CLI Commands

#### Work Items
```powershell
# Get a work item by ID
node .\build\cli\index.js work-item get -i 42

# Search for work items
node .\build\cli\index.js work-item search -s "bug"

# Create a new task
node .\build\cli\index.js work-item create -t "Task" -d '[{"op":"add","path":"/fields/System.Title","value":"New Task"}]'

# Add a comment to a work item
node .\build\cli\index.js work-item add-comment -i 42 -t "This is a comment added via CLI"

# Get comments from a work item
node .\build\cli\index.js work-item get-comments -i 42
```

#### Wiki
```powershell
# List all wikis in the project
node .\build\cli\index.js wiki list

# Get a wiki page
node .\build\cli\index.js wiki page -w <wikiIdentifier> -p "/path/to/page" --include-content

# Search wiki pages
node .\build\cli\index.js wiki search -w <wikiIdentifier> -s "search term"
```

For more detailed CLI usage examples, see [docs/wiki-cli-usage.md](docs/wiki-cli-usage.md) and [docs/command-list.md](docs/command-list.md).

## Verification

1. Restart Cline (or VSCode) after adding the configuration
2. The Azure DevOps MCP server should now be listed in Cline's capabilities
3. You can verify the installation using the MCP Inspector:
```bash
npm run inspector
```

## Troubleshooting

1. If the server isn't connecting:
   - Check that the path in your MCP settings is correct
   - Verify your Azure DevOps credentials
   - Check the Cline logs for any error messages

2. If you get authentication errors:
   - Verify your PAT hasn't expired
   - Ensure the PAT has all necessary scopes
   - Double-check the organization and project names

3. For other issues:
   - Run the inspector tool to verify the server is working correctly
   - Check the server logs for any error messages

## Development

To modify or extend the server:

1. Make your changes in the `src` directory
2. Run `npm run watch` for development
3. Build with `npm run build` when ready
4. Test using the inspector: `npm run inspector`

## Testing

The project includes test scripts for all MCP Server Commands. These tests help verify that the server can communicate with Azure DevOps correctly.

### Prerequisites for Testing

1. Make sure you have a valid `.env` file in the root directory with the following variables:
   ```
   AZURE_DEVOPS_ORG=your-organization
   AZURE_DEVOPS_PROJECT=your-project
   AZURE_DEVOPS_PAT=your-personal-access-token
   ```

2. Install dependencies:
   ```
   npm install
   ```

### Running Tests

#### Quick Tests

For a quick test of your Azure DevOps connection:

```bash
npm run test:quick
```

This runs a simple JavaScript test that only tests the list_projects command.

For a more comprehensive test of all MCP Server Commands:

```bash
npm run test:simple
```

This runs a simple JavaScript test that tests all the main commands in one file.

#### TypeScript Tests

To run all TypeScript tests:

```bash
npm test
```

To run tests for specific command categories:

```bash
npm run test:work-item     # Test Work Item Tools
npm run test:board         # Test Board Tools
npm run test:wiki          # Test Wiki Tools
npm run test:project       # Test Project Tools
npm run test:pipeline      # Test Pipeline Tools
npm run test:pull-request  # Test Pull Request Tools
```

See the [tests/README.md](tests/README.md) file for more information about the tests.

## License

MIT License - See [LICENSE](LICENSE) for details
