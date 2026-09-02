"use client";

import { useState } from "react";
import { Modal } from "./ui/Modal";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";

interface JoinGroupModalProps {
  open: boolean;
  onClose: () => void;
  onJoin: (inviteCode: string) => Promise<boolean>;
}

export function JoinGroupModal({ open, onClose, onJoin }: JoinGroupModalProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleJoin = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setMessage("");
    const ok = await onJoin(code);
    setLoading(false);
    if (ok) {
      setCode("");
      onClose();
      return;
    }
    setMessage("Invalid invite code. Check with your friend and try again.");
  };

  return (
    <Modal open={open} onClose={onClose} title="Join Group">
      <div className="space-y-4">
        <p className="text-sm text-arc-muted">Enter the invite code shared by your friend.</p>
        <Input
          placeholder="e.g. ARC-WINTER"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
        />
        {message && <p className="text-sm text-arc-danger">{message}</p>}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleJoin} loading={loading} disabled={!code.trim()}>
            Join
          </Button>
        </div>
      </div>
    </Modal>
  );
}
