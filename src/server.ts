import { createServer } from "http";
import { tools } from "../tools";
import type { McpTool } from "../tools";

/**
 * BUILD VERIFICATION LOG
 * If you do not see this in Railway logs,
 * the deployed code is NOT this file.
 */
console.log("SERVER CODE VERSION:", "WITH_TOOLS_CAPABILITY");

type MCPRequest = {
  method: string;
  params?: {
    name?: string;
    arguments?: Record<string, unknown>;
  };
};

/**
 * Text response helper (used only for errors / non-tool replies)
 */
function textResponse(payload: unknown) {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(payload, null, 2),
      },
    ],
  };
}

async function handleRequest(req: MCPRequest) {
  const { method, params } = req;

  console.log("MCP METHOD:", method);
  console.log("MCP PARAMS:", JSON.stringify(params, null, 2));

  /**
   * INITIALIZE
   * Advertise tool capability explicitly
   */
  if (method === "initialize") {
    return {
      protocolVersion: "2024-11-05",
      capabilities: {
        tools: {
          list: true,
          call: true,
        },
      },
    };
  }

  /**
   * TOOLS LIST
   */
  if (method === "tools/list") {
    console.log("TOOLS LIST REQUESTED");

    return {
      tools: tools.map((t: McpTool) => ({
        name: t.name,
        description: t.description,
        inputSchema: t.inputSchema,
      })),
    };
  }

  /**
   * TOOL CALL
   */
  if (method === "tools/call") {
    if (!params?.name) {
      throw new Error("Missing tool name");
    }

    const tool = tools.find((t: McpTool) => t.name === params.name);

    if (!tool) {
      throw new Error(`Tool not found: ${params.name}`);
    }

    console.log("TOOL INVOKED:", tool.name);
    console.log("TOOL ARGUMENTS:", params.arguments ?? {});

    const result = await tool.run(params.arguments ?? {});

    console.log("TOOL RESULT:", result);

    /**
     * IMPORTANT:
     * Tool calls must return RAW result
     */
    return result;
  }

  throw new Error(`Unknown MCP method: ${method}`);
}

const PORT = Number(process.env.PORT || 8080);

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

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err: any) {
      console.error("SERVER ERROR:", err);

      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify(
          textResponse({
            error: err?.message || "Internal server error",
          })
        )
      );
    }
  });
}).listen(PORT, "0.0.0.0", () => {
  console.log(`MCP server listening on port ${PORT}`);
});
