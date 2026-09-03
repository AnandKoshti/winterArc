"use client";

import Link from "next/link";
import { UserPlus, UsersRound, LogIn } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface CompeteEmptyCtaProps {
  message: string;
  compact?: boolean;
}

export function CompeteEmptyCta({ message, compact = false }: CompeteEmptyCtaProps) {
  return (
    <div className={`text-center ${compact ? "py-4 space-y-3" : "py-8 space-y-4"}`}>
      <p className={`text-arc-muted ${compact ? "text-sm" : ""}`}>{message}</p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Link href="/friends">
          <Button size="sm">
            <UserPlus size={14} /> Add Friends
          </Button>
        </Link>
        <Link href="/friends">
          <Button size="sm" variant="secondary">
            <UsersRound size={14} /> Create Group
          </Button>
        </Link>
        <Link href="/friends">
          <Button size="sm" variant="ghost">
            <LogIn size={14} /> Join Group
          </Button>
        </Link>
      </div>
    </div>
  );
}
