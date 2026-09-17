import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db/client";
import { interviewSessions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { InterviewRoom } from "./InterviewRoom";

export default async function InterviewPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { sessionId } = await params;

  const [interviewSession] = await db
    .select()
    .from(interviewSessions)
    .where(eq(interviewSessions.id, sessionId))
    .limit(1);

  if (!interviewSession || interviewSession.userId !== session.user.id) {
    notFound();
  }

  return <InterviewRoom session={interviewSession} />;
}