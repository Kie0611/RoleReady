import Link from "next/link";
import { ArrowRight, PenLine } from "lucide-react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getRecentSessionsByUser } from "@/lib/db/queries/sessions";
import { Kicker, PageHeader, ScoreBar } from "@/components/ui/role-ready";
import { type InterviewSession } from "@/lib/db/schema";
import { LoginSuccessToast } from "./LoginSuccessToast";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const sessions = await getRecentSessionsByUser(session.user.id, 5);

  const completed  = sessions.filter((s) => s.status === "completed");
  const scores     = completed.map((s) => s.overallScore ?? 0).filter(Boolean);
  const avgScore   = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const bestScore  = scores.length ? Math.max(...scores) : 0;
  const thisWeek   = sessions.filter((s) => {
    const d = new Date(s.createdAt);
    const now = new Date();
    return now.getTime() - d.getTime() < 7 * 24 * 60 * 60 * 1000;
  }).length;

  // Chart data — last 7 completed sessions scores
  const chartSessions = completed.slice(0, 7).reverse();

  return (
    <>
      <LoginSuccessToast />

      <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        
        <PageHeader
          title="Dashboard"
          eyebrow="RoleReady · overview"
          action={
            sessions.some((s) => s.status === "in_progress") ? (
              <span className="flex items-center gap-2 font-mono text-[10px] uppercase text-destructive">
                <span className="size-2 bg-destructive" />
                Session in progress
              </span>
            ) : undefined
          }
        />

        <div className="mt-6 grid gap-6 lg:grid-cols-[340px_1fr]">

          {/* Left column */}
          <div className="space-y-6">

            {/* Start CTA */}
            <section className="animate-rise bg-foreground p-5 text-background">
              <div className="flex items-center justify-between">
                <Kicker className="text-accent">Start new interview</Kicker>
                <ArrowRight className="size-4" />
              </div>
              <h2 className="mt-3 text-lg font-bold">Ready to practice?</h2>
              <p className="mt-1 text-sm text-background/60">Pick a role and start a session.</p>
              <Link
                href="/interview/new"
                className="mt-5 inline-flex items-center gap-2 bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90 transition-opacity"
              >
                Begin interview <ArrowRight className="size-4" />
              </Link>
            </section>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <Metric label="Avg score"    value={avgScore  ? `${avgScore}` : "—"} note={`${completed.length} completed`} />
              <Metric label="Best score"   value={bestScore ? `${bestScore}` : "—"} note="all time" />
              <Metric label="Total sessions" value={`${sessions.length}`} note="all time" />
              <Metric label="This week"    value={`${thisWeek}`} note="sessions" />
            </div>

            {/* Readiness */}
            {avgScore > 0 && (
              <section className="border border-border bg-card p-4">
                <div className="flex justify-between">
                  <Kicker>Readiness</Kicker>
                  <span className="font-mono text-xs font-bold">{avgScore} / 100</span>
                </div>
                <div className="mt-4 h-8 bg-secondary">
                  <div
                    className="h-full origin-left animate-grow bg-accent"
                    style={{ width: `${avgScore}%` }}
                  />
                </div>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  Based on your average score across all completed sessions.
                </p>
              </section>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-6">

            {/* Chart */}
            {chartSessions.length > 0 && (
              <ProgressChart sessions={chartSessions} />
            )}

            {/* Recent sessions */}
            <section>
              <div className="flex items-center justify-between pb-2">
                <h2 className="font-bold">Recent practice</h2>
                <Link
                  href="/sessions"
                  className="font-mono text-[10px] uppercase text-muted-foreground hover:text-foreground transition-colors"
                >
                  View all
                </Link>
              </div>
              <div className="border-t border-border">
                {sessions.length === 0 ? (
                  <EmptyState />
                ) : (
                  sessions.map((s) => <SessionRow key={s.id} session={s} />)
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="border border-border bg-card p-4">
      <Kicker>{label}</Kicker>
      <p className="mt-2 text-3xl font-extrabold">{value}</p>
      <p className="mt-1 font-mono text-[9px] text-muted-foreground">{note}</p>
    </div>
  );
}

function ProgressChart({ sessions }: { sessions: InterviewSession[] }) {
  const max = Math.max(...sessions.map((s) => s.overallScore ?? 0), 1);
  return (
    <section className="border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-bold">Progress over time</h2>
        <Kicker>
          <span className="mr-2 inline-block size-2 bg-info" />
          Score
        </Kicker>
      </div>
      <div className="mt-5 flex h-40 items-end gap-2 border-b border-border">
        {sessions.map((s, i) => (
          <div
            key={s.id}
            title={`${s.overallScore ?? 0}`}
            className="flex-1 bg-info transition-colors"
            style={{ height: `${((s.overallScore ?? 0) / max) * 100}%` }}
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between font-mono text-[9px] text-muted-foreground">
        {sessions.map((s) => (
          <span key={s.id}>
            {new Date(s.createdAt).toLocaleDateString("en", { month: "short", day: "numeric" })}
          </span>
        ))}
      </div>
    </section>
  );
}

function SessionRow({ session }: { session: InterviewSession }) {
  const score = session.overallScore ?? 0;
  const scoreColor =
    score >= 78 ? "bg-success" :
    score >= 65 ? "bg-accent"  : "bg-destructive";

  const statusLabel =
    session.status === "completed"   ? score >= 78 ? "Strong" : score >= 65 ? "Review" : "Needs work" :
    session.status === "in_progress" ? "In progress" : "Abandoned";

  const statusColor =
    statusLabel === "Strong"      ? "border-success/40 bg-success/10 text-success"       :
    statusLabel === "Review"      ? "border-accent/50 bg-accent/10 text-warning"          :
    statusLabel === "In progress" ? "border-info/40 bg-info/10 text-info"                 :
    "border-border text-muted-foreground";

  const date = new Date(session.createdAt).toLocaleDateString("en", {
    month: "short", day: "numeric",
  });

  return (
    <Link
      href={`/sessions/${session.id}`}
      className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 border-b border-border py-4 transition-colors hover:bg-card md:px-3"
    >
      <span className={`size-2.5 ${scoreColor}`} />
      <div className="min-w-0">
        <p className="truncate font-semibold">{session.role}</p>
        <p className="font-mono text-[9px] uppercase text-muted-foreground">
          {session.interviewType} · {date}
        </p>
      </div>
      <span className={`inline-flex border px-2 py-1 font-mono text-[9px] uppercase ${statusColor}`}>
        {statusLabel}
      </span>
      <span className="font-mono text-lg font-bold">
        {session.status === "completed" ? score : "—"}
      </span>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="py-12 text-center">
      <p className="font-mono text-[10px] uppercase text-muted-foreground">No sessions yet</p>
      <p className="mt-2 text-sm text-muted-foreground">Start your first practice interview.</p>
      <Link
        href="/interview/new"
        className="mt-4 inline-flex items-center gap-2 bg-foreground px-4 py-2 text-sm font-semibold text-background hover:opacity-90 transition-opacity"
      >
        Start now <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}