# Wiki Page Newline Character Fix

## Issue Description

When creating or updating wiki pages using the Azure DevOps Content Search and Wiki Update Tool, newline characters (`\n\n`) in the content file were being displayed literally in the wiki page instead of being rendered as actual line breaks. This was happening because the content was being sent to the Azure DevOps API without processing escape sequences.

## Root Cause

In the `updateWikiPage` function in `src/index.ts`, the content was read from the file using `fs.readFileSync(contentFile, 'utf8')` but there was no processing of escape sequences before sending it to the API. As a result, literal `\n\n` strings in the content file were being sent as-is to the API and displayed literally in the wiki page.

```typescript
// Before the fix
const content = fs.readFileSync(contentFile, 'utf8');
```

## Solution

The solution was to add a processing step that converts literal `\n` sequences to actual newline characters before sending the content to the API:

```typescript
// After the fix
let content = fs.readFileSync(contentFile, 'utf8');
    
// Process escape sequences in the content
// This will convert literal \n sequences to actual newlines
content = content.replace(/\\n/g, '\n');
```

This ensures that when the content contains escape sequences like `\n\n`, they are properly converted to actual newline characters before being sent to the Azure DevOps API.

## Testing

To test this fix, we created a test file (`test-with-escapes.md`) with explicit `\n\n` sequences and used the tool to create a wiki page with this content. The resulting wiki page correctly displayed the content with proper line breaks instead of showing the literal `\n\n` sequences.

## Usage Example

```bash
node dist/index.js --update-wiki "WikiName" "/Page-Path" "./content-file.md"
```

## Notes

- This fix only addresses literal `\n` sequences in the content file. Regular newlines in the markdown file are already handled correctly.
- The fix uses a regular expression to replace all occurrences of `\n` with actual newline characters.