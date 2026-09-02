"use client";

import { User } from "@/types";
import { cn, getInitials } from "@/lib/utils";
import { Avatar } from "./ui/Avatar";

interface LeaderboardRowProps {
  user: User;
  rank: number;
  xp: number;
  isCurrentUser?: boolean;
  showStreak?: boolean;
}

export function LeaderboardRow({ user, rank, xp, isCurrentUser, showStreak = true }: LeaderboardRowProps) {
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl transition-all",
        isCurrentUser ? "glass border border-frost-400/30 bg-frost-400/5" : "hover:bg-arc-card/50"
      )}
    >
      <span className="w-8 text-center font-bold text-lg">
        {rank <= 3 ? medals[rank - 1] : <span className="text-arc-muted text-sm">{rank}</span>}
      </span>
      <Avatar name={user.name} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">
          {user.name}
          {isCurrentUser && <span className="text-frost-300 text-xs ml-1">(You)</span>}
        </p>
        <p className="text-xs text-arc-muted">
          Level {user.level} · {user.title.replace(/^[^\s]+\s/, "")}
        </p>
      </div>
      <div className="text-right">
        <p className="font-bold text-gradient-ice">{xp.toLocaleString()} XP</p>
        {showStreak && <p className="text-xs text-arc-muted">🔥 {user.streak}</p>}
      </div>
    </div>
  );
}
