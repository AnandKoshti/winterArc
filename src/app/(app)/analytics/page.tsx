"use client";

import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import dynamic from "next/dynamic";
import { useAppStore } from "@/store/app-store";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { getArcDay, getArcProgress } from "@/lib/utils";

const AnalyticsCharts = dynamic(
  () => import("@/components/charts/AnalyticsCharts").then((m) => ({ default: m.AnalyticsCharts })),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-6">
        <div className="h-48 animate-pulse bg-arc-card rounded-xl" />
        <div className="h-48 animate-pulse bg-arc-card rounded-xl" />
      </div>
    ),
  }
);

const CATEGORY_DATA = [
  { category: "Fitness", rate: 94 },
  { category: "Learning", rate: 85 },
  { category: "Reading", rate: 62 },
  { category: "Productivity", rate: 88 },
  { category: "Sleep", rate: 71 },
];

export default function AnalyticsPage() {
  const { currentUser, arc, goals, completions } = useAppStore(
    useShallow((s) => ({
      currentUser: s.currentUser,
      arc: s.arc,
      goals: s.goals,
      completions: s.completions,
    }))
  );

  const stats = useMemo(() => {
    if (!currentUser || !arc) return null;
    const arcDay = getArcDay(arc.startDate);
    const arcProgress = getArcProgress(arcDay, arc.durationDays);
    const totalGoals = goals.filter((g) => !g.isPaused).length * arcDay;
    return { arcDay, arcProgress, totalGoals, completedGoals: completions.length };
  }, [currentUser, arc, goals, completions]);

  if (!currentUser || !arc || !stats) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 lg:py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-arc-muted text-sm">Track your progress and performance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Arc Completion" value={`${stats.arcProgress.toFixed(0)}%`} />
        <StatCard label="Goals Completed" value={`${stats.completedGoals} / ${stats.totalGoals || 160}`} />
        <StatCard label="XP Earned" value={currentUser.xp.toLocaleString()} />
        <StatCard label="Coins" value={currentUser.coins.toLocaleString()} />
        <StatCard label="Current Streak" value={`${currentUser.streak} days`} />
        <StatCard label="Longest Streak" value={`${currentUser.longestStreak} days`} />
      </div>

      <AnalyticsCharts />

      <Card variant="glass">
        <h2 className="font-bold mb-4">Category Performance</h2>
        <div className="space-y-4">
          {CATEGORY_DATA.map((cat) => (
            <div key={cat.category}>
              <div className="flex justify-between text-sm mb-1">
                <span>{cat.category}</span>
                <span className="text-frost-300">{cat.rate}%</span>
              </div>
              <ProgressBar value={cat.rate} variant={cat.rate >= 80 ? "success" : cat.rate >= 60 ? "gold" : "ice"} />
            </div>
          ))}
        </div>
      </Card>

      <div className="grid sm:grid-cols-2 gap-4">
        <Card variant="glass">
          <h3 className="font-bold text-arc-success mb-2">💪 Strongest Area</h3>
          <p className="text-2xl font-bold">Fitness — 94%</p>
        </Card>
        <Card variant="glass">
          <h3 className="font-bold text-arc-gold mb-2">📚 Needs Improvement</h3>
          <p className="text-2xl font-bold">Reading — 62%</p>
        </Card>
      </div>

      <Card variant="glass" className="text-center">
        <p className="text-lg">
          You&apos;re improving <span className="text-arc-success font-bold">14%</span> compared to last week.
        </p>
        <p className="text-arc-muted text-sm mt-2">You&apos;re becoming more consistent.</p>
      </Card>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card variant="glass" className="text-center !p-4">
      <p className="text-xs text-arc-muted">{label}</p>
      <p className="text-xl font-bold mt-1">{value}</p>
    </Card>
  );
}
