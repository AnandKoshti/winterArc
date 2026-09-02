"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useShallow } from "zustand/react/shallow";
import { useAppStore } from "@/store/app-store";
import { ArcProgress } from "@/components/ArcProgress";
import { StreakCard } from "@/components/StreakCard";
import { XPBar } from "@/components/XPBar";
import { GoalList } from "@/components/GoalList";
import { Leaderboard } from "@/components/Leaderboard";
import { DailyBattleWidget } from "@/components/DailyBattle";
import { ActivityFeed } from "@/components/ActivityFeed";
import { Card } from "@/components/ui/Card";

export default function DashboardPage() {
  const {
    currentUser,
    arc,
    goals,
    allUsers,
    activities,
    dailyBattle,
    isGoalCompletedToday,
  } = useAppStore(
    useShallow((s) => ({
      currentUser: s.currentUser,
      arc: s.arc,
      goals: s.goals,
      allUsers: s.allUsers,
      activities: s.activities,
      dailyBattle: s.dailyBattle,
      isGoalCompletedToday: s.isGoalCompletedToday,
    }))
  );

  const activeGoals = useMemo(() => goals.filter((g) => !g.isPaused), [goals]);

  const { completedToday, todayProgress } = useMemo(() => {
    const completed = activeGoals.filter((g) => isGoalCompletedToday(g.id)).length;
    const progress = activeGoals.length > 0 ? Math.round((completed / activeGoals.length) * 100) : 0;
    return { completedToday: completed, todayProgress: progress };
  }, [activeGoals, isGoalCompletedToday]);

  const leaderboardUsers = useMemo(
    () =>
      allUsers.map((u) => ({
        user: u,
        xp:
          u.id === currentUser?.id
            ? currentUser.xp
            : dailyBattle.entries.find((e) => e.userId === u.id)?.xpToday ?? u.xp,
      })),
    [allUsers, currentUser, dailyBattle.entries]
  );

  const recentActivities = useMemo(() => activities.slice(0, 3), [activities]);

  if (!currentUser || !arc) return null;

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
        <DailyBattleWidget battle={dailyBattle} users={allUsers} currentUserId={currentUser.id} />
        <Leaderboard users={leaderboardUsers} currentUserId={currentUser.id} title="Leaderboard" />
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
          <DailyBattleWidget battle={dailyBattle} users={allUsers} currentUserId={currentUser.id} />
          <Leaderboard users={leaderboardUsers} currentUserId={currentUser.id} />
          <Card variant="glass" className="text-center">
            <p className="text-arc-gold font-bold text-lg">{currentUser.coins.toLocaleString()} 🪙</p>
            <p className="text-xs text-arc-muted mt-1">Available coins</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
