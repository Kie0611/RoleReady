import Link from "next/link";

export function PageHeader({ title, eyebrow, action }: {
  title: string;
  eyebrow: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
      <div className="flex flex-wrap items-baseline gap-3">
        <h1 className="text-2xl font-extrabold">{title}</h1>
        <span className="font-mono text-[10px] uppercase text-muted-foreground">{eyebrow}</span>
      </div>
      {action}
    </header>
  );
}

export function Kicker({ children, className = "" }: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={`font-mono text-[10px] uppercase tracking-widest text-muted-foreground ${className}`}>
      {children}
    </p>
  );
}

export function BrandMark() {
  return (
    <Link href="/" className="inline-flex items-center gap-3 font-bold">
      <span className="grid size-9 place-items-center bg-accent font-mono text-lg text-accent-foreground">R</span>
      <span>RoleReady</span>
    </Link>
  );
}

export function ScoreBar({ label, score, feedback }: {
  label: string;
  score: number;
  feedback?: string;
}) {
  const color =
    score >= 80 ? "bg-success" :
    score >= 70 ? "bg-info"    : "bg-accent";
  return (
    <div>
      <div className="flex justify-between text-sm font-semibold">
        <span>{label}</span>
        <span className="font-mono">{score}</span>
      </div>
      <div className="mt-2 h-2 bg-secondary">
        <div className={`h-full origin-left animate-grow ${color}`} style={{ width: `${score}%` }} />
      </div>
      {feedback && <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{feedback}</p>}
    </div>
  );
}