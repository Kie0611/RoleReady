import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db/client";
import { interviewSessions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ScorecardView } from "./ScorecardView";

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  const [interviewSession] = await db
    .select()
    .from(interviewSessions)
    .where(eq(interviewSessions.id, id))
    .limit(1);

  if (!interviewSession || interviewSession.userId !== session.user.id) {
    notFound();
  }

  return <ScorecardView session={interviewSession} />;
}