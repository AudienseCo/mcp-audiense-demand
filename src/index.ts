#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerTools } from "./tools.js";
import { runSSEServer } from "./servers/sse-server.js";
import { runStdioServer } from "./servers/stdio-server.js";

const args = process.argv.slice(2);
const serverType = args[0]?.toLowerCase();

const server = new McpServer({
  name: "audiense-demand",
  version: "1.0.0",
  description: "Audiense Demand API MCP Server",
});

registerTools(server);

if (serverType === "sse") {
  console.error("Starting SSE server...");
  runSSEServer(server);
} else {
  console.error("Starting STDIO server...");
  runStdioServer(server).catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}
