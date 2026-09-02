"use client";

import { Reward } from "@/types";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { useState } from "react";

interface RewardCardProps {
  reward: Reward;
  userCoins: number;
  onPurchase: (id: string) => void;
}

export function RewardCard({ reward, userCoins, onPurchase }: RewardCardProps) {
  const [confirm, setConfirm] = useState(false);
  const canAfford = userCoins >= reward.price;

  return (
    <Card variant="glass" hover className="flex flex-col">
      <div className="text-4xl mb-3">{reward.icon}</div>
      <h3 className="font-bold">{reward.name}</h3>
      <p className="text-sm text-arc-muted mt-1 flex-1">{reward.description}</p>
      <div className="mt-4 flex items-center justify-between">
        <span className="font-bold text-arc-gold">{reward.price.toLocaleString()} 🪙</span>
        {!confirm ? (
          <Button
            size="sm"
            variant={canAfford ? "gold" : "secondary"}
            disabled={!canAfford}
            onClick={() => setConfirm(true)}
          >
            Buy
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => setConfirm(false)}>Cancel</Button>
            <Button size="sm" variant="gold" onClick={() => { onPurchase(reward.id); setConfirm(false); }}>
              Confirm
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
