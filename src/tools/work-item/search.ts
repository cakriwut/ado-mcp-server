import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { AzureDevOpsConnection } from '../../api/connection.js';
import { AzureDevOpsConfig } from '../../config/environment.js';
import * as https from 'https';

/**
 * Make a POST request to the Azure DevOps REST API
 */
function makePostRequest(url: string, body: any, pat: string): Promise<any> {
  return new Promise((resolve, reject) => {
    // Base64 encode the PAT for Basic Auth
    const token = Buffer.from(`:${pat}`).toString('base64');
    
    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    const req = https.request(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const parsedData = JSON.parse(data);
            resolve(parsedData);
          } catch (e) {
            reject(new Error(`Failed to parse response: ${e}`));
          }
        } else {
          reject(new Error(`Request failed with status code ${res.statusCode}: ${data}`));
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
    
    req.write(JSON.stringify(body));
    req.end();
  });
}

export interface SearchWorkItemsArgs {
  searchText: string;
  top?: number;
  skip?: number;
}

export async function searchWorkItems(args: SearchWorkItemsArgs, config: AzureDevOpsConfig) {
  if (!args.searchText) {
    throw new McpError(ErrorCode.InvalidParams, 'Search text is required');
  }

  try {
    // Use the Azure DevOps Search API to search for work items
    const organization = config.orgUrl.split('/')[3]; // Extract org name from URL
    const searchUrl = `https://almsearch.dev.azure.com/${organization}/_apis/search/workitemsearchresults?api-version=7.0`;
    
    const searchBody = {
      searchText: args.searchText,
      $skip: args.skip || 0,
      $top: args.top || 10 // Default to 10 results
      // Removed project filter as it's not supported by the API
    };
    
    // Make the POST request to the Search API
    const response = await makePostRequest(searchUrl, searchBody, config.pat);
    
    if (response.count && response.count > 0 && response.results) {
      // Format the results to match our standard output format
      const formattedResults = {
        asof: new Date().toISOString(),
        count: response.count,
        workItems: response.results.map((result: any) => {
          // Extract the work item ID from the fields or URL
          const id = result.fields?.["system.id"];
          const projectName = result.project?.name || config.project;
          
          return {
            id: id,
            state: result.fields?.["system.state"] || 'Unknown',
            title: result.fields?.["system.title"] || 'Untitled',
            url: `${config.orgUrl}/${projectName}/_workitems/edit/${id}`
          };
        })
      };
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(formattedResults, null, 2),
          },
        ],
      };
    } else {
      // Return empty results
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              asof: new Date().toISOString(),
              count: 0,
              workItems: []
            }, null, 2),
          },
        ],
      };
    }
  } catch (error: unknown) {
    if (error instanceof McpError) throw error;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to search work items: ${errorMessage}`
    );
  }
}