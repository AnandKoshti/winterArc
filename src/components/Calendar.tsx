"use client";

import { CalendarDay } from "@/types";
import { Card } from "./ui/Card";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Modal } from "./ui/Modal";
import { formatDate } from "@/lib/utils";

interface CalendarProps {
  days: CalendarDay[];
}

const STATUS_COLORS: Record<CalendarDay["status"], string> = {
  perfect: "bg-arc-success",
  partial: "bg-arc-gold",
  low: "bg-arc-danger",
  future: "bg-arc-border/30",
  empty: "bg-arc-border/20",
};

const STATUS_EMOJI: Record<CalendarDay["status"], string> = {
  perfect: "🟢",
  partial: "🟡",
  low: "🔴",
  future: "⚪",
  empty: "⚫",
};

export function Calendar({ days }: CalendarProps) {
  const [selected, setSelected] = useState<CalendarDay | null>(null);

  return (
    <>
      <Card variant="glass">
        <h3 className="font-bold mb-4">Arc Calendar</h3>
        <div className="grid grid-cols-7 gap-1.5">
          {days.map((day) => (
            <button
              key={day.date}
              onClick={() => day.status !== "future" && setSelected(day)}
              className={cn(
                "aspect-square rounded-lg flex items-center justify-center text-xs transition-all",
                STATUS_COLORS[day.status],
                day.status !== "future" && "hover:ring-2 hover:ring-frost-400/30 cursor-pointer",
                day.status === "future" && "cursor-default"
              )}
              title={day.date}
            >
              {new Date(day.date).getDate()}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 mt-4 text-xs text-arc-muted">
          <span>🟢 Perfect</span>
          <span>🟡 Partial</span>
          <span>🔴 Low</span>
          <span>⚪ Future</span>
        </div>
      </Card>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected ? formatDate(selected.date) : ""}>
        {selected && (
          <div className="space-y-3 text-sm">
            <p>Status: {STATUS_EMOJI[selected.status]} {selected.status}</p>
            <p>Goals: {selected.goalsCompleted} / {selected.goalsTotal}</p>
            <p>XP Earned: {selected.xpEarned}</p>
            <p>Coins Earned: {selected.coinsEarned}</p>
          </div>
        )}
      </Modal>
    </>
  );
}
