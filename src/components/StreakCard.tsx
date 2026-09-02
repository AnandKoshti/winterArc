"use client";

import { getStreakMultiplier } from "@/lib/constants";
import { User } from "@/types";
import { Card } from "./ui/Card";
import { Flame } from "lucide-react";

interface StreakCardProps {
  user: User;
}

export function StreakCard({ user }: StreakCardProps) {
  const multiplier = getStreakMultiplier(user.streak);

  return (
    <Card variant="glass" className="text-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        <Flame className="text-orange-400" size={24} />
        <span className="text-3xl font-bold">{user.streak}</span>
        <span className="text-sm text-arc-muted self-end mb-1">DAY STREAK</span>
      </div>
      {multiplier > 1 && (
        <p className="text-sm font-semibold text-arc-gold">
          {multiplier}× XP BONUS
        </p>
      )}
      <p className="text-xs text-arc-muted mt-2">
        Longest: {user.longestStreak} days
      </p>
    </Card>
  );
}
