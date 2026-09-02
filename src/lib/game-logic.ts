import {
  Badge,
  CompletionResult,
  Goal,
  GoalCompletion,
  LevelUpInfo,
  User,
} from "@/types";
import {
  DAILY_BATTLE_WIN_COINS,
  DAILY_BATTLE_WIN_XP,
  DIFFICULTY_COINS,
  DIFFICULTY_XP,
  getLevelFromXp,
  getStreakMultiplier,
  getTitleForLevel,
  getXpForCurrentLevel,
  getXpForNextLevel,
  PERFECT_DAY_COIN_BONUS,
  PERFECT_DAY_XP_BONUS,
} from "./constants";
import { generateId, getTodayString } from "./utils";

export const BADGES: Badge[] = [
  { id: "first-step", name: "First Step", description: "Complete your first goal", icon: "👣", isHidden: false, requirement: "Complete 1 goal" },
  { id: "7-day-warrior", name: "7 Day Warrior", description: "Maintain a 7-day streak", icon: "🔥", isHidden: false, requirement: "7 day streak" },
  { id: "30-day-warrior", name: "30 Day Warrior", description: "Maintain a 30-day streak", icon: "⚔️", isHidden: false, requirement: "30 day streak" },
  { id: "10k-club", name: "10K Club", description: "Earn 10,000 XP", icon: "💎", isHidden: false, requirement: "10,000 XP" },
  { id: "bookworm", name: "Bookworm", description: "Read for 10 consecutive days", icon: "📚", isHidden: true, requirement: "10 day reading streak" },
  { id: "iron-mind", name: "Iron Mind", description: "Complete 50 workouts", icon: "💪", isHidden: true, requirement: "50 fitness goals" },
  { id: "early-bird", name: "Early Bird", description: "Complete morning goals 7 days in a row", icon: "🌅", isHidden: true, requirement: "7 day morning streak" },
  { id: "winter-beast", name: "Winter Beast", description: "Complete a full 90-day Arc", icon: "👑", isHidden: false, requirement: "Complete 90-day arc" },
  { id: "comeback", name: "Comeback", description: "Return after missing a day", icon: "🔄", isHidden: true, requirement: "Return after break" },
  { id: "perfect-week", name: "Perfect Week", description: "Complete 100% of goals for 7 days", icon: "⭐", isHidden: true, requirement: "7 perfect days" },
  { id: "daily-champion", name: "Daily Champion", description: "Win the Daily Battle", icon: "🏆", isHidden: false, requirement: "Win daily battle" },
  { id: "beast-mode", name: "Beast Mode", description: "Complete the 7 Day Beast Mode challenge", icon: "🔥", isHidden: false, requirement: "Complete beast mode" },
];

export function checkBadgeUnlocks(
  user: User,
  completions: GoalCompletion[],
  goals: Goal[],
  unlockedBadgeIds: string[],
  context: {
    perfectDaysThisWeek?: number;
    arcDays?: number;
    arcDuration?: number;
    returnedAfterBreak?: boolean;
    wonDailyBattle?: boolean;
  } = {}
): Badge[] {
  const newBadges: Badge[] = [];
  const has = (id: string) => unlockedBadgeIds.includes(id) || newBadges.some((b) => b.id === id);

  if (completions.length >= 1 && !has("first-step")) {
    newBadges.push(BADGES.find((b) => b.id === "first-step")!);
  }
  if (user.streak >= 7 && !has("7-day-warrior")) {
    newBadges.push(BADGES.find((b) => b.id === "7-day-warrior")!);
  }
  if (user.streak >= 30 && !has("30-day-warrior")) {
    newBadges.push(BADGES.find((b) => b.id === "30-day-warrior")!);
  }
  if (user.xp >= 10000 && !has("10k-club")) {
    newBadges.push(BADGES.find((b) => b.id === "10k-club")!);
  }

  const readingGoal = goals.find((g) => g.category === "reading");
  if (readingGoal && readingGoal.streak >= 10 && !has("bookworm")) {
    newBadges.push(BADGES.find((b) => b.id === "bookworm")!);
  }

  const fitnessCompletions = completions.filter((c) => {
    const goal = goals.find((g) => g.id === c.goalId);
    return goal?.category === "fitness";
  });
  if (fitnessCompletions.length >= 50 && !has("iron-mind")) {
    newBadges.push(BADGES.find((b) => b.id === "iron-mind")!);
  }

  if (context.perfectDaysThisWeek && context.perfectDaysThisWeek >= 7 && !has("perfect-week")) {
    newBadges.push(BADGES.find((b) => b.id === "perfect-week")!);
  }

  if (context.arcDays && context.arcDuration && context.arcDays >= context.arcDuration && !has("winter-beast")) {
    newBadges.push(BADGES.find((b) => b.id === "winter-beast")!);
  }

  if (context.returnedAfterBreak && !has("comeback")) {
    newBadges.push(BADGES.find((b) => b.id === "comeback")!);
  }

  if (context.wonDailyBattle && !has("daily-champion")) {
    newBadges.push(BADGES.find((b) => b.id === "daily-champion")!);
  }

  return newBadges;
}

export function processGoalCompletion(
  user: User,
  goal: Goal,
  todayCompletions: GoalCompletion[],
  allDailyGoals: Goal[],
  xpBoostActive: boolean
): CompletionResult {
  const today = getTodayString();
  const alreadyCompleted = todayCompletions.some(
    (c) => c.goalId === goal.id && c.completedAt.startsWith(today)
  );

  if (alreadyCompleted) {
    return {
      xpEarned: 0,
      coinsEarned: 0,
      multiplier: 1,
      leveledUp: false,
      newBadges: [],
      perfectDay: false,
      streakUpdated: false,
      newStreak: user.streak,
    };
  }

  const multiplier = getStreakMultiplier(user.streak);
  let xpBoostMultiplier = xpBoostActive ? 2 : 1;
  const baseXp = goal.xpReward;
  const baseCoins = goal.coinReward;
  const xpEarned = Math.round(baseXp * multiplier * xpBoostMultiplier);
  const coinsEarned = baseCoins;

  const newXp = user.xp + xpEarned;
  const oldLevel = user.level;
  const newLevel = getLevelFromXp(newXp);
  const leveledUp = newLevel > oldLevel;

  let levelUpInfo: LevelUpInfo | undefined;
  if (leveledUp) {
    levelUpInfo = {
      newLevel,
      newTitle: getTitleForLevel(newLevel),
      bonusXp: 250,
      bonusCoins: 100,
    };
  }

  const completedTodayCount = todayCompletions.filter((c) =>
    c.completedAt.startsWith(today)
  ).length + 1;
  const activeDailyGoals = allDailyGoals.filter((g) => !g.isPaused);
  const perfectDay = completedTodayCount >= activeDailyGoals.length;

  return {
    xpEarned: leveledUp ? xpEarned + (levelUpInfo?.bonusXp ?? 0) : xpEarned,
    coinsEarned: leveledUp ? coinsEarned + (levelUpInfo?.bonusCoins ?? 0) : coinsEarned,
    multiplier,
    leveledUp,
    levelUpInfo,
    newBadges: [],
    perfectDay,
    streakUpdated: true,
    newStreak: user.streak + 1,
  };
}

export function getPerfectDayBonus(): { xp: number; coins: number } {
  return { xp: PERFECT_DAY_XP_BONUS, coins: PERFECT_DAY_COIN_BONUS };
}

export function getDailyBattleReward(): { xp: number; coins: number } {
  return { xp: DAILY_BATTLE_WIN_XP, coins: DAILY_BATTLE_WIN_COINS };
}

export function createCompletion(
  goalId: string,
  userId: string,
  xpEarned: number,
  coinsEarned: number,
  multiplier: number
): GoalCompletion {
  return {
    id: generateId(),
    goalId,
    userId,
    completedAt: new Date().toISOString(),
    xpEarned,
    coinsEarned,
    multiplier,
  };
}

export function getLevelProgress(xp: number, level: number): { current: number; needed: number; percent: number } {
  const currentLevelXp = getXpForCurrentLevel(level);
  const nextLevelXp = getXpForNextLevel(level);
  const current = xp - currentLevelXp;
  const needed = nextLevelXp - currentLevelXp;
  const percent = needed > 0 ? (current / needed) * 100 : 100;
  return { current, needed, percent };
}

export const SHOP_ITEMS = [
  { id: "streak-freeze", name: "Streak Freeze", description: "Protect your streak for one day", icon: "🧊", price: 500, type: "streak-freeze" as const },
  { id: "xp-boost", name: "2× XP Boost", description: "Double XP for 24 hours", icon: "⚡", price: 750, type: "xp-boost" as const },
  { id: "mystery-box", name: "Mystery Box", description: "Random premium reward", icon: "🎁", price: 1000, type: "mystery-box" as const },
  { id: "rare-badge", name: "Rare Badge", description: "Exclusive achievement badge", icon: "🏅", price: 2000, type: "badge" as const },
  { id: "profile-theme", name: "Custom Profile Theme", description: "Premium profile customization", icon: "🎨", price: 3000, type: "theme" as const },
];

export const MYSTERY_REWARDS = [
  { type: "xp" as const, amount: 100, label: "+100 XP", icon: "✨" },
  { type: "coins" as const, amount: 300, label: "+300 Coins", icon: "🪙" },
  { type: "coins" as const, amount: 500, label: "+500 Coins", icon: "🪙" },
  { type: "xp-boost" as const, label: "2× XP for 24 hours", icon: "⚡" },
  { type: "streak-freeze" as const, label: "Streak Freeze", icon: "🧊" },
  { type: "badge" as const, label: "Rare Badge", icon: "🏅" },
  { type: "cosmetic" as const, label: "Cosmetic Item", icon: "🎨" },
];

export function getRandomMysteryReward() {
  return MYSTERY_REWARDS[Math.floor(Math.random() * MYSTERY_REWARDS.length)];
}

export function createDefaultGoal(
  name: string,
  category: Goal["category"],
  difficulty: Goal["difficulty"] = "medium"
): Omit<Goal, "id" | "userId" | "arcId" | "streak" | "createdAt"> {
  return {
    name,
    category,
    frequency: "daily",
    target: "1 session",
    difficulty,
    xpReward: DIFFICULTY_XP[difficulty],
    coinReward: DIFFICULTY_COINS[difficulty],
    isPaused: false,
  };
}
