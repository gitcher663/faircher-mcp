import express from "express";
import { randomUUID } from "crypto";

const app = express();
app.use(express.json());

const PORT = Number(process.env.PORT) || 8080;

/**
 * Health check (Railway / uptime)
 */
app.get("/", (_req, res) => {
  res.json({ service: "faircher-mcp", status: "ok" });
});

/**
 * MCP discovery
 */
app.get("/.well-known/mcp.json", (_req, res) => {
  res.json({
    protocolVersion: "2024-11-05",
    serverInfo: {
      name: "faircher-mcp",
      version: "1.0.0",
    },
    transports: [
      {
        type: "http",
        endpoint: "/sse",
      },
    ],
  });
});

/**
 * STREAMABLE HTTP ENTRYPOINT (REQUIRED FOR CHATGPT)
 */
app.get("/sse", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const sessionId = randomUUID();

  // Initial hello event
  res.write(
    `event: message\ndata: ${JSON.stringify({
      jsonrpc: "2.0",
      method: "notifications/ready",
      params: { sessionId },
    })}\n\n`
  );

  req.on("close", () => {
    res.end();
  });
});

/**
 * MCP JSON-RPC over HTTP POST
 * ChatGPT will POST here after SSE is established
 */
app.post("/mcp", (req, res) => {
  const { id, method } = req.body ?? {};

  if (method === "initialize") {
    return res.json({
      jsonrpc: "2.0",
      id,
      result: {
        protocolVersion: "2024-11-05",
        serverInfo: {
          name: "faircher-mcp",
          version: "1.0.0",
        },
        capabilities: {
          tools: {
            listChanged: false,
          },
        },
      },
    });
  }

  if (method === "tools/list") {
    return res.json({
      jsonrpc: "2.0",
      id,
      result: {
        tools: [
          {
            name: "advertising.activity_lookup",
            title: "Advertising Activity Lookup",
            description:
              "Use this when you want to assess whether a company or domain shows recent advertising or media-buying activity based on observable signals.",
            inputSchema: {
              type: "object",
              properties: {
                domain: { type: "string" },
                timeframe: {
                  type: "string",
                  enum: ["recent", "30d", "90d"],
                  default: "recent",
                },
              },
              required: ["domain"],
            },
            annotations: {
              readOnlyHint: true,
              openWorldHint: true,
            },
          },
        ],
      },
    });
  }

  if (method === "tools/call") {
    if (req.body.params?.name === "advertising.activity_lookup") {
      return res.json({
        jsonrpc: "2.0",
        id,
        result: {
          content: [
            {
              type: "text",
              text: "Advertising activity signals detected (stub response).",
            },
          ],
        },
      });
    }
  }

  return res.json({
    jsonrpc: "2.0",
    id,
    error: {
      code: -32601,
      message: `Method not found: ${method}`,
    },
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Faircher MCP listening on ${PORT}`);
});
