"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAppStore } from "@/store/app-store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LeaderboardRow } from "@/components/LeaderboardRow";
import { Avatar } from "@/components/ui/Avatar";
import { ArrowLeft, Copy, LogOut } from "lucide-react";

export default function GroupDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const {
    groups,
    currentUser,
    getGroupMembers,
    getFriends,
    leaveGroup,
    addFriendsToGroup,
  } = useAppStore();
  const [copied, setCopied] = useState(false);
  const [adding, setAdding] = useState(false);

  const group = groups.find((g) => g.id === params.id);
  const members = useMemo(
    () => (group ? getGroupMembers(group.id) : []),
    [group, getGroupMembers]
  );
  const friends = getFriends();
  const addableFriends = friends.filter((f) => group && !group.memberIds.includes(f.id));

  useEffect(() => {
    if (!group && groups.length > 0) {
      router.replace("/friends");
    }
  }, [group, groups.length, router]);

  if (!group || !currentUser) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center text-arc-muted">
        Loading group...
      </div>
    );
  }

  const currentRank = members.findIndex((m) => m.id === currentUser.id) + 1;
  const leader = members[0];
  const isOwner = group.creatorId === currentUser.id;

  const copyCode = () => {
    navigator.clipboard.writeText(group.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 lg:py-8 space-y-6">
      <Link href="/friends" className="inline-flex items-center gap-2 text-sm text-arc-muted hover:text-white">
        <ArrowLeft size={16} /> Back to Friends
      </Link>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">{group.name}</h1>
          <p className="text-arc-muted text-sm mt-1">
            {group.description || "Group leaderboard"} · {group.memberIds.length} members
          </p>
        </div>
        <Button
          size="sm"
          variant="danger"
          onClick={async () => {
            await leaveGroup(group.id);
            router.push("/friends");
          }}
        >
          <LogOut size={14} /> Leave
        </Button>
      </div>

      <Card variant="glass">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-sm text-arc-muted">Invite code</p>
            <p className="font-mono text-lg text-frost-300 tracking-wider">{group.inviteCode}</p>
          </div>
          <Button size="sm" variant="secondary" onClick={copyCode}>
            <Copy size={14} /> {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </Card>

      <Card variant="glass">
        <h2 className="font-bold mb-4">🏆 Group Leaderboard</h2>
        <div className="space-y-1">
          {members.map((user, i) => (
            <LeaderboardRow
              key={user.id}
              user={user}
              rank={i + 1}
              xp={user.xp}
              isCurrentUser={user.id === currentUser.id}
            />
          ))}
        </div>
        {currentRank > 0 && (
          <div className="mt-6 pt-4 border-t border-arc-border">
            <p className="font-bold">You are #{currentRank}</p>
            {leader && currentRank > 1 && (
              <p className="text-frost-300 text-sm mt-1">
                You&apos;re {(leader.xp - (members[currentRank - 1]?.xp ?? 0)).toLocaleString()} XP away from #1
              </p>
            )}
          </div>
        )}
      </Card>

      {isOwner && addableFriends.length > 0 && (
        <Card variant="glass">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold">Add friends</h2>
            <Button
              size="sm"
              loading={adding}
              onClick={async () => {
                setAdding(true);
                await addFriendsToGroup(group.id, addableFriends.map((f) => f.id));
                setAdding(false);
              }}
            >
              Add all
            </Button>
          </div>
          <div className="space-y-2">
            {addableFriends.map((friend) => (
              <div key={friend.id} className="flex items-center gap-3 py-2">
                <Avatar name={friend.name} size="sm" />
                <div className="flex-1">
                  <p className="font-medium">{friend.name}</p>
                  <p className="text-xs text-arc-muted">@{friend.username}</p>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => addFriendsToGroup(group.id, [friend.id])}
                >
                  Add
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
