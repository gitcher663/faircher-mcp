import express, { Request, Response } from "express";
import type { Tool } from "@modelcontextprotocol/sdk/types";

interface JsonRpcRequest {
  jsonrpc: string;
  method: string;
  id?: string | number | null;
  params?: Record<string, unknown>;
}

interface JsonRpcResponse {
  jsonrpc: "2.0";
  id: string | number | null;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

interface ToolWithHandler extends Tool {
  handler: (params?: Record<string, unknown>) => Promise<unknown>;
}

const tools: Record<string, ToolWithHandler> = {
  "faircher.get_ad_activity": {
    name: "faircher.get_ad_activity",
    description: "Fetches mock advertising platform activity for Faircher research use.",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
    handler: async () => ({
      content: [
        {
          type: "text",
          text: JSON.stringify(
            [
              {
                platform: "Google Ads",
                verticals: ["Retail", "Finance"],
                status: "active",
              },
              {
                platform: "Meta Ads",
                verticals: ["E-commerce", "Travel"],
                status: "paused",
              },
              {
                platform: "LinkedIn Ads",
                verticals: ["B2B", "SaaS"],
                status: "active",
              },
            ],
            null,
            2
          ),
        },
      ],
    }),
  },
};

function buildError(id: JsonRpcResponse["id"], code: number, message: string, data?: unknown): JsonRpcResponse {
  return {
    jsonrpc: "2.0",
    id,
    error: { code, message, data },
  };
}

async function handleRpc(body: JsonRpcRequest): Promise<JsonRpcResponse> {
  const id = body.id ?? null;

  if (body.jsonrpc !== "2.0") {
    return buildError(id, -32600, "Invalid Request: jsonrpc must be '2.0'.");
  }

  switch (body.method) {
    case "initialize": {
      return {
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: "2024-11-05",
          serverInfo: {
            name: "Faircher MCP HTTP",
            version: "0.1.0",
          },
          capabilities: {
            tools: {},
          },
        },
      };
    }
    case "tools/list": {
      return {
        jsonrpc: "2.0",
        id,
        result: {
          tools: Object.values(tools).map((tool) => ({
            name: tool.name,
            description: tool.description,
            inputSchema: tool.inputSchema,
          })),
        },
      };
    }
    case "tools/call": {
      const params = (body.params ?? {}) as Record<string, unknown>;
      const toolName = params.name;
      if (typeof toolName !== "string" || !(toolName in tools)) {
        return buildError(id, -32602, "Unknown tool name");
      }

      try {
        const tool = tools[toolName];
        const result = await tool.handler(params.arguments as Record<string, unknown> | undefined);
        return {
          jsonrpc: "2.0",
          id,
          result,
        };
      } catch (error) {
        return buildError(id, -32000, "Tool execution failed", {
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }
    default:
      return buildError(id, -32601, "Method not found");
  }
}

async function main(): Promise<void> {
  const app = express();
  app.use(express.json({ limit: "1mb" }));

  app.post("/mcp", async (req: Request, res: Response) => {
    const body = req.body as JsonRpcRequest | undefined;
    if (!body || typeof body !== "object") {
      res.status(400).json(buildError(null, -32600, "Invalid Request: missing body"));
      return;
    }

    const response = await handleRpc(body);
    res.json(response);
  });

  app.get("/", (_req: Request, res: Response) => {
    res.json({ status: "ok", endpoint: "/mcp" });
  });

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, "0.0.0.0", () => {
    console.log(`Faircher MCP server listening on port ${port}`);
  });
}

void main();
