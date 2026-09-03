"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Home, Target, Swords, Trophy, User, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { MOBILE_NAV_ITEMS } from "@/lib/constants";

const ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  Home,
  Target,
  Swords,
  Trophy,
  User,
  Users,
};

export function MobileNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    MOBILE_NAV_ITEMS.forEach((item) => {
      router.prefetch(item.href);
    });
  }, [router]);

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 nav-chrome border-t border-arc-border/50 safe-area-bottom">
      <div className="flex items-center justify-between h-16 px-1 sm:px-2">
        {MOBILE_NAV_ITEMS.map((item) => {
          const Icon = ICONS[item.icon];
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 px-1 py-1.5 rounded-xl transition-colors min-w-0",
                active ? "text-frost-300" : "text-arc-muted"
              )}
            >
              {Icon && <Icon size={20} />}
              <span className="text-[10px] font-medium truncate max-w-full">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
