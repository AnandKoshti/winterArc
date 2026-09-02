"use client";

import { useAppStore, SHOP_ITEMS } from "@/store/app-store";
import { RewardCard } from "@/components/RewardCard";
import { Card } from "@/components/ui/Card";

export default function RewardsPage() {
  const { currentUser, purchaseReward } = useAppStore();

  if (!currentUser) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 lg:py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">🛒 Winter Shop</h1>
        <p className="text-arc-muted text-sm">Spend coins on boosts, freezes, and rewards</p>
      </div>

      <Card variant="glass" className="flex items-center justify-between">
        <div>
          <p className="text-sm text-arc-muted">Your Balance</p>
          <p className="text-3xl font-bold text-arc-gold">{currentUser.coins.toLocaleString()} 🪙</p>
        </div>
        <div className="text-right text-sm text-arc-muted">
          <p>Streak Freezes: {currentUser.streakFreezes}</p>
          {currentUser.xpBoostUntil && new Date(currentUser.xpBoostUntil) > new Date() && (
            <p className="text-frost-300">2× XP Boost Active</p>
          )}
        </div>
      </Card>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SHOP_ITEMS.map((item) => (
          <RewardCard
            key={item.id}
            reward={item}
            userCoins={currentUser.coins}
            onPurchase={purchaseReward}
          />
        ))}
      </div>
    </div>
  );
}
