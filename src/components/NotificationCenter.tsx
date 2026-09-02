"use client";

import { useMemo, useState } from "react";
import { Notification } from "@/types";
import { Card } from "./ui/Card";
import { formatRelative } from "@/lib/utils";
import { Bell } from "lucide-react";
import { useAppStore } from "@/store/app-store";

const TYPE_ICONS: Record<Notification["type"], string> = {
  goal: "🎯",
  streak: "🔥",
  leaderboard: "🏆",
  challenge: "⚔️",
  reward: "🎁",
  achievement: "⭐",
};

export function NotificationCenter() {
  const notifications = useAppStore((s) => s.notifications);
  const markNotificationRead = useAppStore((s) => s.markNotificationRead);
  const markAllNotificationsRead = useAppStore((s) => s.markAllNotificationsRead);
  const [open, setOpen] = useState(false);
  const unread = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl hover:bg-arc-card transition-colors"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-arc-danger rounded-full text-[10px] flex items-center justify-center font-bold">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <Card variant="strong" className="absolute right-0 top-full mt-2 w-80 z-50 max-h-96 overflow-y-auto p-0">
            <div className="flex items-center justify-between p-4 border-b border-arc-border">
              <h3 className="font-bold">Notifications</h3>
              {unread > 0 && (
                <button onClick={markAllNotificationsRead} className="text-xs text-frost-400 hover:underline">
                  Mark all read
                </button>
              )}
            </div>
            <div className="divide-y divide-arc-border">
              {notifications.length === 0 ? (
                <p className="p-4 text-sm text-arc-muted">No notifications</p>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => markNotificationRead(n.id)}
                    className={`w-full text-left p-4 hover:bg-arc-card/50 transition-colors ${
                      !n.read ? "bg-frost-400/5" : ""
                    }`}
                  >
                    <div className="flex gap-2">
                      <span>{TYPE_ICONS[n.type]}</span>
                      <div>
                        <p className="text-sm font-medium">{n.title}</p>
                        <p className="text-xs text-arc-muted">{n.message}</p>
                        <p className="text-xs text-arc-muted/60 mt-1">{formatRelative(n.createdAt)}</p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
