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

---

## What This Tool IS

- A media-agnostic advertising detection orchestrator
- A first-pass qualifier, not a deep creative analysis engine
- A decision-layer tool that determines which ad channels show evidence of activity
- A cheap → expensive scan sequencer that stops once activity is confirmed

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
- `entity`: string (business name, brand name, or domain)

### Optional
- `channel_hint`: enum
  - Used only when the user explicitly asks about a channel

---

## Output Contract

- `is_advertising`: boolean
- `channels_detected`: array of channels
- `confidence`: `high` | `medium` | `low`
- `evidence_summary`: short natural-language explanation
