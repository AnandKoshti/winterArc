"use client";

import { useState } from "react";
import { useAppStore } from "@/store/app-store";
import { LeaderboardRow } from "@/components/LeaderboardRow";
import { Card } from "@/components/ui/Card";
import { LeaderboardPeriod, LeaderboardCategory } from "@/types";

const PERIODS: { id: LeaderboardPeriod; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "week", label: "This Week" },
  { id: "month", label: "This Month" },
  { id: "all", label: "All Time" },
];

const CATEGORIES: { id: LeaderboardCategory; label: string }[] = [
  { id: "overall", label: "Overall" },
  { id: "consistency", label: "Consistency" },
  { id: "fitness", label: "Fitness" },
  { id: "learning", label: "Learning" },
  { id: "weekly-battle", label: "Weekly Battle" },
];

export default function LeaderboardPage() {
  const { allUsers, currentUser, dailyBattle } = useAppStore();
  const [period, setPeriod] = useState<LeaderboardPeriod>("all");
  const [category, setCategory] = useState<LeaderboardCategory>("overall");

  const getXp = (userId: string) => {
    if (period === "today") {
      return dailyBattle.entries.find((e) => e.userId === userId)?.xpToday ?? 0;
    }
    const user = allUsers.find((u) => u.id === userId);
    if (category === "consistency") return user?.longestStreak ?? 0;
    return user?.xp ?? 0;
  };

  const sorted = [...allUsers]
    .map((u) => ({ user: u, xp: getXp(u.id) }))
    .sort((a, b) => b.xp - a.xp);

  const currentRank = sorted.findIndex((e) => e.user.id === currentUser?.id) + 1;
  const currentEntry = sorted.find((e) => e.user.id === currentUser?.id);
  const leader = sorted[0];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 lg:py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">🏆 Leaderboard</h1>
        <p className="text-arc-muted text-sm">Compete with friends across categories</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {PERIODS.map((p) => (
          <button
            key={p.id}
            onClick={() => setPeriod(p.id)}
            className={`px-4 py-2 rounded-xl text-sm whitespace-nowrap border transition-colors ${
              period === p.id ? "border-frost-400 bg-frost-400/10" : "border-arc-border text-arc-muted"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${
              category === c.id ? "border-frost-400 bg-frost-400/10" : "border-arc-border text-arc-muted"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <Card variant="glass">
        <div className="space-y-1">
          {sorted.map((entry, i) => (
            <LeaderboardRow
              key={entry.user.id}
              user={entry.user}
              rank={i + 1}
              xp={entry.xp}
              isCurrentUser={entry.user.id === currentUser?.id}
              showStreak={category === "consistency"}
            />
          ))}
        </div>

        {currentUser && currentRank > 0 && (
          <div className="mt-6 pt-4 border-t border-arc-border">
            <p className="font-bold">You are #{currentRank}</p>
            {leader && currentEntry && currentRank > 1 && (
              <p className="text-frost-300 text-sm mt-1">
                You&apos;re {(leader.xp - currentEntry.xp).toLocaleString()} {category === "consistency" ? "days" : "XP"} away from #1
              </p>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
