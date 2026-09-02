"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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

type Scope = "friends" | "group";

export default function LeaderboardPage() {
  const { allUsers, currentUser, dailyBattle, getFriends, groups, getGroupMembers } = useAppStore();
  const [period, setPeriod] = useState<LeaderboardPeriod>("all");
  const [category, setCategory] = useState<LeaderboardCategory>("overall");
  const [scope, setScope] = useState<Scope>("friends");
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");

  useEffect(() => {
    if (scope === "group" && !selectedGroupId && groups[0]) {
      setSelectedGroupId(groups[0].id);
    }
  }, [scope, selectedGroupId, groups]);

  const friends = getFriends();

  const scopedUsers = useMemo(() => {
    if (!currentUser) return [];
    if (scope === "friends") {
      const map = new Map(allUsers.map((u) => [u.id, u]));
      map.set(currentUser.id, currentUser);
      friends.forEach((f) => map.set(f.id, f));
      return Array.from(map.values());
    }
    if (selectedGroupId) return getGroupMembers(selectedGroupId);
    return [];
  }, [scope, allUsers, currentUser, friends, selectedGroupId, getGroupMembers]);

  const getXp = (userId: string) => {
    if (period === "today") {
      return dailyBattle.entries.find((e) => e.userId === userId)?.xpToday ?? 0;
    }
    const user = scopedUsers.find((u) => u.id === userId) ?? allUsers.find((u) => u.id === userId);
    if (category === "consistency") return user?.longestStreak ?? 0;
    return user?.xp ?? 0;
  };

  const sorted = [...scopedUsers]
    .map((u) => ({ user: u, xp: getXp(u.id) }))
    .sort((a, b) => b.xp - a.xp);

  const currentRank = sorted.findIndex((e) => e.user.id === currentUser?.id) + 1;
  const currentEntry = sorted.find((e) => e.user.id === currentUser?.id);
  const leader = sorted[0];
  const selectedGroup = groups.find((g) => g.id === selectedGroupId);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 lg:py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">🏆 Leaderboard</h1>
        <p className="text-arc-muted text-sm">Compete with friends and your groups</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {(
          [
            { id: "friends" as const, label: "Friends" },
            { id: "group" as const, label: "Group" },
          ] as const
        ).map((s) => (
          <button
            key={s.id}
            onClick={() => setScope(s.id)}
            className={`px-4 py-2 rounded-xl text-sm whitespace-nowrap border transition-colors ${
              scope === s.id ? "border-frost-400 bg-frost-400/10" : "border-arc-border text-arc-muted"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {scope === "group" && (
        <div className="space-y-3">
          {groups.length === 0 ? (
            <Card variant="glass" className="text-center py-8">
              <p className="text-arc-muted mb-3">Create a group with friends to unlock this board.</p>
              <Link href="/friends" className="text-frost-300 text-sm hover:underline">
                Go to Friends →
              </Link>
            </Card>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {groups.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGroupId(g.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs border whitespace-nowrap transition-colors ${
                    selectedGroupId === g.id
                      ? "border-frost-400 bg-frost-400/10"
                      : "border-arc-border text-arc-muted"
                  }`}
                >
                  {g.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

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
        {scope === "group" && selectedGroup && (
          <div className="mb-4 flex items-center justify-between gap-2">
            <p className="text-sm text-arc-muted">
              Ranking in <span className="text-white font-medium">{selectedGroup.name}</span>
            </p>
            <Link href={`/groups/${selectedGroup.id}`} className="text-xs text-frost-300 hover:underline">
              View group
            </Link>
          </div>
        )}

        {sorted.length === 0 ? (
          <p className="text-center text-arc-muted py-8">
            {scope === "friends" ? "Add friends to see the leaderboard." : "No one on this board yet."}
          </p>
        ) : (
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
        )}

        {currentUser && currentRank > 0 && (
          <div className="mt-6 pt-4 border-t border-arc-border">
            <p className="font-bold">You are #{currentRank}</p>
            {leader && currentEntry && currentRank > 1 && (
              <p className="text-frost-300 text-sm mt-1">
                You&apos;re {(leader.xp - currentEntry.xp).toLocaleString()}{" "}
                {category === "consistency" ? "days" : "XP"} away from #1
              </p>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
