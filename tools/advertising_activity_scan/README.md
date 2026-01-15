# Ad Activity Scan Tool

## Purpose

The Ad Activity Scan tool determines whether a business, brand, or domain is actively advertising, and identifies the channels where advertising activity is detected.

This tool is designed for:
- Ad sales qualification and prospecting
- Agency lead research
- Competitive intelligence
- Market and brand analysis

It answers high-level questions like:
> “Is this company advertising right now?”

without assuming a single channel or medium.

---

## Core Question This Tool Answers

> **Is the following business, brand, or domain actively advertising — and if so, where?**

This includes **digital and non-digital** advertising signals.

---

## What This Tool IS

- A **media-agnostic advertising detection orchestrator**
- A **first-pass qualifier**, not a deep creative analysis engine
- A **decision-layer tool** that determines *which* ad channels show evidence of activity
- A **cheap → expensive scan sequencer** that stops once activity is confirmed

---

## What This Tool Is NOT

- Not a single-channel checker
- Not a guaranteed negative detector (absence of evidence ≠ no advertising)
- Not an ad spend estimator
- Not a creative-level scraper
- Not an API proxy for any one vendor

---

## Inputs

### Required
- `entity`: string  
  - Business name, brand name, or domain  
  - Examples:
    - `nike`
    - `nike.com`
    - `Joe’s Plumbing Phoenix`

### Optional
- `channel_hint`: enum  
  - Used **only** when the user explicitly asks about a channel  
  - Values:
    - `search`
    - `display`
    - `video`
    - `social`
    - `meta`
    - `linkedin`
    - `tiktok`
    - `youtube`
    - `tv`
    - `ctv`

---

## High-Level Scan Logic

### Default (Channel-Agnostic) Flow

When the user asks a **general advertising question**, the tool:

1. Starts with **highest-probability, lowest-cost channels**
   - Search ads
2. If no activity is detected:
   - Checks major social platforms
3. If still no activity:
   - Checks video platforms
4. If still no activity:
   - Flags possibility of offline / broadcast advertising
5. Stops immediately once **any confirmed activity** is found

The tool does **not** exhaustively scan all channels if early confirmation exists.

---

## Channel-Specific Flow

When the user explicitly names a channel, the tool:

- Restricts execution to that channel only
- Does **not** fan out to other media
- Returns a scoped yes/no + confidence explanation

Example:
> “Is Brand X advertising on TikTok?”

→ Only TikTok detection logic is executed.

---

## Supported Question Patterns (Positive Triggers)

The tool **SHOULD be called** when the user asks:

### General Advertising Questions
- “Is **X** advertising?”
- “Is **X** running ads?”
- “Is **X** buying ads right now?”
- “Does **X** do paid marketing?”
- “Is **X** actively advertising?”

### Channel-Specific Questions
- “Is **X** advertising on Google?”
- “Is **X** running search ads?”
- “Is **X** advertising on Meta?”
- “Is **X** on TikTok ads?”
- “Is **X** advertising on YouTube?”
- “Is **X** running LinkedIn ads?”

### Discovery Questions
- “Where is **X** advertising?”
- “What channels does **X** advertise on?”
- “Which platforms is **X** buying ads on?”

---

## Negative Triggers (When NOT to Call This Tool)

The tool **SHOULD NOT be called** when the user asks:

- “How much does **X** spend on ads?”
- “What do **X**’s ads look like?”
- “Show me **X**’s ads”
- “Create ads like **X**”
- “Why is **X** advertising?”
- “What is **X**’s marketing strategy?”

These require **downstream tools**.

---

## Output Contract

### Required Fields

- `is_advertising`: boolean
- `channels_detected`: array of channels
- `confidence`: enum (`high`, `medium`, `low`)
- `evidence_summary`: short natural-language explanation

### Example Output

```json
{
  "is_advertising": true,
  "channels_detected": ["search", "social"],
  "confidence": "high",
  "evidence_summary": "Active paid search ads detected along with recent social advertising activity."
}
