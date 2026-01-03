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

## Codex MCP server

The Codex server surfaces a small set of operational playbooks for marketing and comms teams.

### Run in development

```bash
npm run codex:dev
```

### Build and run

```bash
npm run build
npm run codex:start
```

Tools exposed:

- `codex.search_playbooks`: Search curated playbooks by keyword.
- `codex.get_playbook`: Retrieve a specific playbook by ID.
