import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { AzureDevOpsConnection } from '../../api/connection.js';
import { AzureDevOpsConfig } from '../../config/environment.js';
import fetch from 'node-fetch';

interface UpdateWikiPageArgs {
  wikiIdentifier: string;
  path: string;
  content: string;
  comment?: string;
  projectName?: string;
}

export async function updateWikiPage(args: UpdateWikiPageArgs, config: AzureDevOpsConfig) {
  if (!args.wikiIdentifier || !args.path || !args.content) {
    throw new McpError(
      ErrorCode.InvalidParams,
      'Wiki identifier, page path, and content are required'
    );
  }

  try {
    // Initialize the connection
    AzureDevOpsConnection.initialize(config);
    
    // Use the project name from args if provided, otherwise use the one from config
    const projectName = args.projectName || config.project;
    
    // Get the WikiApi instance directly from the connection
    const wikiApi = AzureDevOpsConnection.getWikiApi();
    
    console.log(`Updating wiki page in project ${projectName}, wiki ${args.wikiIdentifier}, path ${args.path}`);
    
    // First verify the wiki exists
    try {
      const wiki = await wikiApi.getWiki(projectName, args.wikiIdentifier);
      console.log(`Wiki found: ${wiki.name} (${wiki.id})`);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Unauthorized')) {
        throw new McpError(
          ErrorCode.InternalError,
          `Unauthorized access to wiki ${args.wikiIdentifier}. Please check your Personal Access Token (PAT) permissions.`
        );
      }
      
      console.log(`Error getting wiki: ${error instanceof Error ? error.message : String(error)}`);
      // Continue anyway as the wiki might exist but the getWiki method might have issues
    }

    try {
      // Use the PUT method directly with the correct headers for updating
      const token = Buffer.from(`:${config.pat}`).toString('base64');
      const baseUrl = `${config.orgUrl}/${projectName}/_apis/wiki/wikis/${args.wikiIdentifier}`;
      const encodedPath = encodeURIComponent(args.path);
      
      // First, try to get the current page to get its ETag
      const pageResponse = await fetch(
        `${baseUrl}/pages?path=${encodedPath}&includeContent=true&api-version=7.0`,
        {
          headers: {
            Authorization: `Basic ${token}`,
          },
        }
      );
      
      if (!pageResponse.ok && pageResponse.status !== 404) {
        throw new Error(`Failed to get wiki page: ${pageResponse.statusText}`);
      }
      
      // Get the ETag if the page exists
      let etag = '';
      if (pageResponse.ok) {
        etag = pageResponse.headers.get('etag') || '';
        console.log(`Found existing page with ETag: ${etag}`);
      }
      
      // Prepare headers for the update request
      const headers: Record<string, string> = {
        'Authorization': `Basic ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      
      // Add If-Match header if we have an ETag
      if (etag) {
        headers['If-Match'] = etag;
      }
      
      // Make the update request
      const updateResponse = await fetch(
        `${baseUrl}/pages?path=${encodedPath}&api-version=7.0`,
        {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            content: args.content,
            comment: args.comment || `Updated page ${args.path}`
          })
        }
      );
      
      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        throw new Error(`Failed to update wiki page: ${updateResponse.status} ${updateResponse.statusText} - ${errorText}`);
      }
      
      const result = await updateResponse.json();

      // Return the result with proper response formatting
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              wikiIdentifier: args.wikiIdentifier,
              path: args.path,
              contentPreview: args.content.substring(0, 100) + (args.content.length > 100 ? '...' : ''),
              message: 'Wiki page updated successfully',
              lastUpdatedBy: result.lastUpdatedBy?.displayName || 'Unknown',
              lastUpdatedDate: result.lastUpdatedDate || new Date().toISOString()
            }, null, 2),
          },
        ],
      };
    } catch (updateError) {
      if (updateError instanceof Error && updateError.message.includes('Unauthorized')) {
        throw new McpError(
          ErrorCode.InternalError,
          `Unauthorized access when updating wiki page. Please check your Personal Access Token (PAT) permissions.`
        );
      }
      throw updateError;
    }
  } catch (error: unknown) {
    if (error instanceof McpError) throw error;
    
    // If the error is "Wiki not found", add a more helpful message
    if (error instanceof Error && error.message.includes('Wiki not found')) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Wiki ${args.wikiIdentifier} not found. Make sure to provide the correct projectName parameter.`
      );
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to update wiki page: ${errorMessage}`
    );
  }
}