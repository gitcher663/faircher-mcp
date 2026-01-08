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

/**
 * Helper to wrap ALL responses in MCP format
 */
function mcpResponse(payload: unknown) {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(payload, null, 2)
      }
    ]
  };
}

async function handleRequest(req: MCPRequest) {
  const { method, params } = req;

  console.log("MCP METHOD:", method);
  console.log("MCP PARAMS:", JSON.stringify(params, null, 2));

  if (method === "initialize") {
    return mcpResponse({
      protocolVersion: "2024-11-05",
      capabilities: {
        tools: {}
      }
    });
  }

  if (method === "tools/list") {
    return mcpResponse(
      tools.map((t: McpTool) => ({
        name: t.name,
        description: t.description,
        inputSchema: t.inputSchema
      }))
    );
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

    const result = await tool.run(params.arguments ?? {});
    return mcpResponse(result);
  }

  throw new Error(`Unknown MCP method: ${method}`);
}

const PORT = Number(process.env.PORT || 3000);

createServer((req, res) => {
  let body = "";

  req.on("data", chunk => {
    body += chunk;
  });

  req.on("end", async () => {
    console.log("RAW REQUEST BODY:", body);

    try {
      const json = JSON.parse(body);
      const result = await handleRequest(json);

      console.log("MCP RESPONSE:", JSON.stringify(result, null, 2));

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err: any) {
      console.error("SERVER ERROR:", err);

      const errorResponse = mcpResponse({
        error: err?.message || "Internal server error"
      });

      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify(errorResponse));
    }
  });
}).listen(PORT, "0.0.0.0", () => {
  console.log(`MCP server listening on port ${PORT}`);
});
