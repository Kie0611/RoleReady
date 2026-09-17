import { PageHeader } from "@/components/ui/role-ready";

export default function ScorecardLoading() {
  return (
    <main className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
      <PageHeader title="Scorecard" eyebrow="Loading…" />
      <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="space-y-4">
          <div className="h-44 animate-pulse bg-secondary" />
          <div className="h-36 animate-pulse bg-secondary" />
          <div className="h-36 animate-pulse bg-secondary" />
        </div>
        <div className="space-y-6">
          <div className="h-72 animate-pulse bg-secondary" />
          <div className="h-56 animate-pulse bg-secondary" />
        </div>
      </div>
    </main>
  );
}