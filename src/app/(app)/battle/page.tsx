"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/app-store";
import { DailyBattleWidget } from "@/components/DailyBattle";
import { Card } from "@/components/ui/Card";
import { formatCountdown, getTimeUntilMidnight } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { ProgressBar } from "@/components/ui/ProgressBar";

const REACTIONS = ["🔥", "😤", "😂", "👑", "💀"];

export default function BattlePage() {
  const { dailyBattle, allUsers, currentUser, addReaction, activities } = useAppStore();
  const [countdown, setCountdown] = useState(getTimeUntilMidnight());

  useEffect(() => {
    const interval = setInterval(() => setCountdown(getTimeUntilMidnight()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!currentUser) return null;

  const sorted = [...dailyBattle.entries].sort((a, b) => b.xpToday - a.xpToday);
  const maxXp = sorted[0]?.xpToday || 1;
  const currentRank = sorted.findIndex((e) => e.userId === currentUser.id) + 1;
  const winner = sorted[0];
  const winnerUser = allUsers.find((u) => u.id === winner?.userId);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 lg:py-8 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">⚔️ DAILY BATTLE</h1>
        <p className="text-arc-muted mt-1">Today&apos;s competition</p>
        <p className="text-sm text-frost-300 mt-2">
          Battle ends in {formatCountdown(countdown.hours, countdown.minutes, countdown.seconds)}
        </p>
      </div>

      <Card variant="strong">
        <div className="space-y-5">
          {sorted.map((entry, i) => {
            const user = allUsers.find((u) => u.id === entry.userId);
            if (!user) return null;
            const isCurrent = entry.userId === currentUser.id;
            return (
              <div key={entry.userId} className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold w-6">{i + 1}</span>
                  <Avatar name={user.name} size="sm" />
                  <span className={`flex-1 font-medium ${isCurrent ? "text-frost-300" : ""}`}>
                    {user.name}
                  </span>
                  <span className="font-bold text-lg">{entry.xpToday} XP</span>
                </div>
                <ProgressBar value={entry.xpToday} max={maxXp} />
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-arc-border text-center">
          {currentRank === 1 ? (
            <p className="text-arc-gold font-medium">Don&apos;t give up the lead.</p>
          ) : (
            <p className="text-arc-muted">You are #{currentRank}. Time to take the lead.</p>
          )}
        </div>
      </Card>

      {winnerUser && (
        <Card variant="glass" className="text-center">
          <p className="text-sm text-arc-muted">Current Leader</p>
          <p className="text-xl font-bold mt-1">{winnerUser.name}</p>
          <p className="text-arc-gold text-sm mt-2">🏆 Daily Champion · +100 bonus XP · +100 coins</p>
        </Card>
      )}

      <Card variant="glass">
        <h3 className="font-bold mb-3">Reactions</h3>
        <div className="flex gap-3 justify-center">
          {REACTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                const battleActivity = activities.find((a) => a.type === "battle");
                if (battleActivity) addReaction(battleActivity.id, emoji);
              }}
              className="text-2xl p-2 rounded-xl hover:bg-arc-card transition-colors"
            >
              {emoji}
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
