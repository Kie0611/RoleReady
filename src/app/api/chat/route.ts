import { streamText, convertToModelMessages, toUIMessageStream, createUIMessageStreamResponse } from "ai";
import { geminiFlash } from "@/lib/ai/gemini";
import { buildInterviewSystemPrompt } from "@/lib/ai/prompts";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { interviewSessions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { messages, sessionId } = body;

    if (!sessionId) {
      return new Response("Missing sessionId", { status: 400 });
    }

    const [interviewSession] = await db
      .select()
      .from(interviewSessions)
      .where(eq(interviewSessions.id, sessionId))
      .limit(1);

    if (!interviewSession || interviewSession.userId !== session.user.id) {
      return new Response("Not found", { status: 404 });
    }

    const modelMessages = await convertToModelMessages(messages ?? []);

    const result = await streamText({
      model: geminiFlash,
      system: buildInterviewSystemPrompt({
        role:           interviewSession.role,
        company:        interviewSession.company        ?? undefined,
        jobDescription: interviewSession.jobDescription ?? undefined,
        interviewType:  interviewSession.interviewType,
        difficulty:     interviewSession.difficulty,
      }),
      messages: modelMessages,
    });

    return createUIMessageStreamResponse({
      stream: toUIMessageStream({ stream: result.stream }),
    });

  } catch (err) {
    console.error("[chat route error]", err);
    return new Response("Internal server error", { status: 500 });
  }
}