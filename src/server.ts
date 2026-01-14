import express from "express";
import crypto from "crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

/* -------------------------------------------------------
   App + MCP Server Initialization
------------------------------------------------------- */

const app = express();
app.use(express.json());

const server = new McpServer({
  name: "faircher",
  version: "1.0.0",
});

/* -------------------------------------------------------
   TOOL: advertising.activity_lookup
------------------------------------------------------- */

server.tool(
  "advertising.activity_lookup",
  {
    description: `
Use this tool to verify whether a company is actively running online ads.

Invoke this tool when:
- You need to confirm if a company is advertising
- You are evaluating go-to-market activity, demand generation, or paid acquisition
- You are assessing whether a brand is currently spending on ads

Do NOT use this tool:
- To estimate ad spend amounts
- To generate marketing strategies
- To predict future advertising behavior

This tool returns observed advertising activity only, based on public ad transparency signals.
`.trim(),

    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        domain: {
          type: "string",
          description:
            "Primary company website domain to check for advertising activity (example: midas.com)",
        },
        advertiser_id: {
          type: "string",
          description:
            "Google Ads Transparency advertiser ID, if known. Prefer domain when unsure.",
        },
        region: {
          type: "string",
          description: "Region code (default: 2840 = United States)",
          default: "2840",
        },
        limit: {
          type: "number",
          description: "Maximum number of ads to return",
          default: 100,
        },
      },
      oneOf: [{ required: ["domain"] }, { required: ["advertiser_id"] }],
    },

    annotations: {
      title: "Advertising Activity Verification",
      readOnlyHint: true,
      idempotentHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
  },

  async (args: {
    domain?: string;
    advertiser_id?: string;
    region?: string;
    limit?: number;
  }) => {
    const requestId = crypto.randomUUID();
    const start = Date.now();

    try {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 5000);

      const response = await fetch(
        "https://emmuyndfyszbfivqhvbl.supabase.co/functions/v1/get_ad_activity",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            domain: args.domain,
            advertiser_id: args.advertiser_id,
            region: args.region ?? "2840",
            limit: args.limit ?? 100,
          }),
          signal: controller.signal,
        }
      );

      const durationMs = Date.now() - start;

      if (!response.ok) {
        console.error(
          `[${requestId}] upstream error ${response.status} (${durationMs}ms)`
        );
        throw new Error(`Upstream error (${response.status})`);
      }

      const data = await response.json();

      console.log(
        `[${requestId}] advertising.activity_lookup ok (${durationMs}ms)`
      );

      return {
        content: [
          {
            type: "text",
            text: data.ad_activity_found
              ? "Advertising activity detected based on public ad transparency data."
              : "No advertising activity detected based on available public ad transparency data.",
          },
        ],
        structuredContent: {
          query: data.query,
          ad_activity_found: data.ad_activity_found,
          total_ads_found: data.total_ads_found,
          advertisers: Array.isArray(data.ads)
            ? [...new Set(data.ads.map((a: any) => a.advertiser))]
            : [],
          formats: Array.isArray(data.ads)
            ? [...new Set(data.ads.map((a: any) => a.format))]
            : [],
          first_seen:
            Array.isArray(data.ads) && data.ads.length > 0
              ? Math.min(...data.ads.map((a: any) => a.first_shown))
              : null,
          last_seen:
            Array.isArray(data.ads) && data.ads.length > 0
              ? Math.max(...data.ads.map((a: any) => a.last_shown))
              : null,
        },
      };
    } catch (error: any) {
      const durationMs = Date.now() - start;

      console.error(
        `[${requestId}] advertising.activity_lookup failed (${durationMs}ms):`,
        error?.message
      );

      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Unable to retrieve advertising activity (request_id=${requestId})`,
          },
        ],
        structuredContent: {
          error_type: "UPSTREAM_FAILURE",
          retryable: true,
          request_id: requestId,
        },
      };
    }
  }
);

/* -------------------------------------------------------
   Health Check
------------------------------------------------------- */

app.get("/health", async (_req, res) => {
  try {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 2000);

    await fetch(
      "https://emmuyndfyszbfivqhvbl.supabase.co/functions/v1/get_ad_activity",
      {
        method: "OPTIONS",
        signal: controller.signal,
      }
    );

    res.status(200).json({
      status: "ok",
      upstream: "reachable",
    });
  } catch {
    res.status(200).json({
      status: "ok",
      upstream: "unreachable",
    });
  }
});

/* -------------------------------------------------------
   SSE Transport
------------------------------------------------------- */

app.get("/mcp", async (_req, res) => {
  const transport = new SSEServerTransport("/mcp", res);
  await server.connect(transport);
});

/* -------------------------------------------------------
   Start Server
------------------------------------------------------- */

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  console.log(`FairCher MCP server running at http://localhost:${PORT}/m
