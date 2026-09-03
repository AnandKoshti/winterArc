import { Difficulty, GoalCategory } from "@/types";

export const APP_NAME = "Winter Arc";
export const TAGLINE = "Build yourself. One day at a time.";
export const ALT_TAGLINE = "Your season of becoming.";

export const DIFFICULTY_XP: Record<Difficulty, number> = {
  easy: 25,
  medium: 50,
  hard: 100,
  epic: 200,
};

export const DIFFICULTY_COINS: Record<Difficulty, number> = {
  easy: 10,
  medium: 20,
  hard: 35,
  epic: 50,
};

export const MAX_XP_REWARD = 500;
export const MAX_COIN_REWARD = 200;
export const PERFECT_DAY_XP_BONUS = 100;
export const PERFECT_DAY_COIN_BONUS = 50;
export const DAILY_BATTLE_WIN_XP = 100;
export const DAILY_BATTLE_WIN_COINS = 100;

export const LEVEL_THRESHOLDS = [
  0, 500, 1000, 1750, 2500, 3500, 4750, 6250, 8000, 10000,
  12500, 15500, 19000, 23000, 27500, 32500, 38000, 44000, 50500, 57500,
  65000, 73000, 81500, 90500, 100000,
];

export const LEVEL_TITLES: Record<number, string> = {
  1: "🌱 Beginner",
  2: "🌱 Beginner",
  3: "⚔️ Starter",
  4: "⚔️ Starter",
  5: "🔥 Warrior",
  6: "🔥 Warrior",
  7: "🔥 Warrior",
  8: "💪 Disciplined",
  9: "💪 Disciplined",
  10: "💪 Disciplined",
  11: "💪 Disciplined",
  12: "💎 Elite",
  13: "💎 Elite",
  14: "💎 Elite",
  15: "💎 Elite",
  16: "💎 Elite",
  17: "💎 Elite",
  18: "💎 Elite",
  19: "💎 Elite",
  20: "👑 Winter Beast",
};

export function getTitleForLevel(level: number): string {
  if (level >= 20) return LEVEL_TITLES[20];
  const keys = Object.keys(LEVEL_TITLES).map(Number).sort((a, b) => b - a);
  for (const key of keys) {
    if (level >= key) return LEVEL_TITLES[key];
  }
  return LEVEL_TITLES[1];
}

export function getLevelFromXp(xp: number): number {
  let level = 1;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
      break;
    }
  }
  return level;
}

export function getXpForNextLevel(level: number): number {
  if (level >= LEVEL_THRESHOLDS.length) return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + 10000;
  return LEVEL_THRESHOLDS[level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
}

export function getXpForCurrentLevel(level: number): number {
  return LEVEL_THRESHOLDS[level - 1] ?? 0;
}

export function getStreakMultiplier(streak: number): number {
  if (streak >= 30) return 1.5;
  if (streak >= 15) return 1.4;
  if (streak >= 8) return 1.2;
  if (streak >= 4) return 1.1;
  return 1.0;
}

export const CATEGORY_ICONS: Record<GoalCategory, string> = {
  fitness: "🏋️",
  learning: "📚",
  career: "💼",
  productivity: "⚡",
  reading: "📖",
  sleep: "😴",
  nutrition: "🥗",
  mental: "🧠",
  finance: "💰",
  creativity: "🎨",
  custom: "🎯",
};

export const CATEGORY_LABELS: Record<GoalCategory, string> = {
  fitness: "Fitness",
  learning: "Learning",
  career: "Career",
  productivity: "Productivity",
  reading: "Reading",
  sleep: "Sleep",
  nutrition: "Nutrition",
  mental: "Mental Wellbeing",
  finance: "Finance",
  creativity: "Creativity",
  custom: "Custom",
};

export const FOCUS_AREAS: { id: GoalCategory; label: string; icon: string }[] = [
  { id: "fitness", label: "Fitness", icon: "🏋️" },
  { id: "learning", label: "Learning", icon: "📚" },
  { id: "career", label: "Career", icon: "💼" },
  { id: "productivity", label: "Productivity", icon: "⚡" },
  { id: "reading", label: "Reading", icon: "📖" },
  { id: "sleep", label: "Sleep", icon: "😴" },
  { id: "nutrition", label: "Nutrition", icon: "🥗" },
  { id: "mental", label: "Mental Wellbeing", icon: "🧠" },
  { id: "finance", label: "Finance", icon: "💰" },
  { id: "creativity", label: "Creativity", icon: "🎨" },
  { id: "custom", label: "Custom", icon: "🎯" },
];

export const ARC_DURATIONS = [30, 60, 90] as const;

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
  epic: "Epic",
};

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy: "text-arc-success",
  medium: "text-frost-400",
  hard: "text-arc-gold",
  epic: "text-purple-400",
};

export const MOTIVATIONAL_MESSAGES = {
  streakBroken: "Yesterday didn't define you. Start again today.",
  missedDay: "One bad day doesn't end your Arc. Get back in.",
  keepGoing: "Let's get after it.",
  arcContinues: "Your Arc continues.",
  keepStreak: "Keep the streak alive.",
  gettingStronger: "You're getting stronger.",
  oneMore: "One more goal.",
  perfectDay: "Perfect Day.",
  newBadge: "New badge unlocked.",
};

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/arc", label: "My Arc", icon: "Snowflake" },
  { href: "/goals", label: "Goals", icon: "Target" },
  { href: "/challenges", label: "Challenges", icon: "Swords" },
  { href: "/leaderboard", label: "Leaderboard", icon: "Trophy" },
  { href: "/rewards", label: "Rewards", icon: "Gift" },
  { href: "/friends", label: "Friends", icon: "Users" },
  { href: "/profile", label: "Profile", icon: "User" },
];

export const MOBILE_NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: "Home" },
  { href: "/goals", label: "Goals", icon: "Target" },
  { href: "/battle", label: "Battle", icon: "Swords" },
  { href: "/friends", label: "Friends", icon: "Users" },
  { href: "/leaderboard", label: "Board", icon: "Trophy" },
  { href: "/profile", label: "Profile", icon: "User" },
];

export function suggestRewards(difficulty: Difficulty): { xp: number; coins: number } {
  return {
    xp: DIFFICULTY_XP[difficulty],
    coins: DIFFICULTY_COINS[difficulty],
  };
}

export function clampRewards(xp: number, coins: number): { xp: number; coins: number } {
  return {
    xp: Math.min(Math.max(xp, 10), MAX_XP_REWARD),
    coins: Math.min(Math.max(coins, 5), MAX_COIN_REWARD),
  };
}
