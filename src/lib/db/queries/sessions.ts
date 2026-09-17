import { desc, eq } from "drizzle-orm";
import { db } from "../client";
import { interviewSessions } from "../schema";

export async function getSessionsByUser(userId: string) {
  return db
    .select()
    .from(interviewSessions)
    .where(eq(interviewSessions.userId, userId))
    .orderBy(desc(interviewSessions.createdAt));
}

export async function getRecentSessionsByUser(userId: string, limit = 5) {
  return db
    .select()
    .from(interviewSessions)
    .where(eq(interviewSessions.userId, userId))
    .orderBy(desc(interviewSessions.createdAt))
    .limit(limit);
}