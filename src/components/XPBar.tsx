"use client";

import { getLevelProgress } from "@/lib/game-logic";
import { User } from "@/types";
import { Card } from "./ui/Card";
import { ProgressBar } from "./ui/ProgressBar";

interface XPBarProps {
  user: User;
}

export function XPBar({ user }: XPBarProps) {
  const { current, needed, percent } = getLevelProgress(user.xp, user.level);

  return (
    <Card variant="glass" className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-arc-muted uppercase tracking-wider">Level {user.level}</p>
          <p className="text-lg font-bold">{user.title.replace(/^[^\s]+\s/, "")}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gradient-ice">{user.xp.toLocaleString()}</p>
          <p className="text-xs text-arc-muted">Total XP</p>
        </div>
      </div>
      <ProgressBar value={percent} showLabel={false} />
      <p className="text-xs text-arc-muted text-center">
        {current.toLocaleString()} / {needed.toLocaleString()} XP to Level {user.level + 1}
      </p>
    </Card>
  );
}
