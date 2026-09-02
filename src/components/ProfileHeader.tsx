"use client";

import { User, Arc } from "@/types";
import { Avatar } from "./ui/Avatar";
import { Card } from "./ui/Card";
import { ProgressBar } from "./ui/ProgressBar";
import { getArcDay, getArcProgress } from "@/lib/utils";
import { BADGES } from "@/lib/game-logic";
import { useAppStore } from "@/store/app-store";

interface ProfileHeaderProps {
  user: User;
  arc?: Arc | null;
}

export function ProfileHeader({ user, arc }: ProfileHeaderProps) {
  const { userBadges } = useAppStore();
  const unlockedBadges = userBadges
    .filter((ub) => ub.userId === user.id)
    .map((ub) => BADGES.find((b) => b.id === ub.badgeId))
    .filter(Boolean);

  const arcDay = arc ? getArcDay(arc.startDate) : 0;
  const arcProgress = arc ? getArcProgress(arcDay, arc.durationDays) : 0;
  const completionRate = 89;

  return (
    <div className="space-y-6">
      <Card variant="strong" className="text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-frost-400/5 to-transparent" />
        <div className="relative">
          <Avatar name={user.name} size="xl" className="mx-auto mb-4" />
          <h1 className="text-3xl font-bold tracking-wider">{user.name.toUpperCase()}</h1>
          <p className="text-lg text-gradient-ice mt-1">Level {user.level}</p>
          <p className="text-arc-muted">{user.title}</p>
          <p className="text-2xl font-bold mt-4">{user.xp.toLocaleString()} XP</p>
          <p className="text-arc-gold mt-2">🔥 {user.streak} Day Streak</p>
          {arc && (
            <div className="mt-4">
              <p className="text-sm text-arc-muted">Winter Arc · Day {arcDay} / {arc.durationDays}</p>
              <ProgressBar value={arcProgress} className="mt-2 max-w-xs mx-auto" />
            </div>
          )}
        </div>
      </Card>

      <Card variant="glass">
        <h3 className="font-bold mb-3">Badges</h3>
        <div className="flex flex-wrap gap-2">
          {unlockedBadges.length > 0 ? (
            unlockedBadges.map((badge) => (
              <span key={badge!.id} className="text-2xl" title={badge!.name}>
                {badge!.icon}
              </span>
            ))
          ) : (
            <p className="text-sm text-arc-muted">Your first achievement is waiting.</p>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card variant="glass" className="text-center">
          <p className="text-2xl font-bold">124</p>
          <p className="text-xs text-arc-muted">Goals Completed</p>
        </Card>
        <Card variant="glass" className="text-center">
          <p className="text-2xl font-bold">{completionRate}%</p>
          <p className="text-xs text-arc-muted">Completion Rate</p>
        </Card>
        <Card variant="glass" className="text-center">
          <p className="text-2xl font-bold">{user.longestStreak}</p>
          <p className="text-xs text-arc-muted">Best Streak</p>
        </Card>
        <Card variant="glass" className="text-center">
          <p className="text-2xl font-bold">{user.coins.toLocaleString()}</p>
          <p className="text-xs text-arc-muted">Coins</p>
        </Card>
      </div>
    </div>
  );
}
