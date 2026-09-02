"use client";

import { useState } from "react";
import { useAppStore } from "@/store/app-store";
import { GoalList } from "@/components/GoalList";
import { GoalCreationModal } from "@/components/GoalCreationModal";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus, Pause, Play, Trash2, Edit } from "lucide-react";
import { Goal } from "@/types";
import { CATEGORY_ICONS, DIFFICULTY_LABELS } from "@/lib/constants";

export default function GoalsPage() {
  const { goals, addGoal, updateGoal, deleteGoal, togglePauseGoal } = useAppStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editGoal, setEditGoal] = useState<Goal | null>(null);

  const active = goals.filter((g) => !g.isPaused);
  const paused = goals.filter((g) => g.isPaused);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 lg:py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Goals</h1>
          <p className="text-arc-muted text-sm">Complete today&apos;s goals to earn XP</p>
        </div>
        <Button onClick={() => { setEditGoal(null); setModalOpen(true); }}>
          <Plus size={16} /> Add Goal
        </Button>
      </div>

      <Card variant="glass">
        <h2 className="font-bold mb-4">Active Goals ({active.length})</h2>
        <GoalList goals={goals} />
      </Card>

      {paused.length > 0 && (
        <Card variant="glass">
          <h2 className="font-bold mb-4 text-arc-muted">Paused Goals</h2>
          <div className="space-y-3">
            {paused.map((goal) => (
              <GoalManageRow
                key={goal.id}
                goal={goal}
                onEdit={() => { setEditGoal(goal); setModalOpen(true); }}
                onToggle={() => togglePauseGoal(goal.id)}
                onDelete={() => deleteGoal(goal.id)}
              />
            ))}
          </div>
        </Card>
      )}

      <Card variant="glass">
        <h2 className="font-bold mb-4">Manage All Goals</h2>
        <div className="space-y-3">
          {goals.map((goal) => (
            <GoalManageRow
              key={goal.id}
              goal={goal}
              onEdit={() => { setEditGoal(goal); setModalOpen(true); }}
              onToggle={() => togglePauseGoal(goal.id)}
              onDelete={() => deleteGoal(goal.id)}
            />
          ))}
        </div>
      </Card>

      <GoalCreationModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditGoal(null); }}
        editGoal={editGoal}
        onSave={(data) => {
          if (editGoal) updateGoal(editGoal.id, data);
          else addGoal(data);
        }}
      />
    </div>
  );
}

function GoalManageRow({
  goal,
  onEdit,
  onToggle,
  onDelete,
}: {
  goal: Goal;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-arc-bg border border-arc-border">
      <span>{CATEGORY_ICONS[goal.category]}</span>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{goal.name}</p>
        <p className="text-xs text-arc-muted">
          {goal.xpReward} XP · {goal.coinReward} 🪙 · {DIFFICULTY_LABELS[goal.difficulty]}
          {goal.isPaused && " · Paused"}
        </p>
      </div>
      <div className="flex gap-1">
        <button onClick={onEdit} className="p-2 rounded-lg hover:bg-arc-card text-arc-muted"><Edit size={14} /></button>
        <button onClick={onToggle} className="p-2 rounded-lg hover:bg-arc-card text-arc-muted">
          {goal.isPaused ? <Play size={14} /> : <Pause size={14} />}
        </button>
        <button onClick={onDelete} className="p-2 rounded-lg hover:bg-arc-danger/20 text-arc-danger"><Trash2 size={14} /></button>
      </div>
    </div>
  );
}
