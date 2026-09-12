import { anthropic } from "@ai-sdk/anthropic";
import { defineAgent } from "eve";

// Model and provider: recursos/stack.md (Anthropic direct, no AI Gateway).
export default defineAgent({
  model: anthropic("claude-sonnet-5"),
  // This agent only takes print orders: no shell, files, web search, todo list or sub-agents.
  defaultTools: false,
});
