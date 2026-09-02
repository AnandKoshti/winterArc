"use client";

import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { motion } from "framer-motion";
import { Badge } from "@/types";

interface AchievementModalProps {
  open: boolean;
  badge: Badge | null;
  onClose: () => void;
}

export function AchievementModal({ open, badge, onClose }: AchievementModalProps) {
  if (!badge) return null;

  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring" }}
          className="text-6xl"
        >
          {badge.icon}
        </motion.div>
        <h2 className="text-xl font-bold text-arc-gold">New Badge Unlocked</h2>
        <p className="text-2xl font-bold">{badge.name}</p>
        <p className="text-sm text-arc-muted">{badge.description}</p>
        <Button className="w-full" variant="gold" onClick={onClose}>Awesome</Button>
      </div>
    </Modal>
  );
}
