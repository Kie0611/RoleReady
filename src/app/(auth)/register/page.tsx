import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { RegisterForm } from "./RegisterForm";
import Image from "next/image";

export default async function RegisterPage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <main className="grid min-h-screen lg:grid-cols-[1fr_420px]">

      {/* Left panel */}
      <section className="hidden bg-foreground p-12 text-background lg:flex lg:flex-col">
        <div className="flex items-center gap-3 font-bold">
          <Image
            src="/icon.png"
            alt="RoleReady logo"
            width={35}
            height={35}
          />
          <span>RoleReady</span>
        </div>
        <div className="mt-auto max-w-xl">
          <p className="font-mono text-[10px] uppercase tracking-widest text-accent">
            Start your practice
          </p>
          <p className="mt-4 text-5xl font-extrabold leading-tight">
            Build the habit<br />of being ready.
          </p>
          <p className="mt-5 max-w-md text-background/60">
            Every session sharpens your answers. Create your account and start your first interview today.
          </p>
        </div>
        <p className="mt-auto font-mono text-[10px] uppercase text-background/40">
          RoleReady · Your practice desk
        </p>
      </section>

      {/* Right panel */}
      <section className="flex items-center px-5 py-12 sm:px-10">
        <div className="mx-auto w-full max-w-sm">

          <div className="mb-12 flex items-center gap-3 font-bold lg:hidden">
            <Image
            src="/icon_no_bg.png"
            alt="RoleReady logo"
            width={35}
            height={35}
            />
            <span>RoleReady</span>
          </div>

          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Create account
          </p>
          <h1 className="mt-3 text-3xl font-extrabold">Get started free</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            No credit card needed. Start practicing in seconds.
          </p>

          <div className="mt-8">
            <RegisterForm />
          </div>
        </div>
      </section>
    </main>
  );
}