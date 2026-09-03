"use client";

import { memo } from "react";
import { Goal } from "@/types";
import { CATEGORY_ICONS, DIFFICULTY_COLORS, DIFFICULTY_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { BadgeTag } from "./ui/BadgeTag";

interface GoalCardProps {
  goal: Goal;
  completed: boolean;
  onToggle: () => void;
}

export const GoalCard = memo(function GoalCard({ goal, completed, onToggle }: GoalCardProps) {
  return (
    <div
      className={cn(
        "glass rounded-xl p-4 flex items-center gap-3 sm:gap-4 transition-all duration-200",
        completed && "border-arc-success/30 bg-arc-success/5",
        !completed && "hover:border-frost-400/20"
      )}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className={cn(
          "w-11 h-11 sm:w-7 sm:h-7 rounded-xl sm:rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors duration-200 touch-manipulation",
          completed
            ? "bg-arc-success border-arc-success text-arc-bg"
            : "border-arc-border hover:border-frost-400/50"
        )}
        aria-label={completed ? "Mark incomplete" : "Mark complete"}
      >
        {completed && <Check size={18} strokeWidth={3} />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-lg">{CATEGORY_ICONS[goal.category]}</span>
          <p className={cn("font-medium truncate", completed && "line-through text-arc-muted")}>
            {goal.name}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <BadgeTag variant="ice">{goal.xpReward} XP</BadgeTag>
          <BadgeTag variant="gold">+{goal.coinReward} 🪙</BadgeTag>
          <span className={cn("text-xs", DIFFICULTY_COLORS[goal.difficulty])}>
            {DIFFICULTY_LABELS[goal.difficulty]}
          </span>
        </div>
      </div>

      {goal.streak > 0 && (
        <div className="text-right shrink-0">
          <p className="text-xs text-arc-muted">🔥 {goal.streak}</p>
        </div>
      )}
    </div>
  );
});
