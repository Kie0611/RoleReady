import Link from "next/link";
import { ArrowRight, Check, MessageSquareText, Target } from "lucide-react";
import { BrandMark, Kicker, ScoreBar } from "@/components/ui/role-ready";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">

      {/* Nav */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between border-b border-border px-5 py-4 lg:px-8">
        <BrandMark />
        <div className="flex items-center gap-2">
          <Link href="/login" className="px-4 py-2 text-sm font-semibold text-foreground hover:bg-secondary transition-colors">
            Sign in
          </Link>
          <Link href="/register" className="flex items-center gap-2 bg-foreground px-4 py-2 text-sm font-semibold text-background hover:opacity-90 transition-opacity">
            Start practicing <ArrowRight className="size-4" />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto grid min-h-[640px] max-w-7xl items-center gap-12 px-5 py-16 lg:grid-cols-[1.05fr_.95fr] lg:px-8">
        <div className="animate-rise">
          <Kicker className="text-warning">Practice under real pressure</Kicker>
          <h1 className="mt-5 max-w-[12ch] text-5xl font-extrabold leading-[.96] sm:text-7xl">
            RoleReady
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            A realistic interview room that listens, follows up, and shows you exactly what to sharpen before the real conversation.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="flex items-center gap-2 bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground hover:opacity-90 transition-opacity"
            >
              Start a practice round <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 border border-border px-6 py-3 text-sm font-semibold hover:bg-secondary transition-colors"
            >
              View demo dashboard
            </Link>
          </div>
          <div className="mt-12 grid max-w-xl grid-cols-3 gap-px border border-border bg-border">
            <Stat n="5–8" label="adaptive questions" />
            <Stat n="4"   label="scoring dimensions" />
            <Stat n="1"   label="clear action plan" />
          </div>
        </div>

        {/* Live interview preview card */}
        <div className="animate-rise border border-border bg-card p-5 [animation-delay:100ms]">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <Kicker>Live interview · mixed</Kicker>
              <p className="mt-1 font-bold">Junior Full-Stack Developer</p>
            </div>
            <span className="font-mono text-xs text-destructive">06:12</span>
          </div>
          <div className="space-y-4 py-6">
            <Chat
              speaker="Interviewer"
              text="Tell me about a time you had to debug a production issue under pressure."
            />
            <Chat
              speaker="You"
              mine
              text="A payment webhook began failing during an overnight release. I isolated the retry storm and paused the queue…"
            />
            <Chat
              speaker="Interviewer"
              text="What did you prioritize first, and how did you keep the team informed?"
            />
          </div>
          <div className="border-l-2 border-accent bg-accent/10 p-4">
            <Kicker className="text-warning">Follow-up in context</Kicker>
            <p className="mt-2 text-sm">
              The interviewer presses on your actual answer — not a generic script.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-border bg-foreground text-background">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-3 lg:px-8">
          <Feature icon={<MessageSquareText />} step="01" title="Hold the conversation"
            text="Answer one question at a time while the interviewer adapts to what you actually say." />
          <Feature icon={<Target />} step="02" title="See the signal"
            text="Review communication, technical accuracy, STAR structure, and confidence separately." />
          <Feature icon={<Check />} step="03" title="Practice the fix"
            text="Turn vague advice into an improved answer you can rehearse before the next round." />
        </div>
      </section>

      {/* Sample scorecard */}
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-2 lg:px-8">
        <div>
          <Kicker>Sample scorecard</Kicker>
          <h2 className="mt-4 max-w-lg text-4xl font-extrabold leading-tight">
            Feedback that reads like notes from a good coach.
          </h2>
          <p className="mt-4 max-w-lg text-muted-foreground">
            Specific enough to change your next answer, structured enough to show progress over time.
          </p>
        </div>
        <div className="border border-border bg-card p-6">
          <div className="flex items-end justify-between">
            <div>
              <Kicker>Overall score</Kicker>
              <p className="mt-2 text-5xl font-extrabold">78</p>
            </div>
            <span className="border border-success/40 bg-success/10 px-2 py-1 font-mono text-[10px] uppercase text-success">
              Almost ready
            </span>
          </div>
          <div className="mt-7 space-y-5">
            <ScoreBar label="Communication"      score={88} />
            <ScoreBar label="Technical accuracy" score={82} />
            <ScoreBar label="STAR method"        score={68} />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-5 py-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <BrandMark />
          <p className="font-mono text-[10px] uppercase text-muted-foreground">Prepare deliberately.</p>
        </div>
      </footer>
    </main>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div className="bg-card p-4">
      <p className="text-2xl font-extrabold">{n}</p>
      <p className="mt-1 font-mono text-[9px] uppercase text-muted-foreground">{label}</p>
    </div>
  );
}

function Chat({ speaker, text, mine = false }: { speaker: string; text: string; mine?: boolean }) {
  return (
    <div className={mine
      ? "ml-10 border-l-2 border-info bg-info/10 p-4"
      : "mr-8 border-l-2 border-border p-4"
    }>
      <Kicker className={mine ? "text-info" : undefined}>{speaker}</Kicker>
      <p className="mt-2 text-sm leading-relaxed">{text}</p>
    </div>
  );
}


function Feature({ icon, step, title, text }: {
  icon: React.ReactNode; step: string; title: string; text: string;
}) {
  return (
    <div className="border-t border-background/25 pt-5">
      <div className="flex items-center justify-between text-accent">
        <span className="[&_svg]:size-5">{icon}</span>
        <span className="font-mono text-xs">{step}</span>
      </div>
      <h2 className="mt-8 text-xl font-bold">{title}</h2>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-background/65">{text}</p>
    </div>
  );
}