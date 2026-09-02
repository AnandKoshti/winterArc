"use client";

import { useState } from "react";
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
  const [copied, setCopied] = useState(false);

  const inviteLink = typeof window !== "undefined"
    ? `${window.location.origin}/signup?ref=winter-arc`
    : "/signup?ref=winter-arc";

  const handleInvite = async () => {
    const success = await onInvite(username);
    setMessage(success ? "Friend request sent!" : "User not found or already friends.");
    if (success) setUsername("");
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
          />
          <Button onClick={handleInvite} disabled={!username.trim()}>Send</Button>
        </div>

        {message && (
          <p className={`text-sm ${message.includes("sent") ? "text-arc-success" : "text-arc-danger"}`}>
            {message}
          </p>
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
