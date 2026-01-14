import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

// If Node < 18, uncomment:
// import fetch from "node-fetch";

const SERPAPI_ENDPOINT = "https://serpapi.com/search.json";
const SERPAPI_KEY = process.env.SERPAPI_API_KEY;

if (!SERPAPI_KEY) {
  throw new Error("SERPAPI_API_KEY is not set");
}

const server = new McpServer({
  name: "faircher-mcp",
  version: "1.0.0",
});

/* -----------------------------
   Helper: timeframe handling
-------------------------------- */
function timeframeToMs(tf: "recent" | "30d" | "90d") {
  switch (tf) {
    case "30d":
      return 30 * 24 * 60 * 60 * 1000;
    case "90d":
      return 90 * 24 * 60 * 60 * 1000;
    default:
      return 14 * 24 * 60 * 60 * 1000; // recent
  }
}

/* -----------------------------
   Tool registration
-------------------------------- */
server.registerTool(
  "advertising.activity_lookup",
  {
    title: "Check Advertising Activity",
    description:
      "Use this when the user wants to know whether a company or domain has shown recent advertising activity based on live Google Ads Transparency Center data.",
    inputSchema: z.object({
      domain: z
        .string()
        .describe("Root domain to check (e.g. 'midas.com')."),
      timeframe: z
        .enum(["recent", "30d", "90d"])
        .optional()
        .default("recent")
        .describe("Lookback window for ad activity."),
    }),
    annotations: {
      readOnlyHint: true,
      openWorldHint: true,
      destructiveHint: false,
    },
  },
  async ({ domain, timeframe }) => {
    /* -----------------------------
       1. Call SerpApi
    -------------------------------- */
    const url = new URL(SERPAPI_ENDPOINT);
    url.searchParams.set("engine", "google_ads_transparency_center");
    url.searchParams.set("text", domain);
    url.searchParams.set("api_key", SERPAPI_KEY!);

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`SerpApi request failed: ${response.status}`);
    }

    const json = await response.json();
    const creatives = json.ad_creatives ?? [];

    /* -----------------------------
       2. Recency filtering
    -------------------------------- */
    const now = Date.now();
    const windowMs = timeframeToMs(timeframe);
    const recent = creatives.filter((c: any) => {
      if (!c.last_shown) return false;
      return now - c.last_shown * 1000 <= windowMs;
    });

    /* -----------------------------
       3. No recent activity
    -------------------------------- */
    if (recent.length === 0) {
      return {
        structuredContent: {
          active: false,
          confidence: "low",
          recent_creatives: 0,
          formats: [],
          advertisers: [],
          source: "google_ads_transparency_center",
        },
        content: [
          {
            type: "text",
            text: `No recent Google Ads activity detected for ${domain}.`,
          },
        ],
      };
    }

    /* -----------------------------
       4. Aggregate signals
    -------------------------------- */
    const latestSeen = Math.max(...recent.map((c: any) => c.last_shown));
    const formats = [
      ...new Set(recent.map((c: any) => c.format).filter(Boolean)),
    ];
    const advertisers = [
      ...new Set(recent.map((c: any) => c.advertiser).filter(Boolean)),
    ];

    let confidence: "low" | "medium" | "high" = "medium";
    if (recent.length >= 10 && formats.length >= 2) confidence = "high";
    if (recent.length < 3) confidence = "low";

    /* -----------------------------
       5. Return payload
    -------------------------------- */
    return {
      structuredContent: {
        active: true,
        confidence,
        latest_seen: new Date(latestSeen * 1000).toISOString(),
        recent_creatives: recent.length,
        formats,
        advertisers,
        source: "google_ads_transparency_center",
      },
      content: [
        {
          type: "text",
          text: `Advertising activity detected for ${domain}.`,
        },
      ],
    };
  }
);

/* -----------------------------
   Start server
-------------------------------- */
server.start();
