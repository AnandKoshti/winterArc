"use client";

import { useState } from "react";
import { useAppStore } from "@/store/app-store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { FriendModal } from "@/components/FriendModal";
import { ActivityFeed } from "@/components/ActivityFeed";
import { UserPlus, UserMinus } from "lucide-react";

export default function FriendsPage() {
  const {
    getFriends,
    getPendingRequests,
    allUsers,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    sendFriendRequest,
    activities,
    currentUser,
  } = useAppStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  const friends = getFriends();
  const pending = getPendingRequests();
  const searchResults = search
    ? allUsers.filter(
        (u) =>
          u.id !== currentUser?.id &&
          (u.username.toLowerCase().includes(search.toLowerCase()) ||
            u.name.toLowerCase().includes(search.toLowerCase()))
      )
    : [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 lg:py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Friends</h1>
          <p className="text-arc-muted text-sm">Your Arc is better with competition</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <UserPlus size={16} /> Invite
        </Button>
      </div>

      <input
        type="text"
        placeholder="Search users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-3 rounded-xl bg-arc-card border border-arc-border text-white placeholder:text-arc-muted"
      />

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
              <Button size="sm" onClick={() => sendFriendRequest(user.username)}>Add</Button>
            </div>
          ))}
        </Card>
      )}

      {pending.length > 0 && (
        <Card variant="glass">
          <h2 className="font-bold mb-3">Pending Requests</h2>
          {pending.map((f) => {
            const user = allUsers.find((u) => u.id === f.requesterId);
            if (!user) return null;
            return (
              <div key={f.id} className="flex items-center gap-3 py-3">
                <Avatar name={user.name} size="sm" />
                <div className="flex-1">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-arc-muted">@{user.username}</p>
                </div>
                <Button size="sm" onClick={() => acceptFriendRequest(f.id)}>Accept</Button>
                <Button size="sm" variant="ghost" onClick={() => rejectFriendRequest(f.id)}>Reject</Button>
              </div>
            );
          })}
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
              const friendship = useAppStore.getState().friendships.find(
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
    </div>
  );
}
