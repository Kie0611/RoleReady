"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <div className="mt-16 flex flex-col items-center gap-4 text-center">
        <p className="font-mono text-[10px] uppercase tracking-widest text-destructive">
          Something went wrong
        </p>
        <p className="max-w-sm text-sm text-muted-foreground">
          We couldn&apos;t load your dashboard. This is usually a temporary issue.
        </p>
        <div className="flex gap-3">
          <button
            onClick={reset}
            className="border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary transition-colors"
          >
            Try again
          </button>
          <Link
            href="/interview/new"
            className="bg-foreground px-4 py-2 text-sm font-semibold text-background hover:opacity-90 transition-opacity"
          >
            Start an interview
          </Link>
        </div>
      </div>
    </main>
  );
}