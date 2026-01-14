/**
 * MCP Tool: advertising.activity_lookup
 *
 * Read-only tool that evaluates whether a company or advertiser
 * shows observable advertising activity using public ad
 * transparency data (via Supabase Edge Function → SerpAPI).
 */
export const advertisingActivityTool = {
  name: "advertising.activity_lookup",
  title: "Advertising Activity Lookup",
  description:
    "Use this to determine whether a company domain or advertiser ID shows observable advertising activity based on public ad transparency signals.",

  inputSchema: {
    type: "object",
    additionalProperties: false,

    properties: {
      domain: {
        type: "string",
        description: "Company website domain (example: midas.com)",
      },
      advertiser_id: {
        type: "string",
        description:
          "Google Ads Transparency advertiser ID (example: AR04579314025283715073)",
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

    // Require either domain OR advertiser_id
    oneOf: [{ required: ["domain"] }, { required: ["advertiser_id"] }],
  },

  annotations: {
    title: "Advertising Activity Lookup",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },

  async run(args: {
    domain?: string;
    advertiser_id?: string;
    region?: string;
    limit?: number;
  }) {
    try {
      const response = await fetch(
        "https://emmuyndfyszbfivqhvbl.supabase.co/functions/v1/get_ad_activity",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Only include Authorization if your Edge Function enforces it
            // "Authorization": `Bearer ${process.env.SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            domain: args.domain,
            advertiser_id: args.advertiser_id,
            region: args.region ?? "2840",
            limit: args.limit ?? 100,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Supabase Edge Function error (${response.status})`
        );
      }

      const data = await response.json();

      return {
        content: [
          {
            type: "text",
            text: data.ad_activity_found
              ? "Advertising activity detected."
              : "No advertising activity detected.",
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
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Unable to retrieve advertising activity: ${
              error?.message ?? "Unknown error"
            }`,
          },
        ],
      };
    }
  },
};
