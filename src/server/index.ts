import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { checkAdvertisingActivity } from "./tools/checkAdvertisingActivity.js";

const server = new McpServer({
  name: "faircher",
  version: "1.0.0",
});

server.registerTool(
  checkAdvertisingActivity.name,
  checkAdvertisingActivity.definition,
  checkAdvertisingActivity.handler
);

// MCP servers DO NOT call `start()`
// Railway will invoke the process automatically
export default server;
