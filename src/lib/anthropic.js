// lib/anthropic.js
// Server-only Anthropic client — NEVER import this from a "use client" file.
// Lazy singleton: the SDK throws immediately if ANTHROPIC_API_KEY is missing at
// construction time, and Next.js evaluates route modules during build-time page-data
// collection regardless of whether a request is ever made, so an eager `new Anthropic()`
// here would fail the whole site's build any time the key isn't configured yet.

import Anthropic from "@anthropic-ai/sdk";

let client = null;

export function getAnthropicClient() {
  if (!client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not configured.");
    }
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}
