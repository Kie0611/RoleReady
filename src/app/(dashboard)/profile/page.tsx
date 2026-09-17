import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PageHeader, Kicker } from "@/components/ui/role-ready";
import { getSessionsByUser } from "@/lib/db/queries/sessions";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const sessions  = await getSessionsByUser(session.user.id);
  const completed = sessions.filter((s) => s.status === "completed");
  const scores    = completed.map((s) => s.overallScore ?? 0).filter(Boolean);
  const avgScore  = scores.length
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;
  const bestScore = scores.length ? Math.max(...scores) : 0;

  const initials = session.user.name
    ? session.user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "??";

  return (
    <main className="mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">
      <PageHeader title="Profile" eyebrow="RoleReady · account" />

      <div className="mt-8 space-y-6">

        {/* Identity */}
        <section className="border border-border bg-card p-6">
          <div className="flex items-center gap-5">
            <div className="grid size-16 place-items-center bg-foreground font-mono text-2xl font-bold text-background">
              {initials}
            </div>
            <div>
              <p className="text-xl font-extrabold">{session.user.name ?? "—"}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{session.user.email}</p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border border-border bg-card p-6">
          <Kicker>Practice stats</Kicker>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat label="Total sessions"    value={`${sessions.length}`} />
            <Stat label="Completed"         value={`${completed.length}`} />
            <Stat label="Avg score"         value={avgScore  ? `${avgScore}`  : "—"} />
            <Stat label="Best score"        value={bestScore ? `${bestScore}` : "—"} />
          </div>
        </section>

        {/* Sign out */}
        <section className="border border-border bg-card p-6">
          <Kicker>Account</Kicker>
          <div className="mt-4">
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button
                type="submit"
                className="border border-destructive/40 px-4 py-2 text-sm font-semibold text-destructive hover:bg-destructive/10 transition-colors"
              >
                Sign out
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-2xl font-extrabold">{value}</p>
      <p className="mt-1 font-mono text-[9px] uppercase text-muted-foreground">{label}</p>
    </div>
  );
}