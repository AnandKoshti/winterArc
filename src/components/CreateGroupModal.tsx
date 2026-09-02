"use client";

import { useMemo, useState } from "react";
import { Modal } from "./ui/Modal";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { Avatar } from "./ui/Avatar";
import { User } from "@/types";

interface CreateGroupModalProps {
  open: boolean;
  onClose: () => void;
  friends: User[];
  onCreate: (name: string, description: string, memberIds: string[]) => Promise<boolean>;
}

export function CreateGroupModal({ open, onClose, friends, onCreate }: CreateGroupModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sortedFriends = useMemo(
    () => [...friends].sort((a, b) => a.name.localeCompare(b.name)),
    [friends]
  );

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      setError("Give your group a name.");
      return;
    }
    setLoading(true);
    setError("");
    const ok = await onCreate(name, description, selected);
    setLoading(false);
    if (!ok) {
      setError("Could not create group. Make sure you ran supabase/groups.sql.");
      return;
    }
    setName("");
    setDescription("");
    setSelected([]);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Create Group" size="lg">
      <div className="space-y-4">
        <p className="text-sm text-arc-muted">
          Start a squad with friends and compete on a private leaderboard.
        </p>

        <Input
          placeholder="Group name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={40}
        />
        <Input
          placeholder="Short description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={120}
        />

        <div>
          <p className="text-sm font-medium mb-2">
            Add friends {selected.length > 0 && `(${selected.length})`}
          </p>
          {sortedFriends.length === 0 ? (
            <p className="text-sm text-arc-muted py-4 text-center border border-dashed border-arc-border rounded-xl">
              Add friends first, then invite them into your group.
            </p>
          ) : (
            <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
              {sortedFriends.map((friend) => {
                const isSelected = selected.includes(friend.id);
                return (
                  <button
                    key={friend.id}
                    type="button"
                    onClick={() => toggle(friend.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors text-left ${
                      isSelected
                        ? "border-frost-400 bg-frost-400/10"
                        : "border-arc-border bg-arc-bg hover:border-frost-400/40"
                    }`}
                  >
                    <Avatar name={friend.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{friend.name}</p>
                      <p className="text-xs text-arc-muted truncate">
                        @{friend.username} · {friend.xp.toLocaleString()} XP
                      </p>
                    </div>
                    <span className={`text-xs ${isSelected ? "text-frost-300" : "text-arc-muted"}`}>
                      {isSelected ? "Added" : "Add"}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {error && <p className="text-sm text-arc-danger">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleCreate} loading={loading} disabled={!name.trim()}>
            Create Group
          </Button>
        </div>
      </div>
    </Modal>
  );
}
