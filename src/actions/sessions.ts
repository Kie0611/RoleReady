"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { interviewSessions } from "@/lib/db/schema";
import { redirect } from "next/navigation";

export async function createSessionAction(data: {
  role: string,
  company?: string,
  jobDescription?: string,
  interviewType: "behavioral" | "technical" | "mixed";
  difficulty: "junior" | "mid" | "senior";
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [created] = await db
    .insert(interviewSessions)
    .values({
      userId: session.user.id,
      ...data
    })
    .returning();

  redirect(`/interview/${created.id}`);
}