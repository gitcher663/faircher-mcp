import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createMcpHttpServer } from "@modelcontextprotocol/sdk/server/http.js";
import { checkAdvertisingActivity } from "./tools/checkAdvertisingActivity.js";

const mcp = new McpServer({
  name: "faircher",
  version: "1.0.0",
});

mcp.registerTool(
  checkAdvertisingActivity.name,
  checkAdvertisingActivity.definition,
  checkAdvertisingActivity.handler
);

const server = createMcpHttpServer(mcp);

const port = Number(process.env.PORT) || 3000;
server.listen(port, () => {
  console.log(`Faircher MCP listening on port ${port}`);
});
