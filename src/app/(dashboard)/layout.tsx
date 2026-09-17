import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/layout/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const initials = session.user?.name
    ? session.user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "??";

  return (
    <div className="min-h-screen bg-background text-foreground lg:flex">
      <Sidebar initials={initials} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}