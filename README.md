# faircher-mcp

FairCher MCP server for read-only advertiser discovery and research in ChatGPT.

## Node.js MCP server

This repository now includes a minimal Node.js TypeScript MCP server built with `@modelcontextprotocol/sdk`. It exposes one tool:

- `faircher.get_ad_activity`: Returns mock advertising platforms and their current activity state.

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

The server communicates over stdio per the MCP specification.
