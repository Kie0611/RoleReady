"use client";

import { createSessionAction } from "@/actions/sessions";

type InterviewType = "behavioral" | "technical" | "mixed";
type Difficulty    = "junior"     | "mid"        | "senior";

const INTERVIEW_TYPES: { value: InterviewType; label: string; desc: string }[] = [
  { value: "behavioral", label: "Behavioral", desc: "STAR method, past experience, soft skills" },
  { value: "technical",  label: "Technical",  desc: "Concepts, code, problem-solving"           },
  { value: "mixed",      label: "Mixed",      desc: "Both behavioral and technical questions"    },
];

const DIFFICULTIES: { value: Difficulty; label: string; desc: string }[] = [
  { value: "junior", label: "Junior", desc: "0–2 years, fundamentals focus"        },
  { value: "mid",    label: "Mid",    desc: "2–5 years, independence expected"      },
  { value: "senior", label: "Senior", desc: "5+ years, system design & leadership" },
];

interface Props {
  interviewType:         InterviewType;
  difficulty:            Difficulty;
  onInterviewTypeChange: (v: InterviewType) => void;
  onDifficultyChange:    (v: Difficulty)    => void;
  onRoleChange:          (v: string)        => void;
  onLoadingChange:       (v: boolean)       => void;
}

export function InterviewSetupForm({
  interviewType,
  difficulty,
  onInterviewTypeChange,
  onDifficultyChange,
  onRoleChange,
  onLoadingChange,
}: Props) {
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onLoadingChange(true);

    const form           = e.currentTarget;
    const role           = (form.elements.namedItem("role")           as HTMLInputElement).value;
    const company        = (form.elements.namedItem("company")        as HTMLInputElement).value;
    const jobDescription = (form.elements.namedItem("jobDescription") as HTMLTextAreaElement).value;

    await createSessionAction({ role, company, jobDescription, interviewType, difficulty });
  }

  return (
    <form id="interview-form" onSubmit={handleSubmit} className="space-y-8">

      {/* Role */}
      <div className="space-y-2">
        <label htmlFor="role" className="text-sm font-bold">
          Role <span className="text-destructive">*</span>
        </label>
        <input
          id="role"
          name="role"
          type="text"
          required
          placeholder="e.g. Junior Full-Stack Developer"
          onChange={(e) => onRoleChange(e.target.value)}
          className="h-11 w-full border border-input bg-card px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-1"
        />
      </div>

      {/* Company */}
      <div className="space-y-2">
        <label htmlFor="company" className="text-sm font-bold">
          Company{" "}
          <span className="font-mono text-[10px] font-normal text-muted-foreground">(optional)</span>
        </label>
        <input
          id="company"
          name="company"
          type="text"
          placeholder="e.g. TechCorp PH"
          className="h-11 w-full border border-input bg-card px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-1"
        />
      </div>

      {/* Interview type */}
      <div className="space-y-3">
        <p className="text-sm font-bold">Interview type</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {INTERVIEW_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => onInterviewTypeChange(t.value)}
              className={`border p-3 text-left transition-colors ${
                interviewType === t.value
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card hover:bg-secondary"
              }`}
            >
              <p className="text-sm font-bold">{t.label}</p>
              <p className={`mt-1 text-xs leading-relaxed ${
                interviewType === t.value ? "text-background/60" : "text-muted-foreground"
              }`}>
                {t.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty */}
      <div className="space-y-3">
        <p className="text-sm font-bold">Difficulty</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => onDifficultyChange(d.value)}
              className={`border p-3 text-left transition-colors ${
                difficulty === d.value
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card hover:bg-secondary"
              }`}
            >
              <p className="text-sm font-bold">{d.label}</p>
              <p className={`mt-1 text-xs leading-relaxed ${
                difficulty === d.value ? "text-background/60" : "text-muted-foreground"
              }`}>
                {d.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Job description */}
      <div className="space-y-2">
        <label htmlFor="jobDescription" className="text-sm font-bold">
          Job description{" "}
          <span className="font-mono text-[10px] font-normal text-muted-foreground">(optional but recommended)</span>
        </label>
        <textarea
          id="jobDescription"
          name="jobDescription"
          rows={6}
          placeholder="Paste the job description here — the AI will tailor questions to it."
          className="w-full border border-input bg-card px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-1 resize-none"
        />
      </div>
    </form>
  );
}