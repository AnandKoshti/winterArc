import {
  Activity,
  Arc,
  Badge,
  Challenge,
  DailyBattle,
  Friendship,
  Goal,
  GoalCompletion,
  Group,
  Notification,
  User,
  UserBadge,
  XPTransaction,
  CoinTransaction,
  CalendarDay,
} from "@/types";
import { getTitleForLevel } from "./constants";
import { getArcEndDate, getTodayString } from "./utils";
import { BADGES } from "./game-logic";

const DEMO_USER_ID = "user-anand";

export const DEMO_USERS: User[] = [
  {
    id: "user-anand",
    name: "Anand",
    username: "anand",
    email: "anand@demo.com",
    xp: 8420,
    coins: 3250,
    level: 8,
    title: getTitleForLevel(8),
    streak: 12,
    longestStreak: 24,
    streakFreezes: 2,
    createdAt: "2026-08-01T00:00:00Z",
  },
  {
    id: "user-rahul",
    name: "Rahul",
    username: "rahul",
    email: "rahul@demo.com",
    xp: 8120,
    coins: 2890,
    level: 8,
    title: getTitleForLevel(8),
    streak: 10,
    longestStreak: 21,
    streakFreezes: 1,
    createdAt: "2026-08-01T00:00:00Z",
  },
  {
    id: "user-jay",
    name: "Jay",
    username: "jay",
    email: "jay@demo.com",
    xp: 7450,
    coins: 2100,
    level: 7,
    title: getTitleForLevel(7),
    streak: 8,
    longestStreak: 18,
    streakFreezes: 0,
    createdAt: "2026-08-05T00:00:00Z",
  },
  {
    id: "user-akash",
    name: "Akash",
    username: "akash",
    email: "akash@demo.com",
    xp: 6920,
    coins: 1950,
    level: 7,
    title: getTitleForLevel(7),
    streak: 6,
    longestStreak: 15,
    streakFreezes: 1,
    createdAt: "2026-08-10T00:00:00Z",
  },
  {
    id: "user-dev",
    name: "Dev",
    username: "dev",
    email: "dev@demo.com",
    xp: 6500,
    coins: 1800,
    level: 6,
    title: getTitleForLevel(6),
    streak: 5,
    longestStreak: 12,
    streakFreezes: 0,
    createdAt: "2026-08-12T00:00:00Z",
  },
  {
    id: "user-priya",
    name: "Priya",
    username: "priya",
    email: "priya@demo.com",
    xp: 5200,
    coins: 1400,
    level: 5,
    title: getTitleForLevel(5),
    streak: 3,
    longestStreak: 9,
    streakFreezes: 0,
    createdAt: "2026-08-18T00:00:00Z",
  },
];

export const DEMO_ARC: Arc = {
  id: "arc-anand-1",
  userId: DEMO_USER_ID,
  name: "Winter Arc 2026",
  mission: "Become stronger, smarter and more disciplined.",
  durationDays: 90,
  startDate: "2026-09-01",
  endDate: getArcEndDate("2026-09-01", 90),
  focusAreas: ["fitness", "learning", "productivity", "reading"],
  isActive: true,
};

export const DEMO_GOALS: Goal[] = [
  {
    id: "goal-1",
    userId: DEMO_USER_ID,
    arcId: "arc-anand-1",
    name: "Workout 45 minutes",
    category: "fitness",
    frequency: "daily",
    target: "45 minutes",
    difficulty: "hard",
    xpReward: 100,
    coinReward: 20,
    isPaused: false,
    streak: 15,
    createdAt: "2026-09-01T00:00:00Z",
  },
  {
    id: "goal-2",
    userId: DEMO_USER_ID,
    arcId: "arc-anand-1",
    name: "Read 20 pages",
    category: "reading",
    frequency: "daily",
    target: "20 pages",
    difficulty: "medium",
    xpReward: 50,
    coinReward: 15,
    isPaused: false,
    streak: 8,
    createdAt: "2026-09-01T00:00:00Z",
  },
  {
    id: "goal-3",
    userId: DEMO_USER_ID,
    arcId: "arc-anand-1",
    name: "Study 1 hour",
    category: "learning",
    frequency: "daily",
    target: "1 hour",
    difficulty: "hard",
    xpReward: 100,
    coinReward: 20,
    isPaused: false,
    streak: 11,
    createdAt: "2026-09-01T00:00:00Z",
  },
  {
    id: "goal-4",
    userId: DEMO_USER_ID,
    arcId: "arc-anand-1",
    name: "Build project 2 hours",
    category: "productivity",
    frequency: "daily",
    target: "2 hours",
    difficulty: "hard",
    xpReward: 100,
    coinReward: 25,
    isPaused: false,
    streak: 9,
    createdAt: "2026-09-01T00:00:00Z",
  },
  {
    id: "goal-5",
    userId: DEMO_USER_ID,
    arcId: "arc-anand-1",
    name: "Sleep before 12 AM",
    category: "sleep",
    frequency: "daily",
    target: "Before midnight",
    difficulty: "medium",
    xpReward: 75,
    coinReward: 15,
    isPaused: false,
    streak: 5,
    createdAt: "2026-09-01T00:00:00Z",
  },
  {
    id: "goal-6",
    userId: DEMO_USER_ID,
    arcId: "arc-anand-1",
    name: "Drink enough water",
    category: "nutrition",
    frequency: "daily",
    target: "8 glasses",
    difficulty: "easy",
    xpReward: 25,
    coinReward: 10,
    isPaused: false,
    streak: 12,
    createdAt: "2026-09-01T00:00:00Z",
  },
];

const today = getTodayString();

export const DEMO_COMPLETIONS: GoalCompletion[] = [
  { id: "comp-1", goalId: "goal-1", userId: DEMO_USER_ID, completedAt: `${today}T07:30:00Z`, xpEarned: 120, coinsEarned: 20, multiplier: 1.2 },
  { id: "comp-2", goalId: "goal-2", userId: DEMO_USER_ID, completedAt: `${today}T09:00:00Z`, xpEarned: 60, coinsEarned: 15, multiplier: 1.2 },
  { id: "comp-3", goalId: "goal-4", userId: DEMO_USER_ID, completedAt: `${today}T14:00:00Z`, xpEarned: 120, coinsEarned: 25, multiplier: 1.2 },
  { id: "comp-4", goalId: "goal-6", userId: DEMO_USER_ID, completedAt: `${today}T16:00:00Z`, xpEarned: 30, coinsEarned: 10, multiplier: 1.2 },
];

export const DEMO_USER_BADGES: UserBadge[] = [
  { id: "ub-1", userId: DEMO_USER_ID, badgeId: "first-step", unlockedAt: "2026-09-01T08:00:00Z" },
  { id: "ub-2", userId: DEMO_USER_ID, badgeId: "7-day-warrior", unlockedAt: "2026-09-08T08:00:00Z" },
  { id: "ub-3", userId: DEMO_USER_ID, badgeId: "10k-club", unlockedAt: "2026-09-15T08:00:00Z" },
];

export const DEMO_FRIENDSHIPS: Friendship[] = [
  { id: "f-1", requesterId: DEMO_USER_ID, addresseeId: "user-rahul", status: "accepted", createdAt: "2026-08-15T00:00:00Z" },
  { id: "f-2", requesterId: "user-jay", addresseeId: DEMO_USER_ID, status: "accepted", createdAt: "2026-08-16T00:00:00Z" },
  { id: "f-3", requesterId: DEMO_USER_ID, addresseeId: "user-akash", status: "accepted", createdAt: "2026-08-20T00:00:00Z" },
  { id: "f-4", requesterId: "user-dev", addresseeId: DEMO_USER_ID, status: "accepted", createdAt: "2026-08-22T00:00:00Z" },
  { id: "f-5", requesterId: "user-rahul", addresseeId: "user-jay", status: "pending", createdAt: "2026-09-01T00:00:00Z" },
  { id: "f-6", requesterId: "user-priya", addresseeId: DEMO_USER_ID, status: "pending", createdAt: "2026-09-02T00:00:00Z" },
];

export const DEMO_GROUPS: Group[] = [
  {
    id: "group-1",
    name: "Winter Warriors",
    description: "Our squad for the season",
    creatorId: DEMO_USER_ID,
    inviteCode: "ARC-WINTER",
    memberIds: [DEMO_USER_ID, "user-rahul", "user-jay", "user-akash"],
    createdAt: "2026-08-20T00:00:00Z",
  },
];

export const DEMO_CHALLENGES: Challenge[] = [
  {
    id: "ch-1",
    name: "7 Day Beast Mode",
    description: "Complete at least 5 goals per day for 7 days straight.",
    type: "7-day",
    duration: 7,
    startDate: "2026-09-01",
    endDate: "2026-09-07",
    creatorId: DEMO_USER_ID,
    participantIds: [DEMO_USER_ID, "user-rahul", "user-jay"],
    goal: "5 goals per day",
    xpPrize: 1000,
    coinPrize: 500,
    badgeReward: "beast-mode",
    isActive: true,
  },
  {
    id: "ch-2",
    name: "XP Battle Week",
    description: "Highest XP earner wins the week.",
    type: "xp-battle",
    duration: 7,
    startDate: "2026-09-01",
    endDate: "2026-09-07",
    creatorId: "user-rahul",
    participantIds: [DEMO_USER_ID, "user-rahul", "user-akash", "user-dev"],
    goal: "Most XP this week",
    xpPrize: 800,
    coinPrize: 400,
    isActive: true,
  },
  {
    id: "ch-3",
    name: "Reading Sprint",
    description: "Read 200 pages this week.",
    type: "reading",
    duration: 7,
    startDate: "2026-08-25",
    endDate: "2026-08-31",
    creatorId: "user-jay",
    participantIds: ["user-jay", "user-akash"],
    goal: "200 pages",
    xpPrize: 500,
    coinPrize: 250,
    isActive: false,
  },
];

export const DEMO_ACTIVITIES: Activity[] = [
  { id: "act-1", userId: "user-rahul", type: "streak", message: "Rahul completed a 14-day streak.", createdAt: "2026-09-02T10:00:00Z", reactions: { "🔥": ["user-anand", "user-jay"] } },
  { id: "act-2", userId: "user-jay", type: "workout", message: "Jay completed 100 workouts.", createdAt: "2026-09-02T08:30:00Z", reactions: { "💪": ["user-anand"] } },
  { id: "act-3", userId: DEMO_USER_ID, type: "battle", message: "Anand won today's battle.", createdAt: "2026-09-01T23:59:00Z", reactions: { "👑": ["user-rahul", "user-jay", "user-dev"] } },
  { id: "act-4", userId: "user-akash", type: "badge", message: "Akash unlocked the 7 Day Warrior badge.", createdAt: "2026-09-01T12:00:00Z", reactions: {} },
  { id: "act-5", userId: "user-dev", type: "level", message: "Dev reached Level 6.", createdAt: "2026-08-31T18:00:00Z", reactions: { "🔥": ["user-anand"] } },
];

export const DEMO_NOTIFICATIONS: Notification[] = [
  { id: "n-1", userId: DEMO_USER_ID, type: "goal", title: "Goal Reminder", message: "Don't forget your workout.", read: false, createdAt: "2026-09-02T07:00:00Z" },
  { id: "n-2", userId: DEMO_USER_ID, type: "streak", title: "Streak Alert", message: "Your 12-day streak is waiting.", read: false, createdAt: "2026-09-02T06:00:00Z" },
  { id: "n-3", userId: DEMO_USER_ID, type: "leaderboard", title: "Leaderboard Update", message: "Rahul just passed you.", read: true, createdAt: "2026-09-01T20:00:00Z" },
  { id: "n-4", userId: DEMO_USER_ID, type: "challenge", title: "Daily Battle", message: "Your Daily Battle has started.", read: true, createdAt: "2026-09-02T00:00:00Z" },
  { id: "n-5", userId: DEMO_USER_ID, type: "achievement", title: "Level Up!", message: "You reached Level 8.", read: true, createdAt: "2026-08-28T15:00:00Z" },
];

export const DEMO_DAILY_BATTLE: DailyBattle = {
  id: "battle-today",
  date: today,
  entries: [
    { userId: DEMO_USER_ID, xpToday: 420, rank: 1 },
    { userId: "user-rahul", xpToday: 350, rank: 2 },
    { userId: "user-jay", xpToday: 290, rank: 3 },
    { userId: "user-akash", xpToday: 180, rank: 4 },
    { userId: "user-dev", xpToday: 150, rank: 5 },
  ],
  ended: false,
};

export const DEMO_XP_TRANSACTIONS: XPTransaction[] = [
  { id: "xp-1", userId: DEMO_USER_ID, amount: 120, reason: "Workout completed", createdAt: `${today}T07:30:00Z` },
  { id: "xp-2", userId: DEMO_USER_ID, amount: 60, reason: "Reading completed", createdAt: `${today}T09:00:00Z` },
  { id: "xp-3", userId: DEMO_USER_ID, amount: 120, reason: "Build project completed", createdAt: `${today}T14:00:00Z` },
  { id: "xp-4", userId: DEMO_USER_ID, amount: 30, reason: "Drink water completed", createdAt: `${today}T16:00:00Z` },
  { id: "xp-5", userId: DEMO_USER_ID, amount: 200, reason: "7-day streak bonus", createdAt: "2026-09-08T00:00:00Z" },
];

export const DEMO_COIN_TRANSACTIONS: CoinTransaction[] = [
  { id: "coin-1", userId: DEMO_USER_ID, amount: 20, reason: "Workout completed", createdAt: `${today}T07:30:00Z` },
  { id: "coin-2", userId: DEMO_USER_ID, amount: 15, reason: "Reading completed", createdAt: `${today}T09:00:00Z` },
  { id: "coin-3", userId: DEMO_USER_ID, amount: 100, reason: "All daily goals completed", createdAt: "2026-09-01T23:00:00Z" },
];

export function generateCalendarDays(startDate: string, durationDays: number, completions: GoalCompletion[], goalsCount: number): CalendarDay[] {
  const days: CalendarDay[] = [];
  const start = new Date(startDate);

  for (let i = 0; i < durationDays; i++) {
    const date = new Date(start);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];
    const dayCompletions = completions.filter((c) => c.completedAt.startsWith(dateStr));
    const completed = dayCompletions.length;
    const isFuture = date > new Date();

    let status: CalendarDay["status"] = "empty";
    if (isFuture) status = "future";
    else if (completed === 0) status = "low";
    else if (completed >= goalsCount) status = "perfect";
    else if (completed >= goalsCount * 0.5) status = "partial";
    else status = "low";

    days.push({
      date: dateStr,
      status,
      goalsCompleted: completed,
      goalsTotal: goalsCount,
      xpEarned: dayCompletions.reduce((s, c) => s + c.xpEarned, 0),
      coinsEarned: dayCompletions.reduce((s, c) => s + c.coinsEarned, 0),
    });
  }

  return days;
}

export function getDemoBadge(id: string): Badge | undefined {
  return BADGES.find((b) => b.id === id);
}

export { DEMO_USER_ID };
