"use client";

import { DailyBattle, User } from "@/types";
import { Card } from "./ui/Card";
import { ProgressBar } from "./ui/ProgressBar";
import { Avatar } from "./ui/Avatar";
import { useEffect, useState } from "react";
import { cn, formatCountdown, getTimeUntilMidnight } from "@/lib/utils";
import Link from "next/link";

export type BattleScope = "friends" | `group:${string}`;

interface DailyBattleProps {
  battle: DailyBattle;
  users: User[];
  currentUserId?: string;
  scope?: BattleScope;
  onScopeChange?: (scope: BattleScope) => void;
  groups?: { id: string; name: string }[];
  emptyHint?: string;
}

export function DailyBattleWidget({
  battle,
  users,
  currentUserId,
  scope = "friends",
  onScopeChange,
  groups = [],
  emptyHint,
}: DailyBattleProps) {
  const [countdown, setCountdown] = useState(getTimeUntilMidnight());
  useEffect(() => {
    const interval = setInterval(() => setCountdown(getTimeUntilMidnight()), 1000);
    return () => clearInterval(interval);
  }, []);

  const sorted = [...battle.entries].sort((a, b) => b.xpToday - a.xpToday);
  const maxXp = Math.max(sorted[0]?.xpToday || 1, 1);
  const currentRank = sorted.findIndex((e) => e.userId === currentUserId) + 1;
  const leader = sorted[0];
  const leaderUser = users.find((u) => u.id === leader?.userId);
  const selectedGroup = scope.startsWith("group:")
    ? groups.find((g) => g.id === scope.slice(6))
    : null;

  return (
    <Card variant="glass">
      <div className="flex items-center justify-between mb-3 gap-2">
        <h3 className="font-bold flex items-center gap-2">⚔️ DAILY BATTLE</h3>
        <div className="text-xs text-arc-muted whitespace-nowrap">
          Ends in {formatCountdown(countdown.hours, countdown.minutes, countdown.seconds)}
        </div>
      </div>

      {onScopeChange && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
          <button
            type="button"
            onClick={() => onScopeChange("friends")}
            className={`px-3 py-1.5 rounded-lg text-xs border whitespace-nowrap transition-colors ${
              scope === "friends" ? "border-frost-400 bg-frost-400/10" : "border-arc-border text-arc-muted"
            }`}
          >
            Friends
          </button>
          {groups.map((g) => {
            const value = `group:${g.id}` as BattleScope;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => onScopeChange(value)}
                className={`px-3 py-1.5 rounded-lg text-xs border whitespace-nowrap transition-colors ${
                  scope === value ? "border-frost-400 bg-frost-400/10" : "border-arc-border text-arc-muted"
                }`}
              >
                {g.name}
              </button>
            );
          })}
        </div>
      )}

      {selectedGroup && (
        <p className="text-xs text-arc-muted mb-3">
          Battling in <span className="text-white">{selectedGroup.name}</span>
        </p>
      )}

      {sorted.length === 0 ? (
        <div className="text-center py-4 space-y-2">
          <p className="text-sm text-arc-muted">
            {emptyHint ?? "Add friends or join a group to start battling."}
          </p>
          <Link href="/friends" className="text-xs text-frost-300 hover:underline">
            Go to Friends →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.slice(0, 5).map((entry) => {
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
      )}

      {currentRank > 0 && sorted.length > 0 && (
        <p className="text-sm text-arc-muted mt-4">
          {currentRank === 1
            ? "Don't give up the lead."
            : `You are #${currentRank}. Time to take the lead.`}
        </p>
      )}

      {leaderUser && currentUserId === leader?.userId && sorted.length > 0 && (
        <p className="text-xs text-arc-gold mt-2">
          🏆 Daily Champion · +100 bonus XP · +100 coins
        </p>
      )}
    </Card>
  );
}
