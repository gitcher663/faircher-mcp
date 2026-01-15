import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { HttpTransport } from "@modelcontextprotocol/sdk/server/transports/http.js";
import { checkAdvertisingActivity } from "./tools/checkAdvertisingActivity.js";

const server = new McpServer({
  name: "faircher",
  version: "1.0.0",
});

server.registerTool(...checkAdvertisingActivity);

const transport = new HttpTransport({
  port: Number(process.env.PORT) || 3000,
});

await server.connect(transport);
