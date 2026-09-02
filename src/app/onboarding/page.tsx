"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/app-store";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FOCUS_AREAS, ARC_DURATIONS, suggestRewards } from "@/lib/constants";
import { createDefaultGoal } from "@/lib/game-logic";
import { FocusArea, OnboardingData, Difficulty } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { formatDate, getArcEndDate } from "@/lib/utils";

const STEPS = 6;

export default function OnboardingPage() {
  const router = useRouter();
  const { completeOnboarding, isAuthenticated, onboardingComplete, isLoading, authReady, supabaseMode } = useAppStore();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (supabaseMode && (!authReady || isLoading)) return;
    if (!isAuthenticated) {
      router.replace("/login");
    } else if (onboardingComplete) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, onboardingComplete, isLoading, authReady, supabaseMode, router]);
  const [duration, setDuration] = useState(90);
  const [customDuration, setCustomDuration] = useState("");
  const [focusAreas, setFocusAreas] = useState<FocusArea[]>([]);
  const [mission, setMission] = useState("Become stronger, smarter and more disciplined.");
  const [goals, setGoals] = useState<{ name: string; category: FocusArea; difficulty: Difficulty }[]>([
    { name: "Workout 45 minutes", category: "fitness", difficulty: "hard" },
    { name: "Read 20 pages", category: "reading", difficulty: "medium" },
    { name: "Study 1 hour", category: "learning", difficulty: "hard" },
  ]);
  const [newGoalName, setNewGoalName] = useState("");

  const toggleFocus = (area: FocusArea) => {
    setFocusAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  const addGoal = () => {
    if (!newGoalName.trim()) return;
    setGoals([...goals, { name: newGoalName, category: focusAreas[0] ?? "custom", difficulty: "medium" }]);
    setNewGoalName("");
  };

  const finish = async () => {
    const durationDays = customDuration ? parseInt(customDuration) : duration;
    const data: OnboardingData = {
      durationDays,
      focusAreas: focusAreas.length ? focusAreas : ["fitness", "learning"],
      mission,
      goals: goals.map((g) => createDefaultGoal(g.name, g.category, g.difficulty)),
    };
    setSaving(true);
    setError(null);
    try {
      await completeOnboarding(data);
      router.replace("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save onboarding. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const startDate = new Date().toISOString().split("T")[0];
  const endDate = getArcEndDate(startDate, customDuration ? parseInt(customDuration) : duration);

  return (
    <div className="min-h-dvh flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-xl">
        <div className="flex gap-1 mb-8">
          {Array.from({ length: STEPS }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= step ? "gradient-ice" : "bg-arc-border"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-strong rounded-2xl p-8"
          >
            {step === 0 && (
              <div className="text-center space-y-6">
                <div className="text-5xl">❄️</div>
                <h1 className="text-3xl font-bold">Welcome to your Winter Arc.</h1>
                <p className="text-arc-muted text-lg">
                  For the next 90 days, you&apos;re building the version of yourself you want to become.
                </p>
                <Button size="lg" className="w-full" onClick={() => setStep(1)}>Continue</Button>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Choose your Arc duration</h2>
                <div className="grid grid-cols-3 gap-3">
                  {ARC_DURATIONS.map((d) => (
                    <button
                      key={d}
                      onClick={() => { setDuration(d); setCustomDuration(""); }}
                      className={`py-4 rounded-xl border text-center transition-all ${
                        duration === d && !customDuration
                          ? "border-frost-400 bg-frost-400/10"
                          : "border-arc-border hover:border-arc-muted"
                      }`}
                    >
                      <p className="text-2xl font-bold">{d}</p>
                      <p className="text-xs text-arc-muted">days</p>
                    </button>
                  ))}
                </div>
                <Input
                  label="Custom duration"
                  type="number"
                  placeholder="Enter days"
                  value={customDuration}
                  onChange={(e) => setCustomDuration(e.target.value)}
                />
                <Button className="w-full" onClick={() => setStep(2)}>Continue</Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Choose your focus areas</h2>
                <div className="flex flex-wrap gap-2">
                  {FOCUS_AREAS.map((area) => (
                    <button
                      key={area.id}
                      onClick={() => toggleFocus(area.id)}
                      className={`px-3 py-2 rounded-xl border text-sm transition-all ${
                        focusAreas.includes(area.id)
                          ? "border-frost-400 bg-frost-400/10"
                          : "border-arc-border"
                      }`}
                    >
                      {area.icon} {area.label}
                    </button>
                  ))}
                </div>
                <Button className="w-full" onClick={() => setStep(3)}>Continue</Button>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Create your goals</h2>
                <Input
                  label="Your mission"
                  value={mission}
                  onChange={(e) => setMission(e.target.value)}
                />
                <div className="space-y-2">
                  {goals.map((g, i) => (
                    <div key={i} className="flex items-center gap-2 p-3 rounded-xl bg-arc-bg border border-arc-border">
                      <span>{FOCUS_AREAS.find((a) => a.id === g.category)?.icon ?? "🎯"}</span>
                      <span className="flex-1 text-sm">{g.name}</span>
                      <span className="text-xs text-arc-muted">{suggestRewards(g.difficulty).xp} XP</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a goal..."
                    value={newGoalName}
                    onChange={(e) => setNewGoalName(e.target.value)}
                  />
                  <Button variant="secondary" onClick={addGoal}>Add</Button>
                </div>
                <Button className="w-full" onClick={() => setStep(4)}>Continue</Button>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6 text-center">
                <h2 className="text-2xl font-bold">Invite Friends</h2>
                <p className="text-arc-muted">Your Arc is better with competition.</p>
                <Input placeholder="Enter username to invite" />
                <div className="p-4 rounded-xl bg-arc-bg border border-arc-border text-sm text-arc-muted">
                  Or share: {typeof window !== "undefined" ? window.location.origin : ""}/signup?ref=invite
                </div>
                <div className="flex gap-3">
                  <Button variant="secondary" className="flex-1" onClick={() => setStep(5)}>Skip</Button>
                  <Button className="flex-1" onClick={() => setStep(5)}>Continue</Button>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6 text-center">
                <div className="text-5xl">❄️</div>
                <h2 className="text-3xl font-bold">Your Winter Arc begins now.</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 rounded-xl bg-arc-bg">
                    <p className="text-arc-muted">Start</p>
                    <p className="font-bold">{formatDate(startDate)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-arc-bg">
                    <p className="text-arc-muted">End</p>
                    <p className="font-bold">{formatDate(endDate)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-arc-bg">
                    <p className="text-arc-muted">Goals</p>
                    <p className="font-bold">{goals.length}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-arc-bg">
                    <p className="text-arc-muted">Starting Level</p>
                    <p className="font-bold">Level 1</p>
                  </div>
                </div>
                {error && (
                  <p className="text-sm text-red-400 text-left">{error}</p>
                )}
                <Button size="lg" className="w-full" onClick={finish} disabled={saving}>
                  {saving ? "Saving your Arc..." : "ENTER MY ARC"}
                </Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
