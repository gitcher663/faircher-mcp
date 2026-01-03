import { Server } from "@modelcontextprotocol/sdk/server";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio";

type Playbook = {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  recommendedActions: string[];
};

const playbooks: Playbook[] = [
  {
    id: "creative-audit",
    title: "Rapid creative audit",
    summary:
      "Checklist for reviewing ads before launch, focusing on claims, disclosures, and brand safety.",
    tags: ["creative", "compliance", "brand"],
    recommendedActions: [
      "Verify all claims have supporting evidence and links.",
      "Check that landing pages mirror ad promises.",
      "Confirm required disclosures for pricing, subscriptions, and offers.",
    ],
  },
  {
    id: "budget-shift",
    title: "Budget reallocation triage",
    summary:
      "Guidance for shifting spend between channels when performance changes.",
    tags: ["budget", "media", "performance"],
    recommendedActions: [
      "Review channel-level CAC and recent trend deltas.",
      "Move discretionary spend to channels with stable ROAS.",
      "Flag experiments that can be paused without harming learnings.",
    ],
  },
  {
    id: "crisis-response",
    title: "Crisis response checklist",
    summary:
      "Steps to pause or adjust campaigns when sensitive events occur.",
    tags: ["brand", "safety", "incident"],
    recommendedActions: [
      "Pause campaigns with sensitive keywords or creative themes.",
      "Update negative keyword lists and placement exclusions.",
      "Prepare holding statements for customer support scripts.",
    ],
  },
];

function searchPlaybooks(query: string, limit: number): Playbook[] {
  const normalized = query.toLowerCase();
  return playbooks
    .filter((playbook) => {
      const haystack = `${playbook.title} ${playbook.summary} ${playbook.tags.join(" ")}`.toLowerCase();
      return haystack.includes(normalized);
    })
    .slice(0, limit);
}

const server = new Server({
  name: "Faircher Codex",
  version: "0.1.0",
});

server.tool(
  {
    name: "codex.search_playbooks",
    description: "Search curated operational playbooks for marketing and comms teams.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Keywords to match against titles, summaries, and tags.",
        },
        limit: {
          type: "integer",
          description: "Maximum number of entries to return (default 3).",
          minimum: 1,
          maximum: 10,
        },
      },
      required: ["query"],
    },
  },
  async ({ query, limit = 3 }) => {
    const matches = searchPlaybooks(query, limit);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(matches, null, 2),
        },
      ],
    };
  }
);

server.tool(
  {
    name: "codex.get_playbook",
    description: "Fetch a specific playbook by its ID.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "Identifier of the playbook (e.g., creative-audit).",
        },
      },
      required: ["id"],
    },
  },
  async ({ id }) => {
    const playbook = playbooks.find((entry) => entry.id === id);
    if (!playbook) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                error: `Playbook '${id}' was not found`,
                availablePlaybooks: playbooks.map((entry) => entry.id),
              },
              null,
              2
            ),
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(playbook, null, 2),
        },
      ],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

void main();
