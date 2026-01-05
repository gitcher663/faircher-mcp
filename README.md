# faircher-mcp

FairCher MCP server for read-only advertiser discovery and research in ChatGPT.

The server enforces a confirmation-gated workflow backed by Supabase:

- `faircher.entity_lookup` resolves business input through a Supabase Edge Function (with a domain fast-path) and persists the unconfirmed entity record.
- The returned entity summary must be presented to the user for explicit confirmation via `faircher.confirm_entity`.
- Advertising classification (`faircher.resolve_advertising_status`) and activity retrieval (`faircher.get_ad_activity`) are blocked until the entity is confirmed in Supabase.

## Node.js MCP server over HTTP

This repository hosts a production-ready Node.js MCP server that communicates over HTTP rather than stdio. The server is compatible with ChatGPT MCP URL registration and exposes its JSON-RPC endpoint at `POST /mcp`.

- Binds to `process.env.PORT` on `0.0.0.0` for Railway deployments.
- Implements the MCP handshake (`initialize`, `tools/list`, and `tools/call`).
- Provides an example tool: `faircher.get_ad_activity`.

### Setup

```bash
npm install
```

### Run in development

```bash
npm run dev
```

### Build and run

```bash
npm run build
npm start
```

### Verify with curl

Use the following command to confirm the MCP server responds to initialization:

```bash
curl -X POST http://localhost:$PORT/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"initialize","params":{},"id":1}'
```
