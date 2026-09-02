"use client";

import { useState } from "react";
import { useAppStore } from "@/store/app-store";
import { ChallengeCard } from "@/components/ChallengeCard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";

export default function ChallengesPage() {
  const { challenges, currentUser, joinChallenge } = useAppStore();
  const [tab, setTab] = useState<"active" | "all">("active");

  const filtered = tab === "active"
    ? challenges.filter((c) => c.isActive)
    : challenges;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 lg:py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Challenges</h1>
          <p className="text-arc-muted text-sm">Start a battle with your friends</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button size="sm" variant={tab === "active" ? "primary" : "secondary"} onClick={() => setTab("active")}>
          Active
        </Button>
        <Button size="sm" variant={tab === "all" ? "primary" : "secondary"} onClick={() => setTab("all")}>
          All
        </Button>
      </div>

      {filtered.length === 0 ? (
        <Card variant="glass" className="text-center py-12">
          <p className="text-arc-muted">Start a battle with your friends.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              isJoined={currentUser ? challenge.participantIds.includes(currentUser.id) : false}
              onJoin={() => joinChallenge(challenge.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
