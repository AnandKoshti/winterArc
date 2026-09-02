"use client";

import { Activity } from "@/types";
import { Card } from "./ui/Card";
import { formatRelative } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";

interface ActivityFeedProps {
  activities: Activity[];
}

const REACTIONS = ["🔥", "😤", "😂", "👑", "💀"];

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const { addReaction, currentUser } = useAppStore();

  return (
    <Card variant="glass">
      <h3 className="font-bold mb-4">Activity Feed</h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="border-b border-arc-border/50 pb-4 last:border-0 last:pb-0">
            <p className="text-sm">{activity.message}</p>
            <p className="text-xs text-arc-muted mt-1">{formatRelative(activity.createdAt)}</p>
            <div className="flex gap-2 mt-2">
              {REACTIONS.map((emoji) => {
                const count = activity.reactions[emoji]?.length ?? 0;
                const reacted = currentUser && activity.reactions[emoji]?.includes(currentUser.id);
                return (
                  <button
                    key={emoji}
                    onClick={() => addReaction(activity.id, emoji)}
                    className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                      reacted
                        ? "border-frost-400/50 bg-frost-400/10"
                        : "border-arc-border hover:border-arc-muted"
                    }`}
                  >
                    {emoji} {count > 0 && count}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
