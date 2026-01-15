import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { checkAdvertisingActivity } from "./tools/checkAdvertisingActivity.js";

export const server = new McpServer({
  name: "FairCher",
  version: "1.0.0",
});

server.registerTool(...checkAdvertisingActivity);
