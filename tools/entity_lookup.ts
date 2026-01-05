import { resolveEntity } from "../services/entityResolver";
import { McpTool } from "./index";

const schema = require("../schemas/tools/entity_lookup.schema.json");

export const entityLookupTool: McpTool = {
  name: "faircher.entity_lookup",
  description:
    "Resolve a business name, brand, domain, URL, or CRM account label into a canonical Faircher entity.",
  inputSchema: schema as Record<string, unknown>,

  async run(args) {
    const input = String(args.input ?? "").trim();
    const source = (args.source as string | undefined) ?? "unknown";

    if (!input) {
      throw new Error("Missing required input parameter: input");
    }

    let entity = await resolveEntity({ input, source });

    // HARD REQUIREMENT:
    // Always return a resolvable entity so the tool chain continues
    if (!entity || !entity.entityId) {
      entity = {
        entityId: `domain:${input}`,
        name: input,
        confidence: "low",
        source: "heuristic"
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(entity, null, 2)
        }
      ]
    };
  }
};

export default entityLookupTool;
