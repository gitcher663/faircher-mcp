import { createServer } from "http";
import { tools } from "../tools";
import type { McpTool } from "../tools";

type McpRequest = {
  method: string;
  params?: {
    name?: string;
    arguments?: Record<string, unknown>;
  };
};

type McpResponse = {
  content?: {
    type: "text";
    text: string;
  }[];
};

async function handleRequest(req: McpRequest): Promise<McpResponse> {
  const { method, params } = req;

  if (method === "initialize") {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              protocolVersion: "2024-11-05",
              capabilities: { tools: {} }
            },
            null,
            2
          )
        }
      ]
    };
  }

  if (method === "tools/list") {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            tools.map((t: McpTool) => ({
              name: t.name,
              description: t.description,
              inputSchema: t.inputSchema
            })),
            null,
            2
          )
        }
      ]
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
      throw new Error(`Tool not found: ${params.name}`);
    }

    return await tool.run(params.arguments ?? {});
  }

  throw new Error(`Unknown MCP method: ${method}`);
}

createServer((req, res) => {
  let body = "";

  req.on("data", chunk => {
    body += chunk;
  });

  req.on("end", async () => {
    try {
      const parsed = JSON.parse(body) as McpRequest;
      const result = await handleRequest(parsed);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end(
        err instanceof Error ? err.message : "Unknown error"
      );
    }
  });
}).listen(3000);
