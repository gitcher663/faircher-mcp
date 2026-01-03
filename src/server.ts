import express from "express";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8000;

/**
 * Minimal MCP JSON-RPC handler
 */
app.post("/mcp", (req, res) => {
  const { id, method, params } = req.body;

  if (!method) {
    return res.status(400).json({
      jsonrpc: "2.0",
      id: id ?? null,
      error: {
        code: -32600,
        message: "Invalid Request"
      }
    });
  }

  // MCP initialize
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

  // List tools
  if (method === "tools/list") {
    return res.json({
      jsonrpc: "2.0",
      id,
      result: {
        tools: [
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

  // Call tool
  if (method === "tools/call") {
    const { name, arguments: args } = params ?? {};

    if (name === "faircher.get_ad_activity") {
      return res.json({
        jsonrpc: "2.0",
        id,
        result: {
          content: [
            {
              type: "json",
              data: {
                advertiserId: args?.advertiserId ?? null,
                impressions: 12345,
                clicks: 678
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
        message: "Tool not found"
      }
    });
  }

  // Unknown method
  return res.json({
    jsonrpc: "2.0",
    id,
    error: {
      code: -32601,
      message: `Method not found: ${method}`
    }
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Faircher MCP server listening on port ${PORT}`);
});
