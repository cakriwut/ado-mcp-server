const dotenv = require('dotenv');
const azdev = require('azure-devops-node-api');

// Use any type for API interfaces since we don't have type definitions
type IWorkItemTrackingApi = any;
type IBuildApi = any;
type IGitApi = any;
type ICoreApi = any;
type IWikiApi = any;
type IWorkApi = any;

// Load environment variables from .env file
dotenv.config();

// Get environment variables
const orgUrl = `https://dev.azure.com/${process.env.AZURE_DEVOPS_ORG}`;
const token = process.env.AZURE_DEVOPS_PAT;
const project = process.env.AZURE_DEVOPS_PROJECT;

if (!token) {
  throw new Error('AZURE_DEVOPS_PAT environment variable is not set');
}

if (!process.env.AZURE_DEVOPS_ORG) {
  throw new Error('AZURE_DEVOPS_ORG environment variable is not set');
}

if (!project) {
  throw new Error('AZURE_DEVOPS_PROJECT environment variable is not set');
}

// Create a connection to Azure DevOps
const authHandler = azdev.getPersonalAccessTokenHandler(token);
const connection = new azdev.WebApi(orgUrl, authHandler);

// Helper function to get Work Item Tracking API
async function getWorkItemApi(): Promise<IWorkItemTrackingApi> {
  return await connection.getWorkItemTrackingApi();
}

// Helper function to get Build API
async function getBuildApi(): Promise<IBuildApi> {
  return await connection.getBuildApi();
}

// Helper function to get Git API
async function getGitApi(): Promise<IGitApi> {
  return await connection.getGitApi();
}

// Helper function to get Core API
async function getCoreApi(): Promise<ICoreApi> {
  return await connection.getCoreApi();
}

// Helper function to get Wiki API
async function getWikiApi(): Promise<IWikiApi> {
  return await connection.getWikiApi();
}

// Helper function to get Work API
async function getWorkApi(): Promise<IWorkApi> {
  return await connection.getWorkApi();
}

// Export common variables and functions
module.exports = {
  connection,
  project,
  orgUrl,
  token,
  getWorkItemApi,
  getBuildApi,
  getGitApi,
  getCoreApi,
  getWikiApi,
  getWorkApi
};