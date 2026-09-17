"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { type InterviewSession } from "@/lib/db/schema";
import { type Scorecard } from "@/lib/ai/scorecard";
import { Kicker, PageHeader, ScoreBar } from "@/components/ui/role-ready";
import { CheckCircle, XCircle, ArrowRight } from "lucide-react";

export function ScorecardView({ session }: { session: InterviewSession }) {
  const router                        = useRouter();
  const [scorecard, setScorecard]     = useState<Scorecard | null>(
    session.scorecard as Scorecard | null
  );
  const [generating, setGenerating]   = useState(!session.scorecard);
  const [error,      setError]        = useState("");

  useEffect(() => {
    if (session.scorecard) return;
    generateScorecard();
  }, []);

  async function generateScorecard() {
    setGenerating(true);
    setError("");

    try {
      const res = await fetch("/api/scorecard", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ sessionId: session.id }),
      });

      if (!res.ok) throw new Error("Failed to generate scorecard");

      const updated = await res.json();
      setScorecard(updated.scorecard as Scorecard);
    } catch (err) {
      setError("Failed to generate scorecard. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  if (generating) {
    return (
      <main className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
        <PageHeader title="Scorecard" eyebrow={session.role} />
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <div className="h-6 w-1.5 animate-blink bg-foreground" />
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Analyzing your interview…
          </p>
          <p className="max-w-sm text-sm text-muted-foreground">
            This takes about 10–15 seconds. We're reading through your answers carefully.
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
        <PageHeader title="Scorecard" eyebrow={session.role} />
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <button
            onClick={generateScorecard}
            className="bg-foreground px-4 py-2 text-sm font-semibold text-background hover:opacity-90 transition-opacity"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  if (!scorecard) return null;

  const scoreColor =
    scorecard.overallScore >= 80 ? "text-success" :
    scorecard.overallScore >= 65 ? "text-warning"  : "text-destructive";

  const readyColor = scorecard.readyForInterview
    ? "border-success/40 bg-success/10 text-success"
    : "border-warning/50 bg-accent/10 text-warning";

  return (
    <main className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Scorecard"
        eyebrow={`${session.role} · ${session.interviewType}`}
        action={
          <button
            onClick={() => router.push("/interview/new")}
            className="flex items-center gap-2 bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90 transition-opacity"
          >
            Practice again <ArrowRight className="size-4" />
          </button>
        }
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">

        {/* Left — overall score */}
        <div className="space-y-4">
          <div className="border border-border bg-card p-5">
            <Kicker>Overall score</Kicker>
            <p className={`mt-3 text-6xl font-extrabold ${scoreColor}`}>
              {scorecard.overallScore}
            </p>
            <p className="mt-1 font-mono text-[10px] text-muted-foreground">out of 100</p>
            <span className={`mt-4 inline-flex border px-2 py-1 font-mono text-[9px] uppercase ${readyColor}`}>
              {scorecard.readyForInterview ? "Ready for interviews" : "Keep practicing"}
            </span>
          </div>

          {/* Strengths */}
          <div className="border border-border bg-card p-5">
            <Kicker>Strengths</Kicker>
            <ul className="mt-3 space-y-2">
              {scorecard.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="mt-0.5 size-4 shrink-0 text-success" />
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {/* Improvements */}
          <div className="border border-border bg-card p-5">
            <Kicker>Improvements</Kicker>
            <ul className="mt-3 space-y-2">
              {scorecard.improvements.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <XCircle className="mt-0.5 size-4 shrink-0 text-warning" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right — dimensions + best answer */}
        <div className="space-y-6">

          {/* Score dimensions */}
          <div className="border border-border bg-card p-5">
            <Kicker>Score breakdown</Kicker>
            <div className="mt-5 space-y-6">
              <ScoreBar
                label="Communication"
                score={scorecard.dimensions.communication.score}
                feedback={scorecard.dimensions.communication.feedback}
              />
              <ScoreBar
                label="Technical accuracy"
                score={scorecard.dimensions.technicalAccuracy.score}
                feedback={scorecard.dimensions.technicalAccuracy.feedback}
              />
              <ScoreBar
                label="STAR method"
                score={scorecard.dimensions.starMethod.score}
                feedback={scorecard.dimensions.starMethod.feedback}
              />
              <ScoreBar
                label="Confidence"
                score={scorecard.dimensions.confidence.score}
                feedback={scorecard.dimensions.confidence.feedback}
              />
            </div>
          </div>

          {/* Best answer */}
          <div className="border border-border bg-card p-5">
            <Kicker>Best answer — improved</Kicker>
            <p className="mt-3 text-sm font-bold">{scorecard.bestAnswer.question}</p>

            <div className="mt-4 space-y-4">
              <div>
                <p className="font-mono text-[9px] uppercase text-muted-foreground">Your answer</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {scorecard.bestAnswer.yourAnswer}
                </p>
              </div>
              <div className="border-l-2 border-accent bg-accent/10 p-4">
                <p className="font-mono text-[9px] uppercase text-accent">Improved version</p>
                <p className="mt-2 text-sm leading-relaxed">
                  {scorecard.bestAnswer.improved}
                </p>
              </div>
            </div>
          </div>

          {/* Full transcript */}
          <details className="border border-border">
            <summary className="cursor-pointer bg-card px-5 py-3 text-sm font-semibold hover:bg-secondary transition-colors">
              View full transcript
            </summary>
            <div className="space-y-4 p-5">
              {(session.messages as any[])
                .filter((_: any, i: number) => i !== 0)
                .map((m: any, i: number) => {
                  const isAI = m.role === "assistant";
                  const text = m.parts
                    ? m.parts.filter((p: any) => p.type === "text").map((p: any) => p.text).join("")
                    : m.content ?? "";
                  return (
                    <div key={i} className={isAI
                      ? "border-l-2 border-accent bg-background p-4"
                      : "border-l-2 border-info bg-info/10 p-4"
                    }>
                      <Kicker className={isAI ? "text-warning" : "text-info"}>
                        {isAI ? "Interviewer" : "You"}
                      </Kicker>
                      <p className="mt-2 text-sm leading-relaxed">{text}</p>
                    </div>
                  );
                })}
            </div>
          </details>
        </div>
      </div>
    </main>
  );
}