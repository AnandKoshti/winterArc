"use client";

import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { motion } from "framer-motion";
import { LevelUpInfo } from "@/types";

interface LevelUpModalProps {
  open: boolean;
  info: LevelUpInfo | null;
  onClose: () => void;
}

export function LevelUpModal({ open, info, onClose }: LevelUpModalProps) {
  if (!info) return null;

  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.1 }}
          className="text-6xl"
        >
          ❄️
        </motion.div>
        <h2 className="text-2xl font-bold text-gradient-ice">LEVEL UP</h2>
        <p className="text-4xl font-bold">LEVEL {info.newLevel}</p>
        <p className="text-lg text-arc-gold">{info.newTitle.replace(/^[^\s]+\s/, "").toUpperCase()}</p>
        <div className="space-y-1 text-sm text-arc-muted">
          <p>You earned:</p>
          <p className="text-frost-300 font-bold">+{info.bonusXp} XP</p>
          <p className="text-arc-gold font-bold">+{info.bonusCoins} Coins</p>
        </div>
        <p className="text-sm">New title unlocked.</p>
        <Button className="w-full" onClick={onClose}>Continue</Button>
      </div>
    </Modal>
  );
}
