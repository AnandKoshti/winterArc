"use client";

import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { motion } from "framer-motion";

interface PerfectDayModalProps {
  open: boolean;
  onClose: () => void;
}

export function PerfectDayModal({ open, onClose }: PerfectDayModalProps) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          className="text-6xl"
        >
          ❄️
        </motion.div>
        <h2 className="text-2xl font-bold text-gradient-ice">PERFECT DAY</h2>
        <p className="text-3xl font-bold">100% COMPLETE</p>
        <div className="text-sm space-y-1">
          <p className="text-frost-300">+100 bonus XP</p>
          <p className="text-arc-gold">+50 coins</p>
        </div>
        <p className="text-arc-muted text-sm">Keep the streak alive.</p>
        <Button className="w-full" onClick={onClose}>Continue</Button>
      </div>
    </Modal>
  );
}
