import { createServer } from "http";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { tools } from "./tools/index.js";

const mcp = new McpServer({
  name: "faircher",
  version: "1.0.0",
});

for (const tool of tools) {
  mcp.registerTool(tool.name, tool.definition, tool.handler);
}

const transport = new StreamableHTTPServerTransport({
  sessionIdGenerator: undefined,
});

const server = createServer(async (req, res) => {
  if (req.method === "GET" || req.method === "POST") {
    await transport.handleRequest(req, res);
    return;
  }

  res.writeHead(405, { "Content-Type": "text/plain" });
  res.end("Method Not Allowed");
});

const port = Number(process.env.PORT) || 3000;
await mcp.connect(transport);
server.listen(port, () => {
  console.log(`MCP listening on ${port}`);
});
