"use client";

import { useState } from "react";
import { Modal } from "./ui/Modal";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { Goal, GoalCategory, Difficulty, GoalFrequency } from "@/types";
import {
  CATEGORY_LABELS,
  FOCUS_AREAS,
  DIFFICULTY_LABELS,
  suggestRewards,
  clampRewards,
} from "@/lib/constants";

interface GoalCreationModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (goal: Omit<Goal, "id" | "userId" | "arcId" | "streak" | "createdAt">) => void;
  editGoal?: Goal | null;
}

export function GoalCreationModal({ open, onClose, onSave, editGoal }: GoalCreationModalProps) {
  const [name, setName] = useState(editGoal?.name ?? "");
  const [category, setCategory] = useState<GoalCategory>(editGoal?.category ?? "fitness");
  const [frequency, setFrequency] = useState<GoalFrequency>(editGoal?.frequency ?? "daily");
  const [target, setTarget] = useState(editGoal?.target ?? "");
  const [difficulty, setDifficulty] = useState<Difficulty>(editGoal?.difficulty ?? "medium");
  const [advanced, setAdvanced] = useState(false);
  const suggested = suggestRewards(difficulty);
  const [xpReward, setXpReward] = useState(editGoal?.xpReward ?? suggested.xp);
  const [coinReward, setCoinReward] = useState(editGoal?.coinReward ?? suggested.coins);

  const handleDifficultyChange = (d: Difficulty) => {
    setDifficulty(d);
    const s = suggestRewards(d);
    setXpReward(s.xp);
    setCoinReward(s.coins);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    const rewards = clampRewards(xpReward, coinReward);
    onSave({
      name: name.trim(),
      category,
      frequency,
      target: target || "1 session",
      difficulty,
      xpReward: rewards.xp,
      coinReward: rewards.coins,
      isPaused: editGoal?.isPaused ?? false,
    });
    onClose();
    setName("");
    setTarget("");
  };

  return (
    <Modal open={open} onClose={onClose} title={editGoal ? "Edit Goal" : "Create Goal"} size="lg">
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        <Input label="Goal Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Workout 45 minutes" />

        <div>
          <label className="block text-sm font-medium text-arc-muted mb-2">Category</label>
          <div className="flex flex-wrap gap-2">
            {FOCUS_AREAS.map((area) => (
              <button
                key={area.id}
                onClick={() => setCategory(area.id)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                  category === area.id
                    ? "border-frost-400 bg-frost-400/10 text-frost-300"
                    : "border-arc-border text-arc-muted hover:border-arc-muted"
                }`}
              >
                {area.icon} {area.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-arc-muted mb-2">Frequency</label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as GoalFrequency)}
            className="w-full px-4 py-3 rounded-xl bg-arc-bg border border-arc-border text-white"
          >
            <option value="daily">Daily</option>
            <option value="weekdays">Weekdays</option>
            <option value="weekends">Weekends</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>

        <Input label="Target" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="45 minutes" />

        <div>
          <label className="block text-sm font-medium text-arc-muted mb-2">Difficulty</label>
          <div className="grid grid-cols-4 gap-2">
            {(Object.keys(DIFFICULTY_LABELS) as Difficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => handleDifficultyChange(d)}
                className={`py-2 rounded-lg text-sm border transition-colors ${
                  difficulty === d
                    ? "border-frost-400 bg-frost-400/10"
                    : "border-arc-border text-arc-muted"
                }`}
              >
                {DIFFICULTY_LABELS[d]}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setAdvanced(!advanced)}
          className="text-sm text-frost-400 hover:underline"
        >
          {advanced ? "Hide" : "Show"} advanced rewards
        </button>

        {advanced && (
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="XP Reward"
              type="number"
              value={xpReward}
              onChange={(e) => setXpReward(Number(e.target.value))}
            />
            <Input
              label="Coin Reward"
              type="number"
              value={coinReward}
              onChange={(e) => setCoinReward(Number(e.target.value))}
            />
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={handleSave}>
            {editGoal ? "Save Changes" : "Create Goal"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
