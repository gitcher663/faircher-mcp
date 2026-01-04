import express, { Request, Response } from "express";

const app = express();
app.use(express.json());

const PORT: number = Number(process.env.PORT) || 8000;

/**
 * MCP JSON-RPC endpoint
 */
app.post("/mcp", (req: Request, res: Response) => {
  const { id, method, params } = req.body ?? {};

  if (!method || typeof method !== "string") {
    return res.status(400).json({
      jsonrpc: "2.0",
      id: id ?? null,
      error: { code: -32600, message: "Invalid Request" }
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
          version: "1.0.0"
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
          /**
           * ENTITY LOOKUP (Normalization / Required First Step)
           */
          {
            name: "faircher.entity_lookup",
            title: "Faircher Entity Lookup",
            description:
              "Resolve a business name, brand, domain, URL, or CRM account label into a canonical Faircher entity. This tool is the required first step for all Faircher analysis.",
            description_model:
              "Normalize any user-provided business reference into a canonical Faircher entity. Always call this tool before invoking any other Faircher tool. Do not infer or invent entity IDs.",
            is_read_only: true,
            params: {
              type: "object",
              additionalProperties: false,
              properties: {
                input: {
                  type: "string",
                  description:
                    "Business name, brand name, domain, URL, or CRM-provided account label."
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

          /**
           * ADVERTISING ACTIVITY (Primary Data Tool)
           */
          {
            name: "faircher.get_ad_activity",
            title: "Faircher Advertising Activity",
            description:
              "Retrieve structured advertising activity metrics for a resolved Faircher entity, including presence, estimated intensity, and high-level quantitative indicators across supported media channels.",
            description_model:
              "Retrieve structured, quantitative advertising activity data for a resolved Faircher entity using its canonical entity ID. Use this tool when precise advertising-level data is required. Coverage and historical depth may vary by channel and metric.",
            is_read_only: true,
            params: {
              type: "object",
              additionalProperties: false,
              properties: {
                entityId: {
                  type: "string",
                  description:
                    "Canonical Faircher entity ID obtained from faircher.entity_lookup."
                },
                metrics: {
                  type: "array",
                  description:
                    "Optional list of advertising metric keys to retrieve. If omitted, a default core metric set is returned.",
                  items: {
                    type: "string",
                    enum: [
                      "spend_estimate",
                      "impression_volume",
                      "creative_count",
                      "active_channels",
                      "geo_coverage"
                    ]
                  }
                },
                period: {
                  type: "string",
                  description:
                    "Time period for which advertising activity should be evaluated.",
                  enum: ["recent", "last_30_days", "last_90_days"],
                  default: "recent"
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

    /**
     * Tool: faircher.entity_lookup
     */
    if (toolName === "faircher.entity_lookup") {
      const result = {
        resolutionStatus: "resolved", // resolved | ambiguous | not_found
        entityId: "fc_ent_demo_001",
        canonicalName: args.input,
        entityType: "advertiser",
        domains: ["example.com"],
        primaryDomain: "example.com",
        confidence: "medium", // high | medium | low
        matchedFrom: "name",
        candidates: [],
        message: null
      };

      return res.json({
        jsonrpc: "2.0",
        id,
        result: {
          content: [
            {
              type: "json",
              data: result
            }
          ]
        }
      });
    }

    /**
     * Tool: faircher.get_ad_activity
     */
    if (toolName === "faircher.get_ad_activity") {
      const result = {
        entityId: args.entityId,
        period: args.period ?? "recent",
        metrics: {
          spend_estimate: {
            valueUsd: 125000,
            confidence: "medium"
          },
          impression_volume: {
            value: 4200000,
            confidence: "medium"
          },
          creative_count: {
            value: 87,
            confidence: "high"
          },
          active_channels: ["search", "social", "video"],
          geo_coverage: ["US"]
        },
        coverageNotes:
          "Metric availability and precision vary by channel and entity.",
        evidenceAvailable: true,
        confidence: "medium"
      };

      return res.json({
        jsonrpc: "2.0",
        id,
        result: {
          content: [
            {
              type: "json",
              data: result
            }
          ]
        }
      });
    }

    return res.json({
      jsonrpc: "2.0",
      id,
      error: { code: -32601, message: `Tool not found: ${toolName}` }
    });
  }

  return res.json({
    jsonrpc: "2.0",
    id,
    error: { code: -32601, message: `Method not found: ${method}` }
  });
});

/**
 * Health endpoint
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
