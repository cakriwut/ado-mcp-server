import * as dotenv from 'dotenv';
import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config();

// Azure DevOps connection details
const organization = process.env.AZURE_DEVOPS_ORG;
const project = process.env.AZURE_DEVOPS_PROJECT;
const pat = process.env.AZURE_DEVOPS_PAT;

// Command line arguments
const args = process.argv.slice(2);
let operation = "search"; // Default operation is search
let searchTerm = "Test-MCP-Page";
let searchType = "all";
let wikiName = "";
let wikiPath = "";
let contentFile = "";
let wikiType = ""; // For create-wiki operation

// Define interfaces for better type safety
interface ResponseWithEtag {
  _etag?: string;
  [key: string]: any;
}

// Parse command line arguments
if (args.includes("--help") || args.includes("-h")) {
  displayUsage();
  process.exit(0);
} else if (args.includes("--update-wiki") || args.includes("-u")) {
  operation = "update-wiki";
  const updateIndex = args.indexOf("--update-wiki") !== -1 ? 
    args.indexOf("--update-wiki") : args.indexOf("-u");
  
  if (args.length > updateIndex + 3) {
    wikiName = args[updateIndex + 1];
    wikiPath = args[updateIndex + 2];
    contentFile = args[updateIndex + 3];
  } else {
    console.error("Error: Missing required parameters for wiki update.");
    displayUsage();
    process.exit(1);
  }
} else if (args.includes("--create-wiki") || args.includes("-c")) {
  operation = "create-wiki";
  const createIndex = args.indexOf("--create-wiki") !== -1 ? 
    args.indexOf("--create-wiki") : args.indexOf("-c");
  
  if (args.length > createIndex + 2) {
    wikiName = args[createIndex + 1];
    wikiType = args[createIndex + 2]; // "projectWiki" or "codeWiki"
  } else {
    console.error("Error: Missing required parameters for wiki creation.");
    displayUsage();
    process.exit(1);
  }
} else {
  // Search operation
  if (args.length > 0) {
    searchTerm = args[0];
  }
  
  if (args.length > 1) {
    searchType = args[1].toLowerCase();
  }
}

// Base64 encode the PAT for Basic Auth
const token = Buffer.from(`:${pat}`).toString('base64');

/**
 * Make a GET request to the Azure DevOps REST API
 */
function makeGetRequest(url: string): Promise<ResponseWithEtag> {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'Authorization': `Basic ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    https.get(url, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const parsedData: ResponseWithEtag = JSON.parse(data);
            // Store the ETag header if present
            if (res.headers.etag) {
              parsedData._etag = res.headers.etag;
            }
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
  });
}

/**
 * Make a POST request to the Azure DevOps REST API
 */
function makePostRequest(url: string, body: any): Promise<ResponseWithEtag> {
  return new Promise((resolve, reject) => {
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
            const parsedData: ResponseWithEtag = JSON.parse(data);
            if (res.headers.etag) {
              parsedData._etag = res.headers.etag;
            }
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

/**
 * Make a PUT request to the Azure DevOps REST API
 */
function makePutRequest(url: string, body: any, headers: any = {}): Promise<ResponseWithEtag> {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'PUT',
      headers: {
        'Authorization': `Basic ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...headers
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
            // Store the ETag header if present
            let responseData: ResponseWithEtag = {};
            if (data.length > 0) {
              responseData = JSON.parse(data);
            }
            if (res.headers.etag) {
              responseData._etag = res.headers.etag;
            }
            resolve(responseData);
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

/**
 * Main function to determine which operation to perform
 */
async function main(): Promise<void> {
  try {
    if (!organization || !project || !pat) {
      throw new Error('Missing required environment variables (AZURE_DEVOPS_ORG, AZURE_DEVOPS_PROJECT, or AZURE_DEVOPS_PAT)');
    }

    if (operation === "search") {
      await searchAzureDevOps();
    } else if (operation === "update-wiki") {
      await updateWikiPage();
    } else if (operation === "create-wiki") {
      await createWiki();
    }
  } catch (error) {
    console.error("Error occurred:", error);
  }
}

/**
 * Search for content in Azure DevOps
 */
async function searchAzureDevOps(): Promise<void> {
  try {
    console.log(`Searching for "${searchTerm}" in project: ${project}`);
    console.log(`Search type: ${searchType}`);
    console.log("This may take a moment...\n");

    // Determine which search types to perform
    const searchAll = searchType === 'all';
    
    // 1. Use the unified search API if searching all
    if (searchAll) {
      await unifiedSearch();
    }
    
    // 2. Search in Wiki pages
    if (searchAll || searchType === 'wiki') {
      await searchWikiPages();
    }
    
    // 3. Search in Code repositories
    if (searchAll || searchType === 'code') {
      await searchCodeRepositories();
    }
    
    // 4. Search in Work Items
    if (searchAll || searchType === 'workitem' || searchType === 'work') {
      await searchWorkItems();
    }

  } catch (error) {
    console.error("Error occurred:", error);
  }
}

/**
 * Create a new wiki in Azure DevOps
 */
async function createWiki(): Promise<void> {
  try {
    console.log(`Creating wiki in project: ${project}`);
    console.log(`Wiki name: ${wikiName}`);
    console.log(`Wiki type: ${wikiType}`);
    console.log("This may take a moment...\n");

    // First, get the project ID
    const projectUrl = `https://dev.azure.com/${organization}/_apis/projects/${project}?api-version=7.0`;
    const projectResponse = await makeGetRequest(projectUrl);
    const projectId = projectResponse.id;
    
    if (!projectId) {
      console.log(`Could not find project ID for project: ${project}`);
      return;
    }
    
    console.log(`Found project ID: ${projectId}`);

    // Check if the wiki already exists
    const wikisUrl = `https://dev.azure.com/${organization}/${project}/_apis/wiki/wikis?api-version=7.0`;
    const wikisResponse = await makeGetRequest(wikisUrl);
    
    if (wikisResponse.value && wikisResponse.value.length > 0) {
      const existingWiki = wikisResponse.value.find((w: any) => w.name === wikiName);
      if (existingWiki) {
        console.log(`Wiki "${wikiName}" already exists.`);
        console.log(`URL: https://dev.azure.com/${organization}/${project}/_wiki/wikis/${wikiName}`);
        return;
      }
    }
    
    // Create the wiki
    const createUrl = `https://dev.azure.com/${organization}/${project}/_apis/wiki/wikis?api-version=7.0`;
    
    const createBody = {
      name: wikiName,
      projectId: projectId,
      type: wikiType
    };
    
    try {
      const createResponse = await makePostRequest(createUrl, createBody);
      
      console.log(`Wiki "${wikiName}" created successfully.`);
      console.log(`Wiki ID: ${createResponse.id}`);
      console.log(`URL: https://dev.azure.com/${organization}/${project}/_wiki/wikis/${wikiName}`);
    } catch (error) {
      console.log(`Error creating wiki: ${error}`);
    }
  } catch (error) {
    console.log(`Error creating wiki: ${error}`);
  }
}

/**
 * Update a wiki page in Azure DevOps
 */
async function updateWikiPage(): Promise<void> {
  try {
    console.log(`Updating wiki page in project: ${project}`);
    console.log(`Wiki: ${wikiName}`);
    console.log(`Path: ${wikiPath}`);
    console.log(`Content file: ${contentFile}`);
    console.log("This may take a moment...\n");

    // First, get the list of wikis in the project to find the wiki ID
    const wikisUrl = `https://dev.azure.com/${organization}/${project}/_apis/wiki/wikis?api-version=7.0`;
    const wikisResponse = await makeGetRequest(wikisUrl);
    
    if (!wikisResponse.value || wikisResponse.value.length === 0) {
      console.log("No wikis found in the project.");
      return;
    }
    
    // Find the wiki by name
    const wiki = wikisResponse.value.find((w: any) => w.name === wikiName);
    
    if (!wiki) {
      console.log(`Wiki "${wikiName}" not found in the project.`);
      console.log("Available wikis:");
      wikisResponse.value.forEach((w: any) => {
        console.log(`- ${w.name}`);
      });
      return;
    }
    
    // Read the content file
    if (!fs.existsSync(contentFile)) {
      console.log(`Content file "${contentFile}" not found.`);
      return;
    }
    
    const content = fs.readFileSync(contentFile, 'utf8');
    
    // Process the wiki path
    let formattedPath = wikiPath;
    
    // Ensure the path starts with a slash
    if (!formattedPath.startsWith('/')) {
      formattedPath = `/${formattedPath}`;
    }
    
    // Remove .md extension if present in the path
    if (formattedPath.toLowerCase().endsWith('.md')) {
      console.log(`Removing .md extension from path: ${formattedPath}`);
      formattedPath = formattedPath.substring(0, formattedPath.length - 3);
      console.log(`New path: ${formattedPath}`);
    }
    
    // Check if the page exists
    let pageExists = false;
    let etag = "";
    let existingContent = "";
    
    try {
      const pageUrl = `https://dev.azure.com/${organization}/${project}/_apis/wiki/wikis/${wiki.id}/pages?path=${encodeURIComponent(formattedPath)}&includeContent=true&api-version=7.0`;
      const pageResponse = await makeGetRequest(pageUrl);
      pageExists = true;
      existingContent = pageResponse.content || "";
      etag = pageResponse._etag || "";
      
      console.log("Page exists, will update content.");
      
      // Compare existing content with new content
      if (existingContent === content) {
        console.log("No changes detected. The page already contains the exact same content.");
        console.log(`URL: https://dev.azure.com/${organization}/${project}/_wiki/wikis/${wikiName}${formattedPath}`);
        return;
      }
    } catch (error) {
      pageExists = false;
      console.log("Page does not exist, will create new page.");
    }
    
    try {
      // Use PUT for both creating and updating
      const updateUrl = `https://dev.azure.com/${organization}/${project}/_apis/wiki/wikis/${wiki.id}/pages?path=${encodeURIComponent(formattedPath)}&api-version=7.0`;
      
      const updateBody = {
        content: content
      };
      
      let headers = {};
      if (pageExists && etag) {
        // For updating an existing page, include the If-Match header with the ETag
        console.log(`Using ETag: ${etag} for update`);
        headers = {
          'If-Match': etag
        };
      }
      
      const updateResponse = await makePutRequest(updateUrl, updateBody, headers);
      
      console.log(`Wiki page ${pageExists ? 'updated' : 'created'} successfully.`);
      if (updateResponse._etag) {
        console.log(`New ETag: ${updateResponse._etag}`);
      }
      console.log(`URL: https://dev.azure.com/${organization}/${project}/_wiki/wikis/${wikiName}${formattedPath}`);
    } catch (error) {
      console.log(`Error ${pageExists ? 'updating' : 'creating'} wiki page: ${error}`);
    }
  } catch (error) {
    console.log(`Error updating wiki page: ${error}`);
  }
}

/**
 * Perform a unified search across all content types
 */
async function unifiedSearch(): Promise<void> {
  try {
    console.log("=== UNIFIED SEARCH ACROSS ALL CONTENT ===");
    
    // Use the unified search API
    const searchUrl = `https://almsearch.dev.azure.com/${organization}/_apis/search/universalsearchresults?api-version=7.0-preview.1`;
    const searchBody = {
      searchText: searchTerm,
      filters: {
        "Project": [project]
      },
      $top: 100,
      $skip: 0
    };
    
    try {
      const searchResponse = await makePostRequest(searchUrl, searchBody);
      
      if (searchResponse.results && searchResponse.results.length > 0) {
        console.log(`\nFound ${searchResponse.results.length} results across all content types:`);
        
        searchResponse.results.forEach((result: any, index: number) => {
          console.log(`\n[${index + 1}] ${result.type}: ${result.title || result.fileName || result.id}`);
          console.log(`  Project: ${result.project}`);
          
          if (result.type === "Code") {
            console.log(`  Repository: ${result.repository?.name}`);
            console.log(`  Path: ${result.path}`);
            console.log(`  URL: https://dev.azure.com/${organization}/${project}/_git/${result.repository?.name}?path=${encodeURIComponent(result.path)}`);
          } else if (result.type === "Wiki") {
            console.log(`  Wiki: ${result.collection?.name}`);
            console.log(`  Path: ${result.path}`);
            console.log(`  URL: https://dev.azure.com/${organization}/${project}/_wiki/wikis/${result.collection?.name}${result.path}`);
          } else if (result.type === "WorkItem") {
            console.log(`  ID: ${result.id}`);
            console.log(`  Type: ${result.fields?.["System.WorkItemType"]}`);
            console.log(`  State: ${result.fields?.["System.State"]}`);
            console.log(`  URL: https://dev.azure.com/${organization}/${project}/_workitems/edit/${result.id}`);
          }
        });
      } else {
        console.log(`\nNo results found for "${searchTerm}" across all content types.`);
      }
    } catch (error) {
      console.log(`Error performing unified search: ${error}`);
      console.log("Unified search API might not be available or configured correctly.");
    }
  } catch (error) {
    console.log(`Error performing unified search: ${error}`);
  }
}

/**
 * Search for wiki pages in Azure DevOps
 */
async function searchWikiPages(): Promise<void> {
  try {
    console.log("\n=== SEARCHING IN WIKI PAGES ===");
    
    // First, get the list of wikis in the project
    const wikisUrl = `https://dev.azure.com/${organization}/${project}/_apis/wiki/wikis?api-version=7.0`;
    const wikisResponse = await makeGetRequest(wikisUrl);
    
    if (!wikisResponse.value || wikisResponse.value.length === 0) {
      console.log("No wikis found in the project.");
      return;
    }
    
    console.log(`Found ${wikisResponse.value.length} wikis in the project.`);
    
    // For each wiki, search for pages
    let foundPages = 0;
    
    for (const wiki of wikisResponse.value) {
      console.log(`\nSearching in wiki: ${wiki.name}`);
      
      try {
        // Use the Search API to search for wiki content
        const searchUrl = `https://almsearch.dev.azure.com/${organization}/_apis/search/wikisearchresults?api-version=7.0`;
        const searchBody = {
          searchText: searchTerm,
          $skip: 0,
          $top: 100,
          filters: {
            "Wiki": [wiki.name]
          }
        };
        
        const searchResponse = await makePostRequest(searchUrl, searchBody);
        
        if (searchResponse.count && searchResponse.count > 0 && searchResponse.results) {
          console.log(`\nFound ${searchResponse.count} matches in wiki: ${wiki.name}`);
          
          searchResponse.results.forEach((result: any, index: number) => {
            console.log(`\n[${index + 1}] Page: ${result.fileName}`);
            console.log(`  Path: ${result.path}`);
            console.log(`  Wiki: ${result.collection.name}`);
            console.log(`  URL: https://dev.azure.com/${organization}/${project}/_wiki/wikis/${wiki.name}${result.path}`);
            
            foundPages++;
          });
        } else {
          console.log(`No matches found in wiki: ${wiki.name}`);
        }
      } catch (error) {
        console.log(`Error searching in wiki ${wiki.name}: ${error}`);
        console.log("Wiki search API might not be available or configured correctly.");
      }
    }
    
    if (foundPages === 0) {
      console.log("\nNo wiki pages containing the search term were found.");
    } else {
      console.log(`\nTotal wiki pages found containing "${searchTerm}": ${foundPages}`);
    }
  } catch (error) {
    console.log(`Error searching wiki pages: ${error}`);
  }
}

/**
 * Search for code in repositories
 */
async function searchCodeRepositories(): Promise<void> {
  try {
    console.log("\n=== SEARCHING IN CODE REPOSITORIES ===");
    
    // First, get the list of repositories in the project
    const reposUrl = `https://dev.azure.com/${organization}/${project}/_apis/git/repositories?api-version=7.0`;
    const reposResponse = await makeGetRequest(reposUrl);
    
    if (!reposResponse.value || reposResponse.value.length === 0) {
      console.log("No repositories found in the project.");
      return;
    }
    
    console.log(`Found ${reposResponse.value.length} repositories in the project.`);
    
    // For each repository, search for files containing the search term
    let foundFiles = 0;
    
    for (const repo of reposResponse.value) {
      console.log(`\nSearching in repository: ${repo.name}`);
      
      try {
        // Use the Search API to search for code
        const searchUrl = `https://almsearch.dev.azure.com/${organization}/_apis/search/codesearchresults?api-version=7.0`;
        const searchBody = {
          searchText: searchTerm,
          $skip: 0,
          $top: 100,
          filters: {
            "Project": [project],
            "Repository": [repo.name]
          }
        };
        
        const searchResponse = await makePostRequest(searchUrl, searchBody);
        
        if (searchResponse.count && searchResponse.count > 0 && searchResponse.results) {
          console.log(`\nFound ${searchResponse.count} matches in repository: ${repo.name}`);
          
          searchResponse.results.forEach((result: any, index: number) => {
            console.log(`\n[${index + 1}] File: ${result.fileName}`);
            console.log(`  Path: ${result.path}`);
            console.log(`  Repository: ${result.repository.name}`);
            console.log(`  URL: https://dev.azure.com/${organization}/${project}/_git/${repo.name}?path=${encodeURIComponent(result.path)}`);
            
            if (result.matches && result.matches.length > 0) {
              console.log("  Matches:");
              result.matches.forEach((match: any, matchIndex: number) => {
                if (match.line) {
                  console.log(`    Line ${match.line.lineNumber}: ${match.line.text}`);
                }
              });
            }
            
            foundFiles++;
          });
        } else {
          console.log(`No matches found in repository: ${repo.name}`);
        }
      } catch (error) {
        console.log(`Error searching in repository ${repo.name}: ${error}`);
        console.log("Code search API might not be available or configured correctly.");
      }
    }
    
    if (foundFiles === 0) {
      console.log("\nNo code files containing the search term were found.");
    } else {
      console.log(`\nTotal code files found containing "${searchTerm}": ${foundFiles}`);
    }
  } catch (error) {
    console.log(`Error searching code repositories: ${error}`);
  }
}

/**
 * Search for work items
 */
async function searchWorkItems(): Promise<void> {
  try {
    console.log("\n=== SEARCHING IN WORK ITEMS ===");
    
    // Use the Search API to search for work items
    const searchUrl = `https://almsearch.dev.azure.com/${organization}/_apis/search/workitemsearchresults?api-version=7.0`;
    const searchBody = {
      searchText: searchTerm,
      $skip: 0,
      $top: 100
    };
    
    try {
      const searchResponse = await makePostRequest(searchUrl, searchBody);
      
      if (searchResponse.count && searchResponse.count > 0 && searchResponse.results) {
        console.log(`\nFound ${searchResponse.count} work items containing "${searchTerm}":`);
        
        searchResponse.results.forEach((result: any, index: number) => {
          console.log(`\n[${index + 1}] ID: ${result.id}`);
          console.log(`  Title: ${result.fields["System.Title"]}`);
          console.log(`  Type: ${result.fields["System.WorkItemType"]}`);
          console.log(`  URL: https://dev.azure.com/${organization}/${project}/_workitems/edit/${result.id}`);
        });
      } else {
        console.log(`\nNo work items containing "${searchTerm}" were found.`);
      }
    } catch (error) {
      console.log(`Error searching work items: ${error}`);
      console.log("Work item search API might not be available or configured correctly.");
    }
  } catch (error) {
    console.log(`Error searching work items: ${error}`);
  }
}

/**
 * Display usage information
 */
function displayUsage(): void {
  console.log(`
Usage: 
  Search:      node index.js "SearchTerm" [SearchType]
  Update Wiki: node index.js --update-wiki WikiName WikiPath ContentFile
  Create Wiki: node index.js --create-wiki WikiName WikiType
  Help:        node index.js --help

Search Options:
  SearchTerm: The term to search for (default: "Test-MCP-Page")
  SearchType: The type of content to search (default: "all")
    - "all": Search all content types
    - "wiki": Search only wiki pages
    - "code": Search only code repositories
    - "work" or "workitem": Search only work items

Update Wiki Options:
  WikiName:    The name of the wiki to update (e.g., "Cybersmart-Next.wiki")
  WikiPath:    The path of the page to update (e.g., "/Test-MCP-Page")
               Note: .md extension will be automatically removed if present
  ContentFile: The path to the file containing the new content

Create Wiki Options:
  WikiName: The name of the wiki to create (e.g., "MyNewWiki")
  WikiType: The type of wiki to create:
    - "projectWiki": Project wiki (default)
    - "codeWiki": Code wiki (requires additional parameters)

Examples:
  Search:
    node index.js "API Documentation" all
    node index.js "Bug" work
    node index.js "Function" code
    node index.js "Release Notes" wiki

  Update Wiki:
    node index.js --update-wiki "Cybersmart-Next.wiki" "/Test-MCP-Page" "./content.md"
    node index.js -u "Cybersmart-Next.wiki" "/Documentation/API" "./api-docs.md"

  Create Wiki:
    node index.js --create-wiki "MyNewWiki" "projectWiki"
    node index.js -c "CodeWiki" "codeWiki"
  `);
}

// Execute the main function
main();