// src/tools/advertisingActivity.ts

import { getWebAdvertisingSignals } from "../adapters/webSignals";

export const advertisingActivityTool = {
  name: "advertising.activity_lookup",
  title: "Advertising Activity Lookup",
  description:
    "Use this when you want to assess whether a company or domain shows recent advertising or media-buying activity based on observable signals.",
  inputSchema: {
    type: "object",
    additionalProperties: false,
    properties: {
      domain: {
        type: "string",
        description: "Company website domain (e.g. example.com)",
      },
      timeframe: {
        type: "string",
        enum: ["recent", "30d", "90d"],
        description:
          "Time window over which advertising activity should be evaluated",
        default: "recent",
      },
    },
    required: ["domain"],
  },
  annotations: {
    title: "Advertising Activity Lookup",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },

  async run(args: { domain: string; timeframe?: string }) {
    try {
      const result = await getWebAdvertisingSignals({
        domain: args.domain,
        timeframe: args.timeframe ?? "recent",
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Unable to retrieve advertising activity: ${error.message}`,
          },
        ],
      };
    }
  },
};
