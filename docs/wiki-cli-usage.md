# Wiki CLI Tool Usage Guide

This document provides instructions on how to use the Azure DevOps Wiki CLI tool.

## Prerequisites

Before using the Wiki CLI tool, ensure you have the following:

1. Node.js installed (version 14 or higher)
2. Azure DevOps Personal Access Token (PAT) with appropriate permissions
3. Environment variables set up:
   - `AZURE_DEVOPS_PAT`: Your Azure DevOps Personal Access Token
   - `AZURE_DEVOPS_ORG`: Your Azure DevOps organization name
   - `AZURE_DEVOPS_PROJECT`: Your Azure DevOps project name

You can set these environment variables in a `.env` file in the project root or directly in your system environment.

## Installation

After cloning the repository, install dependencies and build the project:

```bash
npm install
npm run build
```

## Available Commands

The Wiki CLI tool provides the following commands:

### List All Wikis

Lists all wikis in the project:

```bash
azure-devops-cli wiki list
```

### List Wiki Pages

Lists pages in a specific wiki:

```bash
azure-devops-cli wiki pages -w <wikiIdentifier>
```

Options:
- `-w, --wiki <wikiIdentifier>`: Wiki identifier (required)
- `-d, --days <days>`: Page views for days (default: 30)
- `-t, --top <count>`: Number of pages to return (default: 100)
- `-c, --continuation <token>`: Continuation token for pagination

### Get Wiki Page

Gets a specific wiki page by path:

```bash
azure-devops-cli wiki page -w <wikiIdentifier> -p <path>
```

Options:
- `-w, --wiki <wikiIdentifier>`: Wiki identifier (required)
- `-p, --path <path>`: Page path (required)
- `-v, --version <version>`: Version
- `--include-content`: Include page content

### Create Wiki

Creates a new wiki:

```bash
azure-devops-cli wiki create -n <name>
```

Options:
- `-n, --name <name>`: Wiki name (required)
- `-p, --project <projectId>`: Project ID
- `-m, --mapped-path <path>`: Mapped path

### Update Wiki Page

Updates a wiki page:

```bash
azure-devops-cli wiki update -w <wikiIdentifier> -p <path> -c <content>
```

Options:
- `-w, --wiki <wikiIdentifier>`: Wiki identifier (required)
- `-p, --path <path>`: Page path (required)
- `-c, --content <content>`: Page content (required)
- `--comment <comment>`: Comment for the update

## Examples

### List all wikis in the project

```bash
azure-devops-cli wiki list
```

### List pages in a wiki

```bash
azure-devops-cli wiki pages -w MyWiki
```

### Get a specific wiki page

```bash
azure-devops-cli wiki page -w MyWiki -p /Home
```

### Create a new wiki

```bash
azure-devops-cli wiki create -n "Project Documentation"
```

### Update a wiki page

```bash
azure-devops-cli wiki update -w MyWiki -p /Home -c "# Welcome to the Wiki\n\nThis is the home page."
```

## Troubleshooting

If you encounter issues:

1. Ensure your environment variables are correctly set
2. Verify your PAT has the appropriate permissions
3. Check that the wiki and page paths exist
4. For detailed error messages, examine the error output

## Development

To modify or extend the CLI tool:

1. Edit the files in `src/cli/`
2. Run `npm run build` to compile the changes
3. Test your changes with `npm run test:cli`