import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { interviewSessions } from "@/lib/db/schema";


export async function POST(req: NextRequest ) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { role, company, jobDescription, interviewType, difficulty } = body;

  if (!role) {
    return NextResponse.json({ error: "Role is required" }, { status: 400 });
  }

  const [created] = await db
    .insert(interviewSessions)
    .values({
      userId: session.user.id,
      role,
      company,
      jobDescription,
      interviewType: interviewType ?? "mixed",
      difficulty: difficulty ?? "junior",
    })
    .returning();

  return NextResponse.json(created, { status: 201 });
}