import { Server } from "@modelcontextprotocol/sdk/server";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio";

const server = new Server({
  name: "Faircher MCP",
  version: "0.1.0",
});

server.tool(
  {
    name: "faircher.get_ad_activity",
    description:
      "Fetches mock advertising platform activity for Faircher research use.",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  async () => ({
    content: [
      {
        type: "text",
        text: JSON.stringify(
          [
            {
              platform: "Google Ads",
              verticals: ["Retail", "Finance"],
              status: "active",
            },
            {
              platform: "Meta Ads",
              verticals: ["E-commerce", "Travel"],
              status: "paused",
            },
            {
              platform: "LinkedIn Ads",
              verticals: ["B2B", "SaaS"],
              status: "active",
            },
          ],
          null,
          2
        ),
      },
    ],
  })
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

void main();
