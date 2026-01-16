import { activityScanInputSchema } from "./schema.js";
import { defaultChannelOrder } from "../../config/channels.js";
import type { Channel, ChannelScope } from "../../types/channels.js";

const channelSet = new Set<Channel>(defaultChannelOrder);

function resolveChannels(channel: ChannelScope | undefined): Channel[] {
  if (!channel || channel === "any") {
    return [...defaultChannelOrder];
  }

  if (!channelSet.has(channel)) {
    return [...defaultChannelOrder];
  }

  return [channel];
}

export const activityScanTool = {
  name: "advertising_activity_scan",

  definition: {
    title: "Advertising activity scan",
    description:
      "Determines whether a business, brand, or domain is actively advertising across major paid media channels.",
    inputSchema: activityScanInputSchema,
  },

  async handler(args: {
    entity: string;
    channel?: ChannelScope;
    region?: string;
  }) {
    const channelsChecked = resolveChannels(args.channel);

    const summary = args.channel && args.channel !== "any"
      ? `Planned scan for ${args.entity} on ${args.channel}.`
      : `Planned scan order for ${args.entity}: ${channelsChecked.join(", ")}.`;

    return {
      content: [
        {
          type: "text" as const,
          text: `${summary} Downstream detectors must be invoked to confirm activity.`,
        },
      ],
      _meta: {
        advertising_detected: false,
        channels_checked: channelsChecked,
        channels_with_activity: [],
        summary,
      },
    };
  },
};
