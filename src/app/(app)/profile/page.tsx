"use client";

import { useAppStore } from "@/store/app-store";
import { ProfileHeader } from "@/components/ProfileHeader";
import { BadgeCard } from "@/components/BadgeCard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BADGES } from "@/lib/game-logic";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { currentUser, arc, userBadges, logout, xpTransactions } = useAppStore();
  const router = useRouter();

  if (!currentUser) return null;

  const unlockedIds = userBadges
    .filter((ub) => ub.userId === currentUser.id)
    .map((ub) => ub.badgeId);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 lg:py-8 space-y-6">
      <ProfileHeader user={currentUser} arc={arc} />

      <Card variant="glass">
        <h2 className="font-bold mb-4">All Badges</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {BADGES.map((badge) => (
            <BadgeCard
              key={badge.id}
              badge={badge}
              unlocked={unlockedIds.includes(badge.id)}
            />
          ))}
        </div>
      </Card>

      <Card variant="glass">
        <h2 className="font-bold mb-4">Recent XP History</h2>
        <div className="space-y-3">
          {xpTransactions.slice(0, 8).map((tx) => (
            <div key={tx.id} className="flex items-center justify-between text-sm">
              <span className="text-arc-muted">{tx.reason}</span>
              <span className="text-frost-300 font-medium">+{tx.amount} XP</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={() => router.push("/analytics")}>
          View Analytics
        </Button>
        <Button variant="danger" onClick={handleLogout}>Sign Out</Button>
      </div>
    </div>
  );
}
