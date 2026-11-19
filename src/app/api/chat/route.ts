import { convertToModelMessages, toUIMessageStream, createUIMessageStreamResponse } from "ai";
import { clientAiError, AiOperationError } from "@/lib/ai/resilience";
import { startInterviewStream } from "@/lib/ai/interview";
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

    const system = buildInterviewSystemPrompt({
      role:           interviewSession.role,
      company:        interviewSession.company        ?? undefined,
      jobDescription: interviewSession.jobDescription ?? undefined,
      interviewType:  interviewSession.interviewType,
      difficulty:     interviewSession.difficulty,
    });

    const stream = await startInterviewStream({ system, messages: modelMessages, signal: req.signal });

    return createUIMessageStreamResponse({
      stream: toUIMessageStream({ stream, onError: (error) => clientAiError(error).error }),
    });

  } catch (err) {
    const response = clientAiError(err);
    if (!(err instanceof AiOperationError)) {
      console.error("[chat route error]", err);
    }
    return Response.json({ error: response.error }, { status: response.status });
  }
}
