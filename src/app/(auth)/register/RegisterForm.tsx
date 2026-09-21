"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { signIn } from "next-auth/react";
import { z } from "zod";

const registerSchema = z.object({
  name:     z.string().min(2, "Name must be at least 2 characters"),
  email:    z.email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FieldErrors = Partial<Record<"name" | "email" | "password", string>>;

export function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading]      = useState(false);
  const [fieldErrors, setFieldErrors]  = useState<FieldErrors>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldErrors({});
    setLoading(true);

    const form     = e.currentTarget;
    const name     = (form.elements.namedItem("name")     as HTMLInputElement).value;
    const email    = (form.elements.namedItem("email")    as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    const result = registerSchema.safeParse({ name, email, password });
    if (!result.success) {
      const errors: FieldErrors = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0] as keyof FieldErrors;
        errors[field] = err.message;
      });
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

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

    const signInResult = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (signInResult?.error) {
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
          className={`h-11 w-full border bg-card px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-1 ${
            fieldErrors.name ? "border-destructive" : "border-input"
          }`}
        />
        {fieldErrors.name && (
          <p className="text-xs text-destructive">{fieldErrors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-semibold">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          className={`h-11 w-full border bg-card px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-1 ${
            fieldErrors.email ? "border-destructive" : "border-input"
          }`}
        />
        {fieldErrors.email && (
          <p className="text-xs text-destructive">{fieldErrors.email}</p>
        )}
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
          className={`h-11 w-full border bg-card px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-1 ${
            fieldErrors.password ? "border-destructive" : "border-input"
          }`}
        />
        {fieldErrors.password && (
          <p className="text-xs text-destructive">{fieldErrors.password}</p>
        )}
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