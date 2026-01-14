import express from "express";
import { randomUUID } from "crypto";

const app = express();
app.use(express.json());

const PORT = Number(process.env.PORT) || 8080;

/**
 * Health check (must not 404)
 */
app.get("/", (_req, res) => {
  res.json({ service: "faircher-mcp", status: "ok" });
});

/**
 * MCP discovery document
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
 * STREAMABLE HTTP ENDPOINT (REQUIRED)
 * ChatGPT opens this first
 */
app.get("/sse", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const sessionId = randomUUID();

  // Initial MCP-ready notification
  res.write(
    `event: message\ndata: ${JSON.stringify({
      jsonrpc: "2.0",
      method: "notifications/ready",
      params: { sessionId },
    })}\n\n`
  );

  // Keepalive ping every 15s
  const interval = setInterval(() => {
    res.write(`event: ping\ndata: {}\n\n`);
  }, 15000);

  req.on("close", () => {
    clearInterval(interval);
    res.end();
  });
});

/**
 * JSON-RPC endpoint
 * ChatGPT POSTs here after SSE is established
 */
app.post("/mcp", (req, res) => {
  const { id, method, params } = req.body ?? {};

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
                domain: {
                  type: "string",
                  description: "Company website domain (example.com)",
                },
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
    if (params?.name === "advertising.activity_lookup") {
      return res.json({
        jsonrpc: "2.0",
        id,
        result: {
          content: [
            {
              type: "text",
              text:
                "Advertising activity signals detected (stub response).",
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
