"use client";

import { User } from "@/types";
import { Card } from "./ui/Card";
import { LeaderboardRow } from "./LeaderboardRow";

interface LeaderboardProps {
  users: { user: User; xp: number }[];
  currentUserId?: string;
  title?: string;
}

export function Leaderboard({ users, currentUserId, title = "Leaderboard" }: LeaderboardProps) {
  const sorted = [...users].sort((a, b) => b.xp - a.xp);
  const currentRank = sorted.findIndex((u) => u.user.id === currentUserId) + 1;
  const currentEntry = sorted.find((u) => u.user.id === currentUserId);
  const leader = sorted[0];

  return (
    <Card variant="glass">
      <h3 className="font-bold mb-4 flex items-center gap-2">
        🏆 {title}
      </h3>
      <div className="space-y-1">
        {sorted.slice(0, 5).map((entry, i) => (
          <LeaderboardRow
            key={entry.user.id}
            user={entry.user}
            rank={i + 1}
            xp={entry.xp}
            isCurrentUser={entry.user.id === currentUserId}
          />
        ))}
      </div>
      {currentUserId && currentRank > 0 && (
        <div className="mt-4 pt-4 border-t border-arc-border text-sm text-arc-muted">
          <p>You are #{currentRank}</p>
          {leader && currentEntry && currentRank > 1 && (
            <p className="text-frost-300 mt-1">
              You&apos;re {(leader.xp - currentEntry.xp).toLocaleString()} XP away from #1
            </p>
          )}
        </div>
      )}
    </Card>
  );
}
