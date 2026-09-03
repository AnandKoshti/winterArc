"use client";

import { useEffect, useMemo, useState } from "react";
import { CompeteEmptyCta } from "@/components/CompeteEmptyCta";
import { useAppStore } from "@/store/app-store";
import { type BattleScope } from "@/components/DailyBattle";
import { Card } from "@/components/ui/Card";
import { formatCountdown, getTimeUntilMidnight } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { DailyBattle } from "@/types";

const BATTLE_SCOPE_KEY = "winter-arc-battle-scope";
const REACTIONS = ["🔥", "😤", "😂", "👑", "💀"];

function readBattleScope(groups: { id: string }[]): BattleScope {
  try {
    const saved = localStorage.getItem(BATTLE_SCOPE_KEY);
    if (saved === "friends") return "friends";
    if (saved?.startsWith("group:")) {
      const id = saved.slice(6);
      if (groups.some((g) => g.id === id)) return saved as BattleScope;
    }
  } catch {
    /* ignore */
  }
  return "friends";
}

export default function BattlePage() {
  const {
    dailyBattle,
    allUsers,
    currentUser,
    addReaction,
    activities,
    groups,
    getFriends,
    getGroupMembers,
  } = useAppStore();
  const [countdown, setCountdown] = useState(getTimeUntilMidnight());
  const [battleScope, setBattleScope] = useState<BattleScope>("friends");

  useEffect(() => {
    const interval = setInterval(() => setCountdown(getTimeUntilMidnight()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setBattleScope(readBattleScope(groups));
  }, [groups]);

  const friends = getFriends();

  const battleParticipantIds = useMemo(() => {
    if (!currentUser) return new Set<string>();
    if (battleScope === "friends") {
      return new Set([currentUser.id, ...friends.map((f) => f.id)]);
    }
    return new Set(getGroupMembers(battleScope.slice(6)).map((u) => u.id));
  }, [battleScope, currentUser, friends, getGroupMembers]);

  const scopedBattle: DailyBattle = useMemo(() => {
    const entries = dailyBattle.entries
      .filter((e) => battleParticipantIds.has(e.userId))
      .sort((a, b) => b.xpToday - a.xpToday)
      .map((e, i) => ({ ...e, rank: i + 1 }));
    return { ...dailyBattle, entries };
  }, [dailyBattle, battleParticipantIds]);

  const usersById = useMemo(() => {
    const map = new Map(allUsers.map((u) => [u.id, u]));
    if (currentUser) map.set(currentUser.id, currentUser);
    friends.forEach((f) => map.set(f.id, f));
    return map;
  }, [allUsers, currentUser, friends]);

  if (!currentUser) return null;

  const sorted = scopedBattle.entries;
  const maxXp = Math.max(sorted[0]?.xpToday || 1, 1);
  const currentRank = sorted.findIndex((e) => e.userId === currentUser.id) + 1;
  const winner = sorted[0];
  const winnerUser = winner ? usersById.get(winner.userId) : undefined;
  const selectedGroup =
    battleScope.startsWith("group:")
      ? groups.find((g) => g.id === battleScope.slice(6))
      : null;

  const selectScope = (scope: BattleScope) => {
    setBattleScope(scope);
    try {
      localStorage.setItem(BATTLE_SCOPE_KEY, scope);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 lg:py-8 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">⚔️ DAILY BATTLE</h1>
        <p className="text-arc-muted mt-1">Compete with friends or your group</p>
        <p className="text-sm text-frost-300 mt-2">
          Battle ends in {formatCountdown(countdown.hours, countdown.minutes, countdown.seconds)}
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 justify-center">
        <button
          type="button"
          onClick={() => selectScope("friends")}
          className={`px-4 py-2 rounded-xl text-sm whitespace-nowrap border transition-colors ${
            battleScope === "friends" ? "border-frost-400 bg-frost-400/10" : "border-arc-border text-arc-muted"
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
              onClick={() => selectScope(value)}
              className={`px-4 py-2 rounded-xl text-sm whitespace-nowrap border transition-colors ${
                battleScope === value ? "border-frost-400 bg-frost-400/10" : "border-arc-border text-arc-muted"
              }`}
            >
              {g.name}
            </button>
          );
        })}
      </div>

      {selectedGroup && (
        <p className="text-center text-sm text-arc-muted">
          Battling in <span className="text-white font-medium">{selectedGroup.name}</span>
        </p>
      )}

      <Card variant="strong">
        {sorted.filter((e) => e.userId !== currentUser.id).length === 0 ? (
          <CompeteEmptyCta
            message={
              battleScope === "friends"
                ? "Add friends or a group to join today's battle."
                : "This group needs more members. Invite friends or join another group."
            }
          />
        ) : (
          <>
            <div className="space-y-5">
              {sorted.map((entry, i) => {
                const user = usersById.get(entry.userId);
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
              ) : currentRank > 0 ? (
                <p className="text-arc-muted">You are #{currentRank}. Time to take the lead.</p>
              ) : null}
            </div>
          </>
        )}
      </Card>

      {winnerUser && sorted.filter((e) => e.userId !== currentUser.id).length > 0 && (
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
