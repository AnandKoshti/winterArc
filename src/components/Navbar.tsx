"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  LayoutDashboard, Snowflake, Target, Swords, Trophy, Gift, Users, User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, APP_NAME } from "@/lib/constants";
import { NotificationCenter } from "./NotificationCenter";
import { useAppStore } from "@/store/app-store";

const ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  LayoutDashboard, Snowflake, Target, Swords, Trophy, Gift, Users, User,
};

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const currentUser = useAppStore((s) => s.currentUser);

  useEffect(() => {
    NAV_ITEMS.forEach((item) => {
      router.prefetch(item.href);
    });
  }, [router]);

  return (
    <nav className="hidden lg:flex fixed top-0 left-0 right-0 z-40 nav-chrome border-b border-arc-border/50">
      <div className="max-w-7xl mx-auto w-full px-6 h-16 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2" prefetch>
          <Snowflake className="text-frost-300" size={24} />
          <span className="font-bold text-lg tracking-wide">{APP_NAME}</span>
        </Link>

        <div className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = ICONS[item.icon];
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors",
                  active
                    ? "bg-frost-400/10 text-frost-300"
                    : "text-arc-muted hover:text-white hover:bg-arc-card/50"
                )}
              >
                {Icon && <Icon size={16} />}
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <NotificationCenter />
          {currentUser && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-arc-gold">{currentUser.coins.toLocaleString()} 🪙</span>
              <Link href="/profile" prefetch className="font-medium hover:text-frost-300 transition-colors">
                {currentUser.name}
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
