"use client";

import { Challenge } from "@/types";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { BadgeTag } from "./ui/BadgeTag";

interface ChallengeCardProps {
  challenge: Challenge;
  isJoined: boolean;
  onJoin: () => void;
}

export function ChallengeCard({ challenge, isJoined, onJoin }: ChallengeCardProps) {
  return (
    <Card variant="glass" hover>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-bold text-lg">🔥 {challenge.name}</h3>
          <p className="text-sm text-arc-muted mt-1">{challenge.description}</p>
        </div>
        {challenge.isActive ? (
          <BadgeTag variant="success">Active</BadgeTag>
        ) : (
          <BadgeTag>Ended</BadgeTag>
        )}
      </div>
      <div className="flex flex-wrap gap-2 mt-4">
        <BadgeTag variant="ice">+{challenge.xpPrize} XP</BadgeTag>
        <BadgeTag variant="gold">+{challenge.coinPrize} 🪙</BadgeTag>
        <BadgeTag>{challenge.participantIds.length} participants</BadgeTag>
      </div>
      <p className="text-xs text-arc-muted mt-3">Goal: {challenge.goal}</p>
      {challenge.isActive && !isJoined && (
        <Button className="mt-4 w-full" size="sm" onClick={onJoin}>
          Join Challenge
        </Button>
      )}
      {isJoined && (
        <p className="mt-4 text-sm text-arc-success font-medium">✓ Joined</p>
      )}
    </Card>
  );
}
