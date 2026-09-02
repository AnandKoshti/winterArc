"use client";

import { Badge } from "@/types";
import { Card } from "./ui/Card";
import { cn } from "@/lib/utils";

interface BadgeCardProps {
  badge: Badge;
  unlocked: boolean;
  unlockedAt?: string;
}

export function BadgeCard({ badge, unlocked, unlockedAt }: BadgeCardProps) {
  return (
    <Card
      variant="glass"
      className={cn(
        "text-center p-4 transition-all",
        !unlocked && "opacity-50",
        unlocked && "hover:border-arc-gold/30"
      )}
    >
      <div className="text-4xl mb-2">{unlocked ? badge.icon : "???"}</div>
      <p className="font-semibold text-sm">{unlocked ? badge.name : "???"}</p>
      {unlocked ? (
        <p className="text-xs text-arc-muted mt-1">{badge.description}</p>
      ) : (
        <p className="text-xs text-arc-muted mt-1">Keep going to unlock</p>
      )}
    </Card>
  );
}
