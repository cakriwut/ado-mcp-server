# Azure DevOps CLI Tool

This CLI tool provides a command-line interface for interacting with Azure DevOps services. Currently, it supports wiki management operations.

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd azure-devops-mcp-server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

4. Set up environment variables:
   - Create a `.env` file based on `.env.example`
   - Fill in your Azure DevOps credentials:
     ```
     AZURE_DEVOPS_ORG=your-organization
     AZURE_DEVOPS_PROJECT=your-project
     AZURE_DEVOPS_PAT=your-personal-access-token
     ```

## Usage

You can use the CLI tool directly:

```bash
node ./build/cli/index.js <command>
```

Or, after installation, you can use the global command:

```bash
azure-devops-cli <command>
```

To see all available commands:

```bash
azure-devops-cli --help
```

## Available Modules

### Wiki Management

For detailed wiki commands, see [Wiki CLI Usage Guide](./wiki-cli-usage.md).

Basic commands:

```bash
# List all wikis
azure-devops-cli wiki list

# List pages in a wiki
azure-devops-cli wiki pages -w <wikiIdentifier>

# Get a specific wiki page
azure-devops-cli wiki page -w <wikiIdentifier> -p <path>

# Create a new wiki
azure-devops-cli wiki create -n <name>

# Update a wiki page
azure-devops-cli wiki update -w <wikiIdentifier> -p <path> -c <content>
```

## Examples

See the `examples` directory for sample scripts demonstrating how to use the CLI tool:

```bash
# Run the wiki examples
node examples/wiki-cli-examples.js
```

## Testing

To run tests for the CLI tool:

```bash
npm run test:cli
```

## Development

To add new commands or modify existing ones:

1. Create or modify files in the `src/cli` directory
2. Build the project with `npm run build`
3. Test your changes with `npm run test:cli`

## Adding New Modules

To add support for additional Azure DevOps services:

1. Create a new file in `src/cli` for the service
2. Define the commands and options
3. Import and register the commands in `src/cli/index.ts`
4. Update documentation to reflect the new capabilities