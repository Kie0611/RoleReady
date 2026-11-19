import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { interviewSessions } from "@/lib/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { generateScorecard } from "@/lib/ai/scorecard";
import { AiOperationError, clientAiError } from "@/lib/ai/resilience";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await req.json();

    const [interviewSession] = await db
      .select()
      .from(interviewSessions)
      .where(eq(interviewSessions.id, sessionId))
      .limit(1);

    if (!interviewSession || interviewSession.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (interviewSession.status === "in_progress") {
      return NextResponse.json(
        { error: "Finish the interview before generating a scorecard." },
        { status: 409 },
      );
    }

    if (interviewSession.scorecard) return NextResponse.json(interviewSession);

    if (!interviewSession.messages || (interviewSession.messages as []).length === 0) {
      return NextResponse.json({ error: "No messages to score" }, { status: 400 });
    }

    const scorecard = await generateScorecard(interviewSession.messages as any[]);

    const [updated] = await db
      .update(interviewSessions)
      .set({
        scorecard,
        overallScore: scorecard.overallScore,
        status:       "completed",
      })
      .where(and(
        eq(interviewSessions.id, sessionId),
        eq(interviewSessions.userId, session.user.id),
        isNull(interviewSessions.scorecard),
      ))
      .returning();

    if (updated) return NextResponse.json(updated);

    // A concurrent request may have saved a scorecard while this one ran.
    const [existing] = await db.select().from(interviewSessions)
      .where(and(eq(interviewSessions.id, sessionId), eq(interviewSessions.userId, session.user.id)))
      .limit(1);
    if (existing?.scorecard) return NextResponse.json(existing);
    throw new Error("Scorecard was not saved");
  } catch (err) {
    if (!(err instanceof AiOperationError)) console.error("[scorecard error]", err);
    const response = clientAiError(err);
    return NextResponse.json({ error: response.error }, { status: response.status });
  }
}
