import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "strong";
  hover?: boolean;
}

export function Card({ className, variant = "default", hover = false, children, ...props }: CardProps) {
  const variants = {
    default: "bg-arc-card border border-arc-border",
    glass: "glass",
    strong: "glass-strong",
  };

  return (
    <div
      className={cn(
        "rounded-2xl p-5",
        variants[variant],
        hover && "transition-all duration-200 hover:border-frost-400/20 hover:shadow-lg hover:shadow-frost-500/5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
