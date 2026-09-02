"use client";

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ToastProps {
  message: string;
  submessage?: string;
  visible: boolean;
  onDismiss: () => void;
  type?: "success" | "xp" | "coins";
}

export function Toast({ message, submessage, visible, onDismiss, type = "success" }: ToastProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50"
          onAnimationComplete={() => setTimeout(onDismiss, 2500)}
        >
          <div className={cn(
            "glass-strong rounded-2xl px-6 py-4 shadow-2xl text-center min-w-[200px]",
            type === "xp" && "border-frost-400/30",
            type === "coins" && "border-arc-gold/30"
          )}>
            <p className="font-bold text-lg">{message}</p>
            {submessage && <p className="text-sm text-arc-muted mt-1">{submessage}</p>}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
