# FairCher MCP Server

FairCher is a Model Context Protocol (MCP) server that exposes a **read-only advertising activity lookup tool** for use in ChatGPT.

The server allows the ChatGPT model to determine whether a company domain or advertiser ID shows **observable advertising activity**, based on public ad transparency signals retrieved via a Supabase Edge Function.

---

## What This Server Does

- Exposes a **model-controlled MCP tool**
- Performs **read-only advertiser activity discovery**
- Supports lookup by:
  - Company domain, or
  - Google Ads Transparency advertiser ID
- Returns both:
  - Human-readable summaries
  - Structured data for model reasoning

The server does **not**:
- Orchestrate chat or prompts
- Implement agent logic
- Maintain conversational state
- Require confirmation steps
- Expose implementation details to the model

---

## Exposed Tool

### `advertising.activity_lookup`

Determines whether a company or advertiser shows observable advertising activity.

**Input (JSON Schema)**

- `domain` (string, optional)  
  Company website domain (e.g. `midas.com`)
- `advertiser_id` (string, optional)  
  Google Ads Transparency advertiser ID (e.g. `AR04579314025283715073`)
- `region` (string, optional, default: `2840`)  
  Region code (2840 = United States)
- `limit` (number, optional, default: `100`)  
  Maximum number of ads to return

Either `domain` **or** `advertiser_id` is required.

**Behavior**
- Read-only
- Idempotent
- Model-controlled
- Safe for autonomous invocation

---

## Transport & Protocol

- MCP over **Server-Sent Events (SSE)**
- Endpoint: `GET /mcp`
- Content-Type: `text/event-stream`
- Compatible with ChatGPT MCP URL registration

This server does **not** accept raw JSON-RPC POST requests.

---

## Setup

### Install dependencies

```bash
npm install
