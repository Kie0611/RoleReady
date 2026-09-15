import Link from "next/link";
import { ArrowRight, PenLine } from "lucide-react";
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();
  const name = session?.user?.name?.split(" ")[0] ?? "there";

  return (
    <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Dashboard"
        eyebrow="RoleReady · weekly review"
        action={
          <span className="flex items-center gap-2 font-mono text-[10px] uppercase text-destructive">
            <span className="size-2 bg-destructive" />
            1 session ready
          </span>
        }
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-[340px_1fr]">

        {/* Left column */}
        <div className="space-y-6">

          {/* Start interview CTA */}
          <section className="animate-rise bg-foreground p-5 text-background">
            <div className="flex items-center justify-between">
              <Kicker className="text-accent">Start new interview</Kicker>
              <ArrowRight className="size-4" />
            </div>
            <h2 className="mt-3 text-lg font-bold">Junior Full-Stack Developer</h2>
            <p className="mt-1 text-sm text-background/60">Mixed · Junior difficulty · 45 min</p>
            <Link
              href="/interview/new"
              className="mt-5 inline-flex items-center gap-2 bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90 transition-opacity"
            >
              Begin interview <ArrowRight className="size-4" />
            </Link>
          </section>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <Metric label="Avg score"  value="72%" note="▲ 6 pts this week" />
            <Metric label="On a streak" value="9"  note="days in a row" />
          </div>

          {/* Readiness bar */}
          <section className="border border-border bg-card p-4">
            <div className="flex justify-between">
              <Kicker>Readiness</Kicker>
              <span className="font-mono text-xs font-bold">78 / 100</span>
            </div>
            <div className="mt-4 h-8 bg-secondary">
              <div className="h-full w-[78%] origin-left animate-grow bg-accent" />
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Strong on technical accuracy — hold your STAR structure on behavioral rounds.
            </p>
          </section>
        </div>

        {/* Right column */}
        <div className="space-y-6">

          {/* Progress chart */}
          <ProgressChart />

          {/* Recent sessions */}
          <section>
            <div className="flex items-center justify-between pb-2">
              <h2 className="font-bold">Recent practice</h2>
              <Link href="/sessions" className="font-mono text-[10px] uppercase text-muted-foreground hover:text-foreground transition-colors">
                View all sessions
              </Link>
            </div>
            <div className="border-t border-border">
              {SAMPLE_SESSIONS.map((s) => (
                <SessionRow key={s.id} session={s} />
              ))}
            </div>
          </section>

          {/* Coach note */}
          <section className="flex gap-4 border border-accent/40 bg-accent/10 p-4">
            <div className="grid size-10 shrink-0 place-items-center bg-accent">
              <PenLine className="size-4" />
            </div>
            <div>
              <Kicker className="text-destructive">Coach note</Kicker>
              <p className="mt-1 text-sm">
                Your <strong>STAR structure</strong> drifted on the conflict question — name the result before the interviewer asks. Technical answers are dialed in.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function PageHeader({ title, eyebrow, action }: {
  title: string; eyebrow: string; action?: React.ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
      <div className="flex flex-wrap items-baseline gap-3">
        <h1 className="text-2xl font-extrabold">{title}</h1>
        <span className="font-mono text-[10px] uppercase text-muted-foreground">{eyebrow}</span>
      </div>
      {action}
    </header>
  );
}

function Kicker({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`font-mono text-[10px] uppercase tracking-widest text-muted-foreground ${className}`}>
      {children}
    </p>
  );
}

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="border border-border bg-card p-4">
      <Kicker>{label}</Kicker>
      <p className="mt-2 text-3xl font-extrabold">{value}</p>
      <p className="mt-1 font-mono text-[9px] text-success">{note}</p>
    </div>
  );
}

function ProgressChart() {
  const values = [38, 65, 54, 73, 82, 91, 100];
  const days   = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return (
    <section className="animate-rise border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-bold">Progress over time</h2>
        <Kicker>
          <span className="mr-2 inline-block size-2 bg-info" />Overall
        </Kicker>
      </div>
      <div className="mt-5 flex h-40 items-end gap-2 border-b border-border">
        {values.map((v, i) => (
          <div
            key={i}
            className="flex-1 bg-info/20 transition-colors hover:bg-info"
            style={{ height: `${v}%` }}
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between font-mono text-[9px] text-muted-foreground">
        {days.map((d) => <span key={d}>{d}</span>)}
      </div>
    </section>
  );
}

function SessionRow({ session }: { session: typeof SAMPLE_SESSIONS[number] }) {
  const scoreColor =
    session.score >= 78 ? "bg-success" :
    session.score >= 68 ? "bg-accent"  : "bg-destructive";

  const statusColor =
    session.status === "Strong"     ? "border-success/40 bg-success/10 text-success"     :
    session.status === "Review"     ? "border-accent/50 bg-accent/10 text-warning"       :
    "border-destructive/40 bg-destructive/10 text-destructive";

  return (
    <Link
      href={`/sessions/${session.id}`}
      className="group grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-border py-4 transition-colors hover:bg-card md:grid-cols-[auto_1fr_auto_auto] md:px-3"
    >
      <span className={`size-2.5 ${scoreColor}`} />
      <div className="min-w-0">
        <p className="truncate font-semibold">{session.title}</p>
        <p className="font-mono text-[9px] uppercase text-muted-foreground">
          {session.type} · {session.duration} · {session.date}
        </p>
      </div>
      <span className={`inline-flex border px-2 py-1 font-mono text-[9px] uppercase ${statusColor}`}>
        {session.status}
      </span>
      <span className="hidden font-mono text-lg font-bold md:block">{session.score}</span>
    </Link>
  );
}

// ── Seed data (will be replaced with real DB queries in Phase 6) ──────────────

const SAMPLE_SESSIONS = [
  { id: "1", title: "Junior Full-Stack Developer", type: "Mixed",      duration: "38 min", date: "Today",     score: 82, status: "Strong"     as const },
  { id: "2", title: "Frontend Engineer",           type: "Technical",  duration: "44 min", date: "Yesterday", score: 74, status: "Review"     as const },
  { id: "3", title: "React Developer",             type: "Behavioral", duration: "31 min", date: "Mon",       score: 61, status: "Needs work" as const },
  { id: "4", title: "Node.js Backend Dev",         type: "Mixed",      duration: "41 min", date: "Sun",       score: 78, status: "Strong"     as const },
];