# Azure DevOps MCP Server Commands

## Work Item Tools
- [ ] get_work_item (Error: The expand parameter can not be used with the fields parameter)
- [X] list_work_items (Response too large and breaks the model, must have default limit)
- [ ] create_work_item (Error: Unknown tool: create_work_item)
- [ ] update_work_item (Error: Unknown tool: update_work_item)

## Board Tools
- [X] get_boards

## Wiki Tools
- [X] get_wikis
- [ ] list_wiki_pages (Error: Wiki not found)
- [ ] get_wiki_page (Error: Wiki not found)
- [ ] create_wiki (Error: Parameter 'MappedPath' is not expected for Project Wiki creation)
- [ ] update_wiki_page (Error: Wiki not found)

## Project Tools
- [X] list_projects

## Pipeline Tools
- [X] list_pipelines
- [X] trigger_pipeline

## Pull Request Tools
- [ ] list_pull_requests (Error: A project name is required in order to reference a Git repository by name)
- [ ] create_pull_request (Error: A source and a target reference cannot be the same)
- [ ] update_pull_request (Error: Pull Request with ID 1 not found)