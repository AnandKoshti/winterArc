"use client";

import { DailyBattle, User } from "@/types";
import { Card } from "./ui/Card";
import { ProgressBar } from "./ui/ProgressBar";
import { Avatar } from "./ui/Avatar";
import { useEffect, useState } from "react";
import { cn, formatCountdown, getTimeUntilMidnight } from "@/lib/utils";

interface DailyBattleProps {
  battle: DailyBattle;
  users: User[];
  currentUserId?: string;
}

export function DailyBattleWidget({ battle, users, currentUserId }: DailyBattleProps) {
  const [countdown, setCountdown] = useState(getTimeUntilMidnight());
  useEffect(() => {
    const interval = setInterval(() => setCountdown(getTimeUntilMidnight()), 1000);
    return () => clearInterval(interval);
  }, []);

  const sorted = [...battle.entries].sort((a, b) => b.xpToday - a.xpToday);
  const maxXp = sorted[0]?.xpToday || 1;
  const currentRank = sorted.findIndex((e) => e.userId === currentUserId) + 1;
  const leader = sorted[0];
  const leaderUser = users.find((u) => u.id === leader?.userId);

  return (
    <Card variant="glass">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold flex items-center gap-2">⚔️ DAILY BATTLE</h3>
        <div className="text-xs text-arc-muted">
          Ends in {formatCountdown(countdown.hours, countdown.minutes, countdown.seconds)}
        </div>
      </div>

      <div className="space-y-4">
        {sorted.slice(0, 3).map((entry) => {
          const user = users.find((u) => u.id === entry.userId);
          if (!user) return null;
          const isCurrent = entry.userId === currentUserId;
          return (
            <div key={entry.userId} className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Avatar name={user.name} size="sm" />
                <span className={cn("text-sm font-medium flex-1", isCurrent && "text-frost-300")}>
                  {user.name}
                </span>
                <span className="text-sm font-bold">{entry.xpToday} XP</span>
              </div>
              <ProgressBar value={entry.xpToday} max={maxXp} />
            </div>
          );
        })}
      </div>

      {currentRank > 0 && (
        <p className="text-sm text-arc-muted mt-4">
          {currentRank === 1
            ? "Don't give up the lead."
            : `You are #${currentRank}. Time to take the lead.`}
        </p>
      )}

      {leaderUser && currentUserId === leader?.userId && (
        <p className="text-xs text-arc-gold mt-2">
          🏆 Daily Champion · +100 bonus XP · +100 coins
        </p>
      )}
    </Card>
  );
}
