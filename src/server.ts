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
          version: "0.2.0"
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
              "Resolve a business name, brand, or domain into a canonical Faircher entity. Returns the Faircher entity ID and associated metadata required for downstream tools.",
            inputSchema: {
              type: "object",
              properties: {
                input: {
                  type: "string",
                  description: "Business name, brand name, or domain to resolve"
                },
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
            name: "faircher.resolve_advertising_status",
            description:
              "Determine whether a resolved Faircher entity is currently or recently advertising based on detectable signals. Establishes advertising presence and recency without returning spend, creatives, or performance metrics.",
            inputSchema: {
              type: "object",
              properties: {
                entityId: {
                  type: "string",
                  description: "Canonical Faircher entity ID returned from entity_lookup"
                }
              },
              required: ["entityId"]
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

    console.log("MCP tool called:", toolName, args);

    /**
     * Tool: faircher.entity_lookup
     */
    if (toolName === "faircher.entity_lookup") {
      const input = args.input;

      const entityResult = {
        status: "matched",
        entityId: "fc_ent_demo_001",
        canonicalName: input,
        entityType: "advertiser",
        domains: [],
        primaryDomain: null,
        matchConfidence: "low",
        matchedFrom: "name"
      };

      console.log("Entity resolved:", entityResult);

      return res.json({
        jsonrpc: "2.0",
        id,
        result: {
          content: [
            {
              type: "json",
              data: entityResult
            }
          ]
        }
      });
    }

    /**
     * Tool: faircher.resolve_advertising_status
     */
    if (toolName === "faircher.resolve_advertising_status") {
      const entityId = args.entityId ?? null;

      // Stubbed logic — replace with real detection later
      const statusResult = {
        status: "advertising_detected", // advertising_detected | no_recent_signals | unknown
        recency: "recent",              // recent | not_recent | unknown
        channels: ["search", "video"],
        confidence: "medium",
        explanation:
          "Advertising signals detected within the last few months across monitored digital channels."
      };

      console.log("Advertising status resolved:", entityId, statusResult);

      return res.json({
        jsonrpc: "2.0",
        id,
        result: {
          content: [
            {
              type: "json",
              data: statusResult
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
