"use client";

import { useEffect } from "react";

export default function SessionsError({
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
    <main className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
      <div className="mt-16 flex flex-col items-center gap-4 text-center">
        <p className="font-mono text-[10px] uppercase tracking-widest text-destructive">
          Couldn&apos;t load sessions
        </p>
        <p className="text-sm text-muted-foreground">
          There was a problem fetching your session history.
        </p>
        <button
          onClick={reset}
          className="bg-foreground px-4 py-2 text-sm font-semibold text-background hover:opacity-90 transition-opacity"
        >
          Try again
        </button>
      </div>
    </main>
  );
}