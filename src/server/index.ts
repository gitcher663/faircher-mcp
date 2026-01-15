import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerWidget } from "./resources/widget.js";
import { searchAdsTool } from "./tools/searchAds.js";

const server = new McpServer({
  name: "faircher",
  version: "1.0.0",
});

registerWidget(server);
server.registerTool(...searchAdsTool);

server.start();
