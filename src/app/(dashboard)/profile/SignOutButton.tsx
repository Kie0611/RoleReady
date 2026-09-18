"use client";

import { signOut } from "next-auth/react";
import toast from "react-hot-toast";

export function SignOutButton() {
  async function handleSignOut() {
    toast.success("Signing out…");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await signOut({ callbackUrl: "/login" });
  }

  return (
    <button
      onClick={handleSignOut}
      className="border border-destructive/40 px-4 py-2 text-sm font-semibold text-destructive hover:bg-destructive/10 transition-colors"
    >
      Sign out
    </button>
  );
}