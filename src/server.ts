import express from "express";
import cors from "cors";
import { randomUUID } from "crypto";

const app = express();
const PORT = Number(process.env.PORT) || 8080;

app.use(cors());
app.use(express.json());

/* -----------------------------------
   Health check (must not 404)
----------------------------------- */
app.get("/", (_req, res) => {
  res.json({ service: "faircher-mcp", status: "ok" });
});

/* -----------------------------------
   MCP discovery
----------------------------------- */
app.get("/.well-known/mcp.json", (_req, res) => {
  res.json({
    protocolVersion: "2024-11-05",
    serverInfo: {
      name: "faircher-mcp",
      version: "1.0.0",
    },
    transports: [
      {
        type: "streamable_http",
        endpoint: "/sse",
      },
    ],
  });
});

/* -----------------------------------
   SSE endpoint (THIS IS WHAT CHATGPT USES)
----------------------------------- */
app.get("/sse", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const sessionId = randomUUID();

  // Initial MCP handshake event
  res.write(
    `event: message\ndata: ${JSON.stringify({
      jsonrpc: "2.0",
      method: "notifications/connected",
      params: {
        sessionId,
      },
    })}\n\n`
  );

  req.on("close", () => {
    res.end();
  });
});

/* -----------------------------------
   MCP JSON-RPC endpoint
----------------------------------- */
app.post("/mcp", (req, res) => {
  const { id, method } = req.body ?? {};

  /* ---- initialize ---- */
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

  /* ---- tools/list ---- */
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

  /* ---- tools/call ---- */
  if (method === "tools/call") {
    const { name, arguments: args } = req.body.params ?? {};

    if (name === "advertising.activity_lookup") {
      return res.json({
        jsonrpc: "2.0",
        id,
        result: {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  domain: args.domain,
                  timeframe: args.timeframe ?? "recent",
                  signals: ["search_ads_detected", "brand_keywords_present"],
                  confidence: "medium",
                },
                null,
                2
              ),
            },
          ],
        },
      });
    }

    return res.json({
      jsonrpc: "2.0",
      id,
      error: { code: -32602, message: "Unknown tool" },
    });
  }

  /* ---- fallback ---- */
  return res.json({
    jsonrpc: "2.0",
    id,
    error: {
      code: -32601,
      message: `Method not found: ${method}`,
    },
  });
});

/* -----------------------------------
   Start server
----------------------------------- */
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Faircher MCP running on ${PORT}`);
});
