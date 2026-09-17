import { PageHeader } from "@/components/ui/role-ready";

export default function SessionsLoading() {
  return (
    <main className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
      <PageHeader title="Sessions" eyebrow="Loading…" />
      <div className="mt-8 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse bg-secondary" />
        ))}
      </div>
    </main>
  );
}