"use client";

import { useState } from "react";
import Link from "next/link";
import { useAppStore } from "@/store/app-store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { FriendModal } from "@/components/FriendModal";
import { CreateGroupModal } from "@/components/CreateGroupModal";
import { JoinGroupModal } from "@/components/JoinGroupModal";
import { ActivityFeed } from "@/components/ActivityFeed";
import { UserPlus, UserMinus, UsersRound, LogIn } from "lucide-react";

export default function FriendsPage() {
  const {
    getFriends,
    getPendingRequests,
    getSentRequests,
    allUsers,
    friendships,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    sendFriendRequest,
    createGroup,
    joinGroupByCode,
    activities,
    currentUser,
    groups,
  } = useAppStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [joinGroupOpen, setJoinGroupOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [inviteFeedback, setInviteFeedback] = useState<{ text: string; error?: boolean } | null>(null);
  const [invitingUser, setInvitingUser] = useState<string | null>(null);

  const showInviteFeedback = (text: string, error = false) => {
    setInviteFeedback({ text, error });
    window.setTimeout(() => setInviteFeedback(null), 3000);
  };

  const handleAddFromSearch = async (username: string) => {
    setInvitingUser(username);
    const ok = await sendFriendRequest(username);
    setInvitingUser(null);
    if (ok) showInviteFeedback(`Invite sent to @${username}`);
    else showInviteFeedback(`Could not invite @${username}. Already friends or request pending.`, true);
  };

  const friends = getFriends();
  const pending = getPendingRequests();
  const sent = getSentRequests();
  const relatedIds = new Set(
    friendships
      .filter((f) => f.status === "pending" || f.status === "accepted")
      .flatMap((f) => [f.requesterId, f.addresseeId])
  );
  const searchResults = search
    ? allUsers.filter(
        (u) =>
          u.id !== currentUser?.id &&
          !relatedIds.has(u.id) &&
          (u.username.toLowerCase().includes(search.toLowerCase()) ||
            u.name.toLowerCase().includes(search.toLowerCase()))
      )
    : [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 lg:py-8 space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Friends</h1>
          <p className="text-arc-muted text-sm">Your Arc is better with competition</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <UserPlus size={16} /> Invite
        </Button>
      </div>

      {pending.length > 0 && (
        <Card variant="glass">
          <h2 className="font-bold mb-3">Pending Requests ({pending.length})</h2>
          <div className="space-y-1">
            {pending.map((f) => {
              const user = allUsers.find((u) => u.id === f.requesterId);
              if (!user) return null;
              return (
                <div key={f.id} className="flex items-center gap-3 py-3 border-b border-arc-border last:border-0">
                  <Avatar name={user.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{user.name}</p>
                    <p className="text-xs text-arc-muted">@{user.username} · wants to be friends</p>
                  </div>
                  <Button size="sm" onClick={() => acceptFriendRequest(f.id)}>Accept</Button>
                  <Button size="sm" variant="ghost" onClick={() => rejectFriendRequest(f.id)}>Reject</Button>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {sent.length > 0 && (
        <Card variant="glass">
          <h2 className="font-bold mb-3">Sent Requests ({sent.length})</h2>
          <div className="space-y-1">
            {sent.map((f) => {
              const user = allUsers.find((u) => u.id === f.addresseeId);
              if (!user) return null;
              return (
                <div key={f.id} className="flex items-center gap-3 py-3 border-b border-arc-border last:border-0">
                  <Avatar name={user.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{user.name}</p>
                    <p className="text-xs text-arc-muted">@{user.username} · waiting for response</p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => rejectFriendRequest(f.id)}>Cancel</Button>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <Card variant="glass">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
          <div>
            <h2 className="font-bold flex items-center gap-2">
              <UsersRound size={18} className="text-frost-300" /> Groups
            </h2>
            <p className="text-xs text-arc-muted mt-1">Private squads with their own leaderboard</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => setJoinGroupOpen(true)}>
              <LogIn size={14} /> Join
            </Button>
            <Button size="sm" onClick={() => setCreateGroupOpen(true)}>
              Create
            </Button>
          </div>
        </div>

        {groups.length === 0 ? (
          <p className="text-sm text-arc-muted text-center py-6 border border-dashed border-arc-border rounded-xl">
            No groups yet. Create one with friends or join with an invite code.
          </p>
        ) : (
          <div className="space-y-3">
            {groups.map((group) => {
              const topMembers = group.memberIds
                .map((id) => allUsers.find((u) => u.id === id) ?? (id === currentUser?.id ? currentUser : null))
                .filter(Boolean)
                .sort((a, b) => (b!.xp) - (a!.xp))
                .slice(0, 3);
              return (
                <Link
                  key={group.id}
                  href={`/groups/${group.id}`}
                  className="block p-4 rounded-xl bg-arc-bg border border-arc-border hover:border-frost-400/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{group.name}</p>
                      <p className="text-xs text-arc-muted mt-0.5">
                        {group.memberIds.length} members · code {group.inviteCode}
                      </p>
                      {group.description && (
                        <p className="text-sm text-arc-muted mt-2">{group.description}</p>
                      )}
                    </div>
                    <div className="flex -space-x-2">
                      {topMembers.map((m) => (
                        <Avatar key={m!.id} name={m!.name} size="sm" />
                      ))}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </Card>

      <input
        type="text"
        placeholder="Search users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-3 rounded-xl bg-arc-card border border-arc-border text-white placeholder:text-arc-muted"
      />

      {inviteFeedback && (
        <div
          className={`rounded-xl px-4 py-3 text-sm border ${
            inviteFeedback.error
              ? "bg-arc-danger/10 border-arc-danger/30 text-arc-danger"
              : "bg-arc-success/10 border-arc-success/30 text-arc-success"
          }`}
        >
          {inviteFeedback.text}
        </div>
      )}

      {search && searchResults.length > 0 && (
        <Card variant="glass">
          <h2 className="font-bold mb-3">Search Results</h2>
          {searchResults.map((user) => (
            <div key={user.id} className="flex items-center gap-3 py-3 border-b border-arc-border last:border-0">
              <Avatar name={user.name} size="sm" />
              <div className="flex-1">
                <p className="font-medium">{user.name}</p>
                <p className="text-xs text-arc-muted">@{user.username} · Level {user.level}</p>
              </div>
              <Button
                size="sm"
                loading={invitingUser === user.username}
                onClick={() => handleAddFromSearch(user.username)}
              >
                Add
              </Button>
            </div>
          ))}
        </Card>
      )}

      {friends.length === 0 ? (
        <Card variant="glass" className="text-center py-12">
          <p className="text-arc-muted mb-4">Your Arc is better with competition.</p>
          <Button onClick={() => setModalOpen(true)}>Invite Friends</Button>
        </Card>
      ) : (
        <Card variant="glass">
          <h2 className="font-bold mb-4">Your Friends ({friends.length})</h2>
          <div className="space-y-3">
            {friends.map((friend) => {
              const friendship = friendships.find(
                (f) =>
                  f.status === "accepted" &&
                  ((f.requesterId === currentUser?.id && f.addresseeId === friend.id) ||
                    (f.addresseeId === currentUser?.id && f.requesterId === friend.id))
              );
              return (
                <div key={friend.id} className="flex items-center gap-3 p-3 rounded-xl bg-arc-bg border border-arc-border">
                  <Avatar name={friend.name} size="md" />
                  <div className="flex-1">
                    <p className="font-medium">{friend.name}</p>
                    <p className="text-xs text-arc-muted">
                      Level {friend.level} · {friend.title} · 🔥 {friend.streak} · {friend.xp.toLocaleString()} XP
                    </p>
                  </div>
                  {friendship && (
                    <button
                      onClick={() => removeFriend(friendship.id)}
                      className="p-2 rounded-lg hover:bg-arc-danger/20 text-arc-muted hover:text-arc-danger"
                    >
                      <UserMinus size={16} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <ActivityFeed activities={activities} />

      <FriendModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onInvite={sendFriendRequest}
      />
      <CreateGroupModal
        open={createGroupOpen}
        onClose={() => setCreateGroupOpen(false)}
        friends={friends}
        onCreate={async (name, description, memberIds) => {
          const group = await createGroup(name, description, memberIds);
          return Boolean(group);
        }}
      />
      <JoinGroupModal
        open={joinGroupOpen}
        onClose={() => setJoinGroupOpen(false)}
        onJoin={joinGroupByCode}
      />
    </div>
  );
}
