#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

export async function runStdioServer(server: McpServer) {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Audiense Demand MCP Server running on stdio");
}