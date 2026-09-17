import { PageHeader } from "@/components/ui/role-ready";

export default function DashboardLoading() {
  return (
    <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <PageHeader title="Dashboard" eyebrow="Loading…" />
      <div className="mt-6 grid gap-6 lg:grid-cols-[340px_1fr]">
        <div className="space-y-6">
          <Skeleton className="h-44" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        </div>
        <div className="space-y-6">
          <Skeleton className="h-56" />
          <Skeleton className="h-64" />
        </div>
      </div>
    </main>
  );
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-secondary ${className}`} />;
}