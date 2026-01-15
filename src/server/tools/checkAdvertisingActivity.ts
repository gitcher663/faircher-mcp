import { z } from "zod";
import { createClient } from "@modelcontextprotocol/sdk/client/index.js";

/**
 * Create an MCP client that talks to SerpApi's hosted MCP server.
 * The API key is part of the URL per SerpApi spec.
 */
const serpApiClient = createClient({
  type: "http",
  url: `https://mcp.serpapi.com/${process.env.SERPAPI_API_KEY}/mcp`,
});

export const checkAdvertisingActivity = [
  "check_advertising_activity",
  {
    title: "Check advertising activity",
    description:
      "Checks Google Ads Transparency Center for advertising activity related to a domain",
    inputSchema: {
      domain: z.string().describe("Company domain, e.g. apple.com"),
      region: z.string().optional(),
      creative_format: z.enum(["text", "image", "video"]).optional(),
    },
    _meta: {
      "openai/outputTemplate": "ui://widget/faircher.html",
      "openai/annotations": {
        readOnlyHint: true,
        openWorldHint: false,
        destructiveHint: false,
      },
    },
  },

  async ({ domain, region, creative_format }) => {
    /**
     * Call SerpApi MCP unified search tool.
     * NOTE: Tool name MUST match what SerpApi MCP exposes.
     * If this fails, inspect with MCP Inspector and adjust.
     */
    const serpResult = await serpApiClient.callTool("search", {
      engine: "google_ads_transparency_center",
      text: domain,
      ...(region ? { region } : {}),
      ...(creative_format ? { creative_format } : {}),
    });

    const adCreatives = serpResult?.ad_creatives ?? [];

    return {
      structuredContent: {
        domain,
        ads_found: adCreatives.length,
      },
      content: [
        {
          type: "text",
          text: `Advertising activity found for ${domain}`,
        },
      ],
      _meta: {
        ad_creatives: adCreatives,
        pagination: serpResult?.serpapi_pagination ?? null,
      },
    };
  },
];
