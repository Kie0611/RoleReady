import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { InterviewSetupForm } from "./InterviewSetupForm";
import { PageHeader } from "@/components/ui/role-ready";

export default async function NewInterviewPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="New interview"
        eyebrow="RoleReady · setup"
      />
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <InterviewSetupForm />
        <HelpPanel />
      </div>
    </main>
  );
}

function HelpPanel() {
  const tips = [
    { label: "Be specific on the role", text: "The more specific the role, the sharper the questions. 'Junior React Developer' beats 'Developer'." },
    { label: "Paste the job description", text: "The AI will tailor questions directly to the JD — this is the single biggest improvement you can make." },
    { label: "Start at your real level", text: "Pick the difficulty you're actually applying for, not the one you're comfortable at." },
  ];

  return (
    <aside className="space-y-4">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        Tips for a better session
      </p>
      {tips.map((tip) => (
        <div key={tip.label} className="border border-border bg-card p-4">
          <p className="text-sm font-bold">{tip.label}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{tip.text}</p>
        </div>
      ))}
    </aside>
  );
}