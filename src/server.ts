import { createServer } from "http";
import { tools } from "../tools";
import type { McpTool } from "../tools";

type MCPRequest = {
  method: string;
  params?: {
    name?: string;
    arguments?: Record<string, unknown>;
  };
};

async function handleRequest(req: MCPRequest) {
  const { method, params } = req;

  if (method === "initialize") {
    return {
      protocolVersion: "2024-11-05",
      capabilities: {
        tools: {}
      }
    };
  }

  if (method === "tools/list") {
    return {
      tools: tools.map(t => ({
        name: t.name,
        description: t.description,
        inputSchema: t.inputSchema
      }))
    };
  }

  if (method === "tools/call") {
    if (!params?.name) {
      throw new Error("Missing tool name");
    }

    const tool = tools.find(
      (t: McpTool) => t.name === params.name
    );

    if (!tool) {
      throw new Error("Tool not found");
    }

    return await tool.run(params.arguments ?? {});
  }

  throw new Error(`Unknown method: ${method}`);
}

createServer((req, res) => {
  let body = "";

  req.on("data", chunk => (body += chunk));
  req.on("end", async () => {
    try {
      const json = JSON.parse(body);
      const result = await handleRequest(json);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err: any) {
      res.writeHead(500);
      res.end(err.message);
    }
  });
}).listen(3000);
