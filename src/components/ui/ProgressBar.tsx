"use client";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  variant?: "ice" | "gold" | "success";
}

export function ProgressBar({ value, max = 100, className, showLabel, variant = "ice" }: ProgressBarProps) {
  const percent = Math.min(100, (value / max) * 100);

  const variants = {
    ice: "gradient-ice",
    gold: "gradient-gold",
    success: "bg-arc-success",
  };

  return (
    <div className={cn("space-y-1", className)}>
      {showLabel && (
        <div className="flex justify-between text-xs text-arc-muted">
          <span>{percent.toFixed(1)}% complete</span>
        </div>
      )}
      <div className="h-2 bg-arc-bg rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-700 ease-out", variants[variant])}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
