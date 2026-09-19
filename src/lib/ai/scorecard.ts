import { generateObject } from "ai";
import { geminiFlash } from "./gemini";
import { z } from "zod";

export const scorecardSchema = z.object({
  overallScore: z.number().min(0).max(100),
  dimensions: z.object({
    communication:     z.object({ score: z.number().min(0).max(100), feedback: z.string() }),
    technicalAccuracy: z.object({ score: z.number().min(0).max(100), feedback: z.string() }),
    starMethod:        z.object({ score: z.number().min(0).max(100), feedback: z.string() }),
    confidence:        z.object({ score: z.number().min(0).max(100), feedback: z.string() }),
  }),
  strengths:         z.array(z.string()).min(1).max(4),
  improvements:      z.array(z.string()).min(1).max(4),
  bestAnswer: z.object({
    question:   z.string(),
    yourAnswer: z.string(),
    improved:   z.string(),
  }),
  readyForInterview: z.boolean(),
});

export type Scorecard = z.infer<typeof scorecardSchema>;

export async function generateScorecard(
  messages: { role: string; content?: string; parts?: { type: string; text?: string }[] }[]
) {
    const IGNORED_TRIGGERS = [
      "please begin the interview.",
      "start the interview with a professional greeting",
      "please begin the interview",
    ];

    const transcript = messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .filter((m) => {
        const text = m.parts
          ? m.parts.filter((p) => p.type === "text").map((p) => p.text ?? "").join("").toLowerCase().trim()
          : (m.content ?? "").toLowerCase().trim();
        return !IGNORED_TRIGGERS.some((trigger) => text.startsWith(trigger.toLowerCase()));
      })
    .map((m) => {
      const text = m.parts
        ? m.parts.filter((p) => p.type === "text").map((p) => p.text ?? "").join("")
        : m.content ?? "";
      return `${m.role === "assistant" ? "INTERVIEWER" : "CANDIDATE"}: ${text}`;
    })
    .join("\n\n");

  const { object } = await generateObject({
    model:  geminiFlash,
    schema: scorecardSchema,
    prompt: `
      You are an expert interview coach. Analyze this interview transcript and generate a detailed, honest scorecard.
      Be specific — this person is preparing for a real interview.

      Transcript:
      ${transcript}

      Score each dimension 0–100. Be honest, not generous.
      For bestAnswer, pick the candidate's strongest answer, show it as-is, then rewrite it to show how it could be improved.
    `.trim(),
  });

  return object;
}