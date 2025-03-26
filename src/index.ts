#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerTools } from './tools.js';

const server = new McpServer({
  name: 'audiense-demand',
  version: '1.0.0',
  description: 'Audiense Demand API MCP Server',
});

registerTools(server);


async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Audiense Demand MCP Server running on stdio');
}

runServer().catch(error => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});
