"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { signIn } from "next-auth/react";

export function RegisterForm() {
  const router  = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form     = e.currentTarget;
    const name     = (form.elements.namedItem("name")     as HTMLInputElement).value;
    const email    = (form.elements.namedItem("email")    as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    const res = await fetch("/api/register", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      toast.error(data.error ?? "Something went wrong.");
      setLoading(false);
      return;
    }

    toast.success("Account created! Signing you in…");

    // Auto sign in after register
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      toast.error("Account created but couldn't sign in. Please log in manually.");
      router.push("/login");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-semibold">Full name</label>
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder="Juan dela Cruz"
          className="h-11 w-full border border-input bg-card px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-1"
        />
      </div>
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
          minLength={8}
          placeholder="At least 8 characters"
          className="h-11 w-full border border-input bg-card px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-1"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="h-11 w-full bg-foreground text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Creating account…" : "Create account"}
      </button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <a href="/login" className="font-semibold text-foreground underline">
          Sign in
        </a>
      </p>
    </form>
  );
}