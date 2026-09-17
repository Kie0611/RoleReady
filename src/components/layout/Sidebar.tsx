"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Gauge, Plus, FileText, CircleUserRound, Menu, X,
} from "lucide-react";
import Image from "next/image";

const navigation = [
  { label: "Dashboard",      href: "/dashboard",      icon: Gauge },
  { label: "New interview",  href: "/interview/new",  icon: Plus },
  { label: "Sessions",       href: "/sessions",       icon: FileText },
  { label: "Profile",        href: "/profile",        icon: CircleUserRound },
] as const;

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function Sidebar({ initials }: { initials: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 border-r border-border bg-background transition-transform lg:sticky lg:top-0 lg:h-screen lg:w-16 lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col items-center py-4">

          {/* Logo */}
          <div className="flex w-full items-center justify-between px-3 lg:justify-center lg:px-0">
            <Link
              href="/dashboard"
              aria-label="RoleReady dashboard"
              className="grid size-9 place-items-center font-mono text-lg font-bold text-accent-foreground"
            >
            <Image
              src="/icon_no_bg.png"
              alt="RoleReady logo"
              width={35}
              height={35}
            />
            </Link>
            <button
              className="lg:hidden p-2 hover:bg-secondary transition-colors"
              aria-label="Close navigation"
              onClick={() => setOpen(false)}
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Nav items */}
          <nav className="mt-5 flex w-full flex-col gap-1 px-3 lg:items-center lg:px-0">
            {navigation.map((item) => {
              const active =
                pathname === item.href ||
                (item.href === "/sessions" && pathname.startsWith("/sessions/"));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  title={item.label}
                  className={cn(
                    "flex h-10 items-center gap-3 px-3 font-mono text-[11px] uppercase text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground lg:size-10 lg:justify-center lg:px-0",
                    active && "bg-foreground text-background hover:bg-foreground hover:text-background"
                  )}
                >
                  <item.icon className="size-4 shrink-0" />
                  <span className="lg:sr-only">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Avatar */}
          <Link
            href="/profile"
            title="Profile"
            className="mt-auto grid size-9 place-items-center bg-info font-mono text-xs font-bold text-info-foreground"
          >
            {initials}
          </Link>
        </div>
      </aside>

      {/* Mobile overlay */}
      {open && (
        <button
          aria-label="Close navigation overlay"
          className="fixed inset-0 z-30 bg-foreground/25 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile top bar */}
      <div className="flex h-14 items-center justify-between border-b border-border px-4 lg:hidden">
        <button
          aria-label="Open navigation"
          className="p-2 hover:bg-secondary transition-colors"
          onClick={() => setOpen(true)}
        >
          <Menu className="size-4" />
        </button>
        <span className="font-mono text-xs font-bold uppercase">RoleReady</span>
        <Link
          href="/interview/new"
          aria-label="Start interview"
          className="grid size-9 place-items-center bg-accent text-accent-foreground"
        >
          <Plus className="size-4" />
        </Link>
      </div>
    </>
  );
}