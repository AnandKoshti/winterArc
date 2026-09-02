import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-arc-muted">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "w-full px-4 py-3 rounded-xl bg-arc-bg border border-arc-border text-white placeholder:text-arc-muted/60",
            "focus:outline-none focus:ring-2 focus:ring-frost-400/30 focus:border-frost-400/50 transition-all",
            error && "border-arc-danger/50",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-arc-danger">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
