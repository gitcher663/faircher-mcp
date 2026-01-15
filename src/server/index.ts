import { createServer } from "http";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
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

const server = createServer(async (req, res) => {
  if (req.method === "POST") {
    await mcp.handleHttpRequest(req, res);
    return;
  }

  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Faircher MCP is running");
});

const port = Number(process.env.PORT) || 3000;
server.listen(port, () => {
  console.log(`MCP server listening on port ${port}`);
});
