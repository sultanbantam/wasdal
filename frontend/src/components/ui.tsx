"use client";

import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger" }) {
  const variants = {
    primary: "bg-primary text-white hover:bg-primary/90",
    secondary: "bg-secondary text-white hover:bg-secondary/90",
    ghost: "bg-transparent text-foreground hover:bg-muted",
    danger: "bg-danger text-white hover:bg-danger/90"
  };
  return (
    <button
      className={cn(
        "inline-flex h-9 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium transition disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export function Panel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <section className={cn("rounded-lg border border-border bg-white p-4 shadow-panel dark:bg-[#111827]", className)} {...props} />;
}

export function Badge({ className, children }: HTMLAttributes<HTMLSpanElement> & { children: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium", className)}>
      {children}
    </span>
  );
}

export function SectionTitle({ title, meta, children }: { title: string; meta?: string; children?: ReactNode }) {
  return (
    <div className="mb-3 flex min-w-0 items-center justify-between gap-3">
      <div className="min-w-0">
        <h2 className="truncate text-base font-semibold">{title}</h2>
        {meta ? <p className="mt-1 text-xs text-muted-foreground">{meta}</p> : null}
      </div>
      {children}
    </div>
  );
}

export function ProgressBar({ value, tone = "primary" }: { value: number; tone?: "primary" | "secondary" | "danger" | "warning" | "success" }) {
  const tones = {
    primary: "bg-primary",
    secondary: "bg-secondary",
    danger: "bg-danger",
    warning: "bg-warning",
    success: "bg-success"
  };
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div className={cn("h-full rounded-full", tones[tone])} style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }} />
    </div>
  );
}
