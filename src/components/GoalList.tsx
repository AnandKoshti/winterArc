"use client";

import { useCallback, useMemo } from "react";
import { Goal } from "@/types";
import { GoalCard } from "./GoalCard";
import { useAppStore } from "@/store/app-store";

interface GoalListProps {
  goals: Goal[];
}

export function GoalList({ goals }: GoalListProps) {
  const completeGoal = useAppStore((s) => s.completeGoal);
  const uncompleteGoal = useAppStore((s) => s.uncompleteGoal);
  const isGoalCompletedToday = useAppStore((s) => s.isGoalCompletedToday);

  const activeGoals = useMemo(() => goals.filter((g) => !g.isPaused), [goals]);

  const handleToggle = useCallback(
    (goalId: string, completed: boolean) => {
      if (completed) void uncompleteGoal(goalId);
      else void completeGoal(goalId);
    },
    [completeGoal, uncompleteGoal]
  );

  if (activeGoals.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-arc-muted">What are you working on today?</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activeGoals.map((goal) => {
        const completed = isGoalCompletedToday(goal.id);
        return (
          <GoalCard
            key={goal.id}
            goal={goal}
            completed={completed}
            onToggle={() => handleToggle(goal.id, completed)}
          />
        );
      })}
    </div>
  );
}
