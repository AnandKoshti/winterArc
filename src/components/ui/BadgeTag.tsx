"use client";

import { cn } from "@/lib/utils";

interface BadgeTagProps {
  children: React.ReactNode;
  variant?: "default" | "gold" | "ice" | "success";
  className?: string;
}

export function BadgeTag({ children, variant = "default", className }: BadgeTagProps) {
  const variants = {
    default: "bg-arc-card border-arc-border text-arc-muted",
    gold: "bg-arc-gold/10 border-arc-gold/30 text-arc-gold",
    ice: "bg-frost-400/10 border-frost-400/30 text-frost-300",
    success: "bg-arc-success/10 border-arc-success/30 text-arc-success",
  };

  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", variants[variant], className)}>
      {children}
    </span>
  );
}
