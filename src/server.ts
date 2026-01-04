import express, { Request, Response } from "express";

const app = express();
app.use(express.json());

// Railway injects PORT as a string; coerce to number for Express
const PORT: number = Number(process.env.PORT) || 8000;

/**
 * MCP JSON-RPC endpoint
 */
app.post("/mcp", (req: Request, res: Response) => {
  const { id, method, params } = req.body ?? {};

  // Basic JSON-RPC validation
  if (!method || typeof method !== "string") {
    return res.status(400).json({
      jsonrpc: "2.0",
      id: id ?? null,
      error: {
        code: -32600,
        message: "Invalid Request"
      }
    });
  }

  /**
   * MCP: initialize
   */
  if (method === "initialize") {
    return res.json({
      jsonrpc: "2.0",
      id,
      result: {
        protocolVersion: "2024-11-05",
        serverInfo: {
          name: "faircher-mcp",
          version: "0.1.0"
        },
        capabilities: {
          tools: {}
        }
      }
    });
  }

  /**
   * MCP: tools/list
   */
  if (method === "tools/list") {
    return res.json({
      jsonrpc: "2.0",
      id,
      result: {
        tools: [
          {
            name: "faircher.entity_lookup",
            description:
              "Resolve a business name or domain into a canonical Faircher entity and associated domains.",
            inputSchema: {
              type: "object",
              properties: {
                input: { type: "string" },
                source: {
                  type: "string",
                  enum: ["user", "crm", "domain", "url", "unknown"],
                  default: "unknown"
                }
              },
              required: ["input"]
            }
          },
          {
            name: "faircher.get_ad_activity",
            description: "Return advertiser activity metrics",
            inputSchema: {
              type: "object",
              properties: {
                advertiserId: { type: "string" }
              },
              required: ["advertiserId"]
            }
          }
        ]
      }
    });
  }

  /**
   * MCP: tools/call
   */
  if (method === "tools/call") {
    const toolName = params?.name;
    const args = params?.arguments ?? {};

    /**
     * Tool: faircher.entity_lookup
     */
    if (toolName === "faircher.entity_lookup") {
      const input = args.input;

      return res.json({
        jsonrpc: "2.0",
        id,
        result: {
          content: [
            {
              type: "json",
              data: {
                status: "matched",
                entityId: "fc_ent_demo_001",
                canonicalName: input,
                entityType: "advertiser",
                domains: [],
                primaryDomain: null,
                matchConfidence: "low",
                matchedFrom: "name"
              }
            }
          ]
        }
      });
    }

    /**
     * Tool: faircher.get_ad_activity
     */
    if (toolName === "faircher.get_ad_activity") {
      return res.json({
        jsonrpc: "2.0",
        id,
        result: {
          content: [
            {
              type: "json",
              data: {
                advertiserId: args.advertiserId ?? null,
                impressions: 12345,
                clicks: 678,
                spendUsd: 432.1
              }
            }
          ]
        }
      });
    }

    return res.json({
      jsonrpc: "2.0",
      id,
      error: {
        code: -32601,
        message: `Tool not found: ${toolName}`
      }
    });
  }

  /**
   * Unknown method
   */
  return res.json({
    jsonrpc: "2.0",
    id,
    error: {
      code: -32601,
      message: `Method not found: ${method}`
    }
  });
});

/**
 * Optional health endpoint (safe for Railway, ignored by MCP)
 */
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

/**
 * Start server
 */
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Faircher MCP server listening on port ${PORT}`);
});
