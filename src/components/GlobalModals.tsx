"use client";

import dynamic from "next/dynamic";
import { useShallow } from "zustand/react/shallow";
import { useAppStore } from "@/store/app-store";

const LevelUpModal = dynamic(() => import("./LevelUpModal").then((m) => ({ default: m.LevelUpModal })));
const AchievementModal = dynamic(() => import("./AchievementModal").then((m) => ({ default: m.AchievementModal })));
const PerfectDayModal = dynamic(() => import("./PerfectDayModal").then((m) => ({ default: m.PerfectDayModal })));
const MysteryBoxModal = dynamic(() => import("./MysteryBox").then((m) => ({ default: m.MysteryBoxModal })));
const Toast = dynamic(() => import("./ui/Toast").then((m) => ({ default: m.Toast })));

export function GlobalModals() {
  const {
    showLevelUp,
    levelUpInfo,
    dismissLevelUp,
    showAchievement,
    achievementBadge,
    dismissAchievement,
    showPerfectDay,
    dismissPerfectDay,
    showMysteryBox,
    closeMysteryBox,
    completionToast,
    dismissCompletionToast,
  } = useAppStore(
    useShallow((s) => ({
      showLevelUp: s.showLevelUp,
      levelUpInfo: s.levelUpInfo,
      dismissLevelUp: s.dismissLevelUp,
      showAchievement: s.showAchievement,
      achievementBadge: s.achievementBadge,
      dismissAchievement: s.dismissAchievement,
      showPerfectDay: s.showPerfectDay,
      dismissPerfectDay: s.dismissPerfectDay,
      showMysteryBox: s.showMysteryBox,
      closeMysteryBox: s.closeMysteryBox,
      completionToast: s.completionToast,
      dismissCompletionToast: s.dismissCompletionToast,
    }))
  );

  return (
    <>
      {showLevelUp && levelUpInfo && (
        <LevelUpModal open={showLevelUp} info={levelUpInfo} onClose={dismissLevelUp} />
      )}
      {showAchievement && achievementBadge && (
        <AchievementModal open={showAchievement} badge={achievementBadge} onClose={dismissAchievement} />
      )}
      {showPerfectDay && <PerfectDayModal open={showPerfectDay} onClose={dismissPerfectDay} />}
      {showMysteryBox && (
        <MysteryBoxModal open={showMysteryBox} onClose={closeMysteryBox} onClaim={closeMysteryBox} />
      )}
      {completionToast && (
        <Toast
          visible
          message={`+${completionToast.xp} XP`}
          submessage={`+${completionToast.coins} 🪙`}
          type="xp"
          onDismiss={dismissCompletionToast}
        />
      )}
    </>
  );
}
