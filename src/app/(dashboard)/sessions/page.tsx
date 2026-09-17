import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSessionsByUser } from "@/lib/db/queries/sessions";
import { Kicker, PageHeader } from "@/components/ui/role-ready";
import { type InterviewSession } from "@/lib/db/schema";
import { ArrowRight } from "lucide-react";

export default async function SessionsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const sessions = await getSessionsByUser(session.user.id);
  const completed = sessions.filter((s) => s.status === "completed");
  const inProgress = sessions.filter((s) => s.status === "in_progress");

  return (
    <main className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Sessions"
        eyebrow={`${sessions.length} total · ${completed.length} completed`}
        action={
          <Link
            href="/interview/new"
            className="flex items-center gap-2 bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90 transition-opacity"
          >
            New interview <ArrowRight className="size-4" />
          </Link>
        }
      />

      {sessions.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="font-mono text-[10px] uppercase text-muted-foreground">No sessions yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Your practice history will appear here.
          </p>
          <Link
            href="/interview/new"
            className="mt-4 inline-flex items-center gap-2 bg-foreground px-4 py-2 text-sm font-semibold text-background hover:opacity-90"
          >
            Start first interview <ArrowRight className="size-4" />
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          {inProgress.length > 0 && (
            <Group title="In progress" sessions={inProgress} />
          )}
          {completed.length > 0 && (
            <Group title="Completed" sessions={completed} />
          )}
        </div>
      )}
    </main>
  );
}

function Group({ title, sessions }: { title: string; sessions: InterviewSession[] }) {
  return (
    <section>
      <Kicker>{title}</Kicker>
      <div className="mt-3 border-t border-border">
        {sessions.map((s) => <SessionCard key={s.id} session={s} />)}
      </div>
    </section>
  );
}

function SessionCard({ session }: { session: InterviewSession }) {
  const score      = session.overallScore ?? 0;
  const isComplete = session.status === "completed";

  const scoreColor =
    score >= 78 ? "text-success" :
    score >= 65 ? "text-warning"  : "text-destructive";

  const date = new Date(session.createdAt).toLocaleDateString("en", {
    year: "numeric", month: "short", day: "numeric",
  });

  const duration = session.durationSeconds
    ? `${Math.floor(session.durationSeconds / 60)} min`
    : null;

  return (
    <Link
      href={`/sessions/${session.id}`}
      className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-border py-5 transition-colors hover:bg-card md:px-3"
    >
      <div>
        <p className="font-semibold">{session.role}</p>
        <p className="mt-1 font-mono text-[9px] uppercase text-muted-foreground">
          {session.interviewType} · {session.difficulty} · {date}
          {duration && ` · ${duration}`}
        </p>
        {session.company && (
          <p className="mt-1 text-xs text-muted-foreground">{session.company}</p>
        )}
      </div>
      <div className="text-right">
        {isComplete ? (
          <>
            <p className={`text-2xl font-extrabold ${scoreColor}`}>{score}</p>
            <p className="font-mono text-[9px] text-muted-foreground">/ 100</p>
          </>
        ) : (
          <span className="font-mono text-[9px] uppercase text-info">In progress</span>
        )}
      </div>
    </Link>
  );
}