"use client";

import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { motion } from "framer-motion";
import { useState } from "react";
import { getRandomMysteryReward } from "@/lib/game-logic";

interface MysteryBoxModalProps {
  open: boolean;
  onClose: () => void;
  onClaim: () => void;
}

export function MysteryBoxModal({ open, onClose, onClaim }: MysteryBoxModalProps) {
  const [opened, setOpened] = useState(false);
  const [reward] = useState(() => getRandomMysteryReward());

  const handleOpen = () => {
    setOpened(true);
  };

  const handleClaim = () => {
    onClaim();
    setOpened(false);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="text-center space-y-6">
        <h2 className="text-xl font-bold">🎁 MYSTERY REWARD</h2>
        {!opened ? (
          <>
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-7xl cursor-pointer"
              onClick={handleOpen}
            >
              🎁
            </motion.div>
            <p className="text-sm text-arc-muted">Tap to open</p>
            <Button onClick={handleOpen}>Open Box</Button>
          </>
        ) : (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring" }}
              className="text-6xl"
            >
              {reward.icon}
            </motion.div>
            <p className="text-2xl font-bold text-gradient-gold">{reward.label}</p>
            <Button variant="gold" className="w-full" onClick={handleClaim}>
              Claim Reward
            </Button>
          </>
        )}
      </div>
    </Modal>
  );
}
