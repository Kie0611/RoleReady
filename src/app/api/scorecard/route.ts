import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { interviewSessions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generateScorecard } from "@/lib/ai/scorecard";

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
      .where(eq(interviewSessions.id, sessionId))
      .returning();

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[scorecard error]", err);
    return NextResponse.json({ error: "Failed to generate scorecard" }, { status: 500 });
  }
}