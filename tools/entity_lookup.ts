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
    const source =
      (args.source as "user" | "crm" | "domain" | "url" | "unknown" | undefined) ??
      "unknown";

    if (!input) {
      throw new Error("Missing required input parameter: input");
    }

    const entity = await resolveEntity({ input, source });

    if (!entity.entityId || entity.resolutionStatus === "unresolved") {
      throw new Error(
        "Entity resolution was unable to find a confident match. Request a clearer business name or URL."
      );
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
