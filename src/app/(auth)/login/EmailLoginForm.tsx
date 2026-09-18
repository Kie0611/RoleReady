"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export function EmailLoginForm() {
  const router    = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form     = e.currentTarget;
    const email    = (form.elements.namedItem("email")    as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    const result = await signIn("credentials", { email, password, redirect: false });

    if (result?.error) {
      toast.error("Invalid email or password.");
      setLoading(false);
    } else {
      toast.success("Welcome back!");
      router.push("/dashboard");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-semibold">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          className="h-11 w-full border border-input bg-card px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-1"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-semibold">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          placeholder="••••••••"
          className="h-11 w-full border border-input bg-card px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-1"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="h-11 w-full bg-foreground text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}