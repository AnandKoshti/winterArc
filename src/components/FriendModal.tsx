"use client";

import { useEffect, useState } from "react";
import { Modal } from "./ui/Modal";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";

interface FriendModalProps {
  open: boolean;
  onClose: () => void;
  onInvite: (username: string) => boolean | Promise<boolean>;
}

export function FriendModal({ open, onClose, onInvite }: FriendModalProps) {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setMessage("");
      setIsError(false);
      setUsername("");
      setLoading(false);
    }
  }, [open]);

  const inviteLink = typeof window !== "undefined"
    ? `${window.location.origin}/signup?ref=winter-arc`
    : "/signup?ref=winter-arc";

  const handleInvite = async () => {
    const target = username.trim().replace(/^@/, "");
    if (!target) return;
    setLoading(true);
    setMessage("");
    setIsError(false);
    try {
      const success = await onInvite(target);
      if (success) {
        setMessage(`Invite sent to @${target}`);
        setIsError(false);
        setUsername("");
      } else {
        setMessage(`Could not invite @${target}. User not found or already friends.`);
        setIsError(true);
      }
    } catch {
      setMessage(`Could not invite @${target}. Please try again.`);
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal open={open} onClose={onClose} title="Invite Friends">
      <div className="space-y-4">
        <p className="text-sm text-arc-muted">Your Arc is better with competition.</p>

        <div className="flex gap-2">
          <Input
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void handleInvite();
              }
            }}
          />
          <Button onClick={handleInvite} disabled={!username.trim()} loading={loading}>
            Send
          </Button>
        </div>

        {message && (
          <div
            className={`rounded-xl px-4 py-3 text-sm border ${
              isError
                ? "bg-arc-danger/10 border-arc-danger/30 text-arc-danger"
                : "bg-arc-success/10 border-arc-success/30 text-arc-success"
            }`}
          >
            {message}
          </div>
        )}

        <div className="border-t border-arc-border pt-4">
          <p className="text-sm text-arc-muted mb-2">Or share invite link</p>
          <div className="flex gap-2">
            <Input value={inviteLink} readOnly className="text-xs" />
            <Button variant="secondary" onClick={copyLink}>
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
