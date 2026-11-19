import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";
import type { LanguageModel } from "ai";

export type AiProvider = {
  name: "google" | "groq";
  modelId: string;
  model: LanguageModel;
};

// Keep model selection on the server. The provider packages read their API keys
// from GOOGLE_GENERATIVE_AI_API_KEY and GROQ_API_KEY at request time.
export const aiProviders: readonly AiProvider[] = [
  { name: "google", modelId: "gemini-3.6-flash", model: google("gemini-3.6-flash") },
  { name: "groq", modelId: "openai/gpt-oss-120b", model: groq("openai/gpt-oss-120b") },
];
