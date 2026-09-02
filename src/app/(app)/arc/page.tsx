"use client";

import { useState } from "react";
import { useAppStore } from "@/store/app-store";
import { ArcProgress } from "@/components/ArcProgress";
import { Calendar } from "@/components/Calendar";
import { GoalCreationModal } from "@/components/GoalCreationModal";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { generateCalendarDays } from "@/lib/demo-data";
import { formatDate, getArcDay } from "@/lib/utils";
import { CATEGORY_ICONS, DIFFICULTY_LABELS, FOCUS_AREAS } from "@/lib/constants";
import { Plus, Edit, Pause, Trash2 } from "lucide-react";
import { Goal } from "@/types";

export default function ArcPage() {
  const { arc, goals, completions, addGoal, updateGoal, deleteGoal, togglePauseGoal } = useAppStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editGoal, setEditGoal] = useState<Goal | null>(null);

  if (!arc) return null;

  const calendarDays = generateCalendarDays(arc.startDate, arc.durationDays, completions, goals.filter((g) => !g.isPaused).length);
  const currentDay = getArcDay(arc.startDate);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 lg:py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">❄️ {arc.name}</h1>
          <p className="text-arc-muted text-sm">Day {currentDay} / {arc.durationDays}</p>
        </div>
        <Button onClick={() => { setEditGoal(null); setModalOpen(true); }}>
          <Plus size={16} /> Add Goal
        </Button>
      </div>

      <ArcProgress arc={arc} />

      <Card variant="glass">
        <h2 className="font-bold mb-2">Mission</h2>
        <p className="text-arc-muted italic">&ldquo;{arc.mission}&rdquo;</p>
        <div className="flex flex-wrap gap-2 mt-4">
          {arc.focusAreas.map((area) => {
            const focus = FOCUS_AREAS.find((f) => f.id === area);
            return (
              <span key={area} className="px-3 py-1 rounded-full bg-arc-bg border border-arc-border text-sm">
                {focus?.icon} {focus?.label}
              </span>
            );
          })}
        </div>
        <div className="flex gap-6 mt-4 text-sm text-arc-muted">
          <span>Start: {formatDate(arc.startDate)}</span>
          <span>End: {formatDate(arc.endDate)}</span>
        </div>
      </Card>

      <Calendar days={calendarDays} />

      <Card variant="glass">
        <h2 className="font-bold mb-4">All Goals ({goals.length})</h2>
        <div className="space-y-3">
          {goals.map((goal) => (
            <div key={goal.id} className="flex items-center gap-3 p-4 rounded-xl bg-arc-bg border border-arc-border">
              <span className="text-xl">{CATEGORY_ICONS[goal.category]}</span>
              <div className="flex-1">
                <p className="font-medium">{goal.name}</p>
                <p className="text-xs text-arc-muted">
                  {goal.target} · {goal.frequency} · {DIFFICULTY_LABELS[goal.difficulty]} · {goal.xpReward} XP · 🔥 {goal.streak}
                  {goal.isPaused && " · Paused"}
                </p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setEditGoal(goal); setModalOpen(true); }} className="p-2 rounded-lg hover:bg-arc-card"><Edit size={14} /></button>
                <button onClick={() => togglePauseGoal(goal.id)} className="p-2 rounded-lg hover:bg-arc-card"><Pause size={14} /></button>
                <button onClick={() => deleteGoal(goal.id)} className="p-2 rounded-lg hover:bg-arc-danger/20 text-arc-danger"><Trash2 size={14} /></button>
              </div>
            </div>
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
