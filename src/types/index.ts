export type Difficulty = "easy" | "medium" | "hard" | "epic";
export type GoalFrequency = "daily" | "weekdays" | "weekends" | "weekly" | "custom";
export type GoalCategory =
  | "fitness"
  | "learning"
  | "career"
  | "productivity"
  | "reading"
  | "sleep"
  | "nutrition"
  | "mental"
  | "finance"
  | "creativity"
  | "custom";

export type FocusArea = GoalCategory;
export type FriendshipStatus = "pending" | "accepted" | "rejected";
export type ChallengeType = "7-day" | "xp-battle" | "fitness" | "reading" | "custom";
export type LeaderboardPeriod = "today" | "week" | "month" | "all";
export type LeaderboardCategory = "overall" | "consistency" | "fitness" | "learning" | "weekly-battle";
export type NotificationType = "goal" | "streak" | "leaderboard" | "challenge" | "reward" | "achievement" | "friend";
export type CalendarDayStatus = "perfect" | "partial" | "low" | "future" | "empty";
export type ActivityType = "streak" | "workout" | "battle" | "arc" | "badge" | "level" | "goal";

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  xp: number;
  coins: number;
  level: number;
  title: string;
  streak: number;
  longestStreak: number;
  streakFreezes: number;
  xpBoostUntil?: string;
  createdAt: string;
}

export interface Arc {
  id: string;
  userId: string;
  name: string;
  mission: string;
  durationDays: number;
  startDate: string;
  endDate: string;
  focusAreas: FocusArea[];
  isActive: boolean;
}

export interface Goal {
  id: string;
  userId: string;
  arcId: string;
  name: string;
  category: GoalCategory;
  frequency: GoalFrequency;
  customDays?: number[];
  target: string;
  difficulty: Difficulty;
  xpReward: number;
  coinReward: number;
  isPaused: boolean;
  streak: number;
  createdAt: string;
}

export interface GoalCompletion {
  id: string;
  goalId: string;
  userId: string;
  completedAt: string;
  xpEarned: number;
  coinsEarned: number;
  multiplier: number;
}

export interface XPTransaction {
  id: string;
  userId: string;
  amount: number;
  reason: string;
  createdAt: string;
}

export interface CoinTransaction {
  id: string;
  userId: string;
  amount: number;
  reason: string;
  createdAt: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  isHidden: boolean;
  requirement: string;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  unlockedAt: string;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  type: ChallengeType;
  duration: number;
  startDate: string;
  endDate: string;
  creatorId: string;
  participantIds: string[];
  goal: string;
  xpPrize: number;
  coinPrize: number;
  badgeReward?: string;
  isActive: boolean;
}

export interface Friendship {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: FriendshipStatus;
  createdAt: string;
}

export type GroupMemberRole = "owner" | "member";

export interface GroupMember {
  groupId: string;
  userId: string;
  role: GroupMemberRole;
  joinedAt: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  creatorId: string;
  inviteCode: string;
  memberIds: string[];
  createdAt: string;
}

export interface Activity {
  id: string;
  userId: string;
  type: ActivityType;
  message: string;
  createdAt: string;
  reactions: Record<string, string[]>;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  icon: string;
  price: number;
  type: "streak-freeze" | "xp-boost" | "mystery-box" | "badge" | "theme";
}

export interface RewardPurchase {
  id: string;
  userId: string;
  rewardId: string;
  purchasedAt: string;
}

export interface DailyBattleEntry {
  userId: string;
  xpToday: number;
  rank: number;
}

export interface DailyBattle {
  id: string;
  date: string;
  entries: DailyBattleEntry[];
  winnerId?: string;
  ended: boolean;
}

export interface WeeklyStats {
  weekStart: string;
  goalsCompleted: number;
  goalsTotal: number;
  xpEarned: number;
  coinsEarned: number;
  bestDay: string;
  strongestCategory: GoalCategory;
  weakestCategory: GoalCategory;
  comparisonPercent: number;
}

export interface CalendarDay {
  date: string;
  status: CalendarDayStatus;
  goalsCompleted: number;
  goalsTotal: number;
  xpEarned: number;
  coinsEarned: number;
  notes?: string;
}

export interface OnboardingData {
  durationDays: number;
  focusAreas: FocusArea[];
  goals: Omit<Goal, "id" | "userId" | "arcId" | "streak" | "createdAt">[];
  mission: string;
}

export interface ShopItem extends Reward {}

export interface MysteryBoxReward {
  type: "xp" | "coins" | "xp-boost" | "streak-freeze" | "badge" | "cosmetic";
  amount?: number;
  label: string;
  icon: string;
}

export interface LevelUpInfo {
  newLevel: number;
  newTitle: string;
  bonusXp: number;
  bonusCoins: number;
}

export interface CompletionResult {
  xpEarned: number;
  coinsEarned: number;
  multiplier: number;
  leveledUp: boolean;
  levelUpInfo?: LevelUpInfo;
  newBadges: Badge[];
  perfectDay: boolean;
  streakUpdated: boolean;
  newStreak: number;
}
