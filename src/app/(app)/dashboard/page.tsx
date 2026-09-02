"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useShallow } from "zustand/react/shallow";
import { useAppStore } from "@/store/app-store";
import { ArcProgress } from "@/components/ArcProgress";
import { StreakCard } from "@/components/StreakCard";
import { XPBar } from "@/components/XPBar";
import { GoalList } from "@/components/GoalList";
import { Leaderboard } from "@/components/Leaderboard";
import { DailyBattleWidget, type BattleScope } from "@/components/DailyBattle";
import { ActivityFeed } from "@/components/ActivityFeed";
import { Card } from "@/components/ui/Card";
import { DailyBattle } from "@/types";

const DASHBOARD_BOARD_KEY = "winter-arc-dashboard-board";
const BATTLE_SCOPE_KEY = "winter-arc-battle-scope";

type BoardScope = "friends" | `group:${string}`;

function readScope(key: string, groups: { id: string }[]): BoardScope {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return "friends";
    if (saved === "friends") return "friends";
    if (saved.startsWith("group:")) {
      const id = saved.slice(6);
      if (groups.some((g) => g.id === id)) return saved as BoardScope;
    }
  } catch {
    /* ignore */
  }
  return "friends";
}

function writeScope(key: string, scope: BoardScope) {
  try {
    localStorage.setItem(key, scope);
  } catch {
    /* ignore */
  }
}

export default function DashboardPage() {
  const {
    currentUser,
    arc,
    goals,
    allUsers,
    activities,
    dailyBattle,
    groups,
    getFriends,
    getGroupMembers,
    isGoalCompletedToday,
  } = useAppStore(
    useShallow((s) => ({
      currentUser: s.currentUser,
      arc: s.arc,
      goals: s.goals,
      allUsers: s.allUsers,
      activities: s.activities,
      dailyBattle: s.dailyBattle,
      groups: s.groups,
      getFriends: s.getFriends,
      getGroupMembers: s.getGroupMembers,
      isGoalCompletedToday: s.isGoalCompletedToday,
    }))
  );

  const [boardScope, setBoardScope] = useState<BoardScope>("friends");
  const [battleScope, setBattleScope] = useState<BattleScope>("friends");

  useEffect(() => {
    setBoardScope(readScope(DASHBOARD_BOARD_KEY, groups));
    setBattleScope(readScope(BATTLE_SCOPE_KEY, groups));
  }, [groups]);

  const selectBoard = (scope: BoardScope) => {
    setBoardScope(scope);
    writeScope(DASHBOARD_BOARD_KEY, scope);
  };

  const selectBattle = (scope: BattleScope) => {
    setBattleScope(scope);
    writeScope(BATTLE_SCOPE_KEY, scope);
  };

  const activeGoals = useMemo(() => goals.filter((g) => !g.isPaused), [goals]);

  const { completedToday, todayProgress } = useMemo(() => {
    const completed = activeGoals.filter((g) => isGoalCompletedToday(g.id)).length;
    const progress = activeGoals.length > 0 ? Math.round((completed / activeGoals.length) * 100) : 0;
    return { completedToday: completed, todayProgress: progress };
  }, [activeGoals, isGoalCompletedToday]);

  const friends = getFriends();

  const boardUsers = useMemo(() => {
    if (!currentUser) return [];
    if (boardScope === "friends") {
      const map = new Map<string, (typeof friends)[0]>();
      map.set(currentUser.id, currentUser);
      friends.forEach((f) => map.set(f.id, f));
      return Array.from(map.values());
    }
    return getGroupMembers(boardScope.slice(6));
  }, [boardScope, currentUser, friends, getGroupMembers]);

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

  const battleUsers = useMemo(() => {
    const map = new Map(allUsers.map((u) => [u.id, u]));
    if (currentUser) map.set(currentUser.id, currentUser);
    friends.forEach((f) => map.set(f.id, f));
    groups.forEach((g) => {
      getGroupMembers(g.id).forEach((m) => map.set(m.id, m));
    });
    return Array.from(map.values());
  }, [allUsers, currentUser, friends, groups, getGroupMembers]);

  const selectedGroup = boardScope.startsWith("group:")
    ? groups.find((g) => g.id === boardScope.slice(6))
    : null;

  const leaderboardUsers = useMemo(
    () => boardUsers.map((u) => ({ user: u, xp: u.xp })),
    [boardUsers]
  );

  const boardTitle = selectedGroup ? selectedGroup.name : "Friends Leaderboard";
  const recentActivities = useMemo(() => activities.slice(0, 3), [activities]);

  if (!currentUser || !arc) return null;

  const boardPicker = (
    <div className="flex gap-2 overflow-x-auto pb-1 mb-3">
      <button
        type="button"
        onClick={() => selectBoard("friends")}
        className={`px-3 py-1.5 rounded-lg text-xs border whitespace-nowrap transition-colors ${
          boardScope === "friends" ? "border-frost-400 bg-frost-400/10" : "border-arc-border text-arc-muted"
        }`}
      >
        Friends
      </button>
      {groups.map((g) => {
        const value = `group:${g.id}` as BoardScope;
        return (
          <button
            key={g.id}
            type="button"
            onClick={() => selectBoard(value)}
            className={`px-3 py-1.5 rounded-lg text-xs border whitespace-nowrap transition-colors ${
              boardScope === value ? "border-frost-400 bg-frost-400/10" : "border-arc-border text-arc-muted"
            }`}
          >
            {g.name}
          </button>
        );
      })}
    </div>
  );

  const leaderboardBlock = (
    <div>
      {boardPicker}
      {groups.length === 0 && boardScope === "friends" && (
        <p className="text-xs text-arc-muted mb-2">
          Tip: create a friend group on{" "}
          <Link href="/friends" className="text-frost-300 hover:underline">Friends</Link>
          {" "}to pin a squad board here.
        </p>
      )}
      {selectedGroup && (
        <div className="flex justify-end mb-2">
          <Link href={`/groups/${selectedGroup.id}`} className="text-xs text-frost-300 hover:underline">
            Open group →
          </Link>
        </div>
      )}
      <Leaderboard users={leaderboardUsers} currentUserId={currentUser.id} title={boardTitle} />
    </div>
  );

  const battleBlock = (
    <DailyBattleWidget
      battle={scopedBattle}
      users={battleUsers}
      currentUserId={currentUser.id}
      scope={battleScope}
      onScopeChange={selectBattle}
      groups={groups.map((g) => ({ id: g.id, name: g.name }))}
      emptyHint={
        battleScope === "friends"
          ? "Add friends to compete in today's battle."
          : "This group has no members in the battle yet."
      }
    />
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">
      <div className="lg:hidden space-y-4">
        <ArcProgress arc={arc} />
        <StreakCard user={currentUser} />
        <Card variant="glass">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">Today&apos;s Progress</h2>
            <span className="text-sm text-frost-300">{todayProgress}%</span>
          </div>
          <GoalList goals={goals} />
        </Card>
        <XPBar user={currentUser} />
        {battleBlock}
        {leaderboardBlock}
      </div>

      <div className="hidden lg:grid lg:grid-cols-12 gap-6">
        <div className="col-span-5 space-y-6">
          <Card variant="glass">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-xl">Today&apos;s Progress</h2>
              <span className="text-sm text-arc-muted">
                {completedToday}/{activeGoals.length} · {todayProgress}%
              </span>
            </div>
            <GoalList goals={goals} />
          </Card>
          <ActivityFeed activities={recentActivities} />
        </div>

        <div className="col-span-4 space-y-6">
          <ArcProgress arc={arc} />
          <StreakCard user={currentUser} />
          <XPBar user={currentUser} />
        </div>

        <div className="col-span-3 space-y-6">
          {battleBlock}
          {leaderboardBlock}
          <Card variant="glass" className="text-center">
            <p className="text-arc-gold font-bold text-lg">{currentUser.coins.toLocaleString()} 🪙</p>
            <p className="text-xs text-arc-muted mt-1">Available coins</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
