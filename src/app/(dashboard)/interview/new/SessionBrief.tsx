"use client";

import { Kicker } from "@/components/ui/role-ready";

type InterviewType = "behavioral" | "technical" | "mixed";
type Difficulty    = "junior"     | "mid"        | "senior";

const TYPE_LABEL: Record<InterviewType, string> = {
  behavioral: "Behavioral",
  technical:  "Technical",
  mixed:      "Mixed",
};

const DIFF_LABEL: Record<Difficulty, string> = {
  junior: "Junior",
  mid:    "Mid",
  senior: "Senior",
};

interface Props {
  role:          string;
  interviewType: InterviewType;
  difficulty:    Difficulty;
  loading:       boolean;
}


export function SessionBrief({ role, interviewType, difficulty, loading }: Props) {
  return (
    <aside className="h-fit bg-foreground p-5 text-background">
      <Kicker className="text-accent">Session brief</Kicker>

      <h2 className="mt-3 text-xl font-extrabold leading-tight">
        {role.trim() || "Your role"}
      </h2>

      <hr className="mt-5 border-background/20" />

      <dl className="mt-5 space-y-3">
        <BriefRow label="Format"   value={TYPE_LABEL[interviewType]} />
        <BriefRow label="Level"    value={DIFF_LABEL[difficulty]}    />
        <BriefRow label="Length"   value="5–8 questions"             />
        <BriefRow label="Estimate" value="25–45 min"                 />
      </dl>

      <hr className="mt-5 border-background/20" />

      <p className="mt-5 text-xs leading-relaxed text-background/50">
        The interviewer will ask one question at a time and follow up based on your answer.
      </p>

      <button
        type="submit"
        form="interview-form"
        disabled={loading}
        className="mt-6 w-full bg-accent py-3 text-sm font-bold text-accent-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {loading ? "Starting…" : "Enter interview room"}
      </button>
    </aside>
  );
}

function BriefRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <dt className="text-muted-foreground font-medium">{label}</dt>
      <dd className="font-mono text-xs text-background">{value}</dd>
    </div>
  );
}