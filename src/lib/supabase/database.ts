import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { User, Arc, Goal, GoalCompletion, UserBadge, Friendship, Challenge, Activity, Notification, XPTransaction, CoinTransaction, DailyBattle, CompletionResult } from "@/types";
import { getTitleForLevel } from "@/lib/constants";
import { getTodayString } from "@/lib/utils";
import { DEMO_ACTIVITIES, DEMO_CHALLENGES, DEMO_DAILY_BATTLE } from "@/lib/demo-data";
import { getSupabase } from "./client";

type ProfileRow = {
  id: string;
  name: string;
  username: string;
  email?: string;
  avatar_url?: string;
  xp: number;
  coins: number;
  level: number;
  title: string;
  streak: number;
  longest_streak: number;
  streak_freezes: number;
  xp_boost_until?: string;
  onboarding_complete?: boolean;
  created_at: string;
};

function mapProfile(row: ProfileRow, email?: string): User {
  return {
    id: row.id,
    name: row.name,
    username: row.username,
    email: email ?? row.email ?? "",
    avatar: row.avatar_url,
    xp: row.xp ?? 0,
    coins: row.coins ?? 0,
    level: row.level ?? 1,
    title: row.title ?? getTitleForLevel(1),
    streak: row.streak ?? 0,
    longestStreak: row.longest_streak ?? 0,
    streakFreezes: row.streak_freezes ?? 0,
    xpBoostUntil: row.xp_boost_until,
    createdAt: row.created_at,
  };
}

export async function signUpWithProfile(
  email: string,
  password: string,
  name: string,
  username: string
) {
  const sb = getSupabase();
  const { data, error } = await sb.auth.signUp({
    email,
    password,
    options: {
      data: { name, username: username.toLowerCase() },
    },
  });
  if (error) throw error;
  if (!data.user) throw new Error("Signup failed");

  // Profile is created by DB trigger; upsert as fallback if trigger not installed yet
  await ensureProfile(data.user.id, email, name, username.toLowerCase());

  return data.user;
}

export async function ensureProfile(
  userId: string,
  email?: string,
  name?: string,
  username?: string
) {
  const sb = getSupabase();
  const { data: existing } = await sb.from("profiles").select("id").eq("id", userId).maybeSingle();
  if (existing) return;

  const { data: authData } = await sb.auth.getUser();
  const meta = authData.user?.user_metadata;
  const baseName = name ?? meta?.name ?? email?.split("@")[0] ?? "User";
  let baseUsername = (username ?? meta?.username ?? email?.split("@")[0] ?? "user")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  if (!baseUsername) baseUsername = "user";
  const finalUsername = `${baseUsername}${userId.replace(/-/g, "").slice(0, 6)}`;

  const { error } = await sb.from("profiles").insert({
    id: userId,
    name: baseName,
    username: finalUsername,
    onboarding_complete: false,
  });

  if (error && error.code !== "23505") throw error;
}

export async function signIn(email: string, password: string) {
  const sb = getSupabase();
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

export async function signInWithGoogle() {
  const sb = getSupabase();
  const redirectTo = `${window.location.origin}/auth/callback`;
  const { error } = await sb.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });
  if (error) throw error;
}

export async function signOut() {
  const sb = getSupabase();
  await sb.auth.signOut();
}

export async function loadUserData(userId: string, email?: string) {
  const sb = getSupabase();

  // Ensure profile exists (fixes users created before trigger was added)
  await ensureProfile(userId, email);

  const [
    profileRes,
    arcRes,
    goalsRes,
    completionsRes,
    badgesRes,
    xpTxRes,
    coinTxRes,
    notifRes,
    friendsRes,
    allUsersRes,
    challengesRes,
    activitiesRes,
  ] = await Promise.all([
    sb.from("profiles").select("*").eq("id", userId).single(),
    sb.from("arcs").select("*").eq("user_id", userId).eq("is_active", true).maybeSingle(),
    sb.from("goals").select("*").eq("user_id", userId),
    sb.from("goal_completions").select("*").eq("user_id", userId).order("completed_at", { ascending: false }).limit(200),
    sb.from("user_badges").select("*").eq("user_id", userId),
    sb.from("xp_transactions").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(50),
    sb.from("coin_transactions").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(50),
    sb.from("notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(30),
    sb.from("friendships").select("*").or(`requester_id.eq.${userId},addressee_id.eq.${userId}`),
    sb.from("profiles").select("*").order("xp", { ascending: false }).limit(20),
    sb.from("challenges").select("*"),
    sb.from("activities").select("*").order("created_at", { ascending: false }).limit(20),
  ]);

  if (profileRes.error) {
    throw new Error(profileRes.error.message || "Could not load profile. Run supabase/auth-fix.sql in Supabase.");
  }

  const profile = profileRes.data as ProfileRow;
  const arc = arcRes.data
    ? {
        id: arcRes.data.id,
        userId: arcRes.data.user_id,
        name: arcRes.data.name,
        mission: arcRes.data.mission,
        durationDays: arcRes.data.duration_days,
        startDate: arcRes.data.start_date,
        endDate: arcRes.data.end_date,
        focusAreas: arcRes.data.focus_areas ?? [],
        isActive: arcRes.data.is_active,
      } as Arc
    : null;

  const goals: Goal[] = (goalsRes.data ?? []).map((g) => ({
    id: g.id,
    userId: g.user_id,
    arcId: g.arc_id,
    name: g.name,
    category: g.category,
    frequency: g.frequency,
    customDays: g.custom_days,
    target: g.target,
    difficulty: g.difficulty,
    xpReward: g.xp_reward,
    coinReward: g.coin_reward,
    isPaused: g.is_paused,
    streak: g.streak,
    createdAt: g.created_at,
  }));

  const completions: GoalCompletion[] = (completionsRes.data ?? []).map((c) => ({
    id: c.id,
    goalId: c.goal_id,
    userId: c.user_id,
    completedAt: c.completed_at,
    xpEarned: c.xp_earned,
    coinsEarned: c.coins_earned,
    multiplier: Number(c.multiplier),
  }));

  const userBadges: UserBadge[] = (badgesRes.data ?? []).map((b) => ({
    id: b.id,
    userId: b.user_id,
    badgeId: b.badge_id,
    unlockedAt: b.unlocked_at,
  }));

  const friendships: Friendship[] = (friendsRes.data ?? []).map((f) => ({
    id: f.id,
    requesterId: f.requester_id,
    addresseeId: f.addressee_id,
    status: f.status,
    createdAt: f.created_at,
  }));

  const allUsers: User[] = (allUsersRes.data ?? []).map((p) => mapProfile(p as ProfileRow));

  const participantMap = new Map<string, string[]>();
  const challengeRows = challengesRes.data?.length ? challengesRes.data : DEMO_CHALLENGES;
  if (challengeRows.length) {
    const challengeIds = challengeRows.map((c) => c.id);
    const { data: parts } = await sb
      .from("challenge_participants")
      .select("*")
      .in("challenge_id", challengeIds);
    (parts ?? []).forEach((p) => {
      const list = participantMap.get(p.challenge_id) ?? [];
      list.push(p.user_id);
      participantMap.set(p.challenge_id, list);
    });
  }

  const challenges: Challenge[] = challengeRows.map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    type: c.type,
    duration: c.duration,
    startDate: c.start_date ?? c.startDate,
    endDate: c.end_date ?? c.endDate,
    creatorId: c.creator_id ?? c.creatorId,
    participantIds: participantMap.get(c.id) ?? c.participantIds ?? [],
    goal: c.goal,
    xpPrize: c.xp_prize ?? c.xpPrize,
    coinPrize: c.coin_prize ?? c.coinPrize,
    badgeReward: c.badge_reward ?? c.badgeReward,
    isActive: c.is_active ?? c.isActive ?? true,
  }));

  const activities: Activity[] = (activitiesRes.data?.length ? activitiesRes.data : DEMO_ACTIVITIES).map((a) => ({
    id: a.id,
    userId: a.user_id ?? a.userId,
    type: a.type,
    message: a.message,
    createdAt: a.created_at ?? a.createdAt,
    reactions: a.reactions ?? {},
  }));

  const xpTransactions: XPTransaction[] = (xpTxRes.data ?? []).map((t) => ({
    id: t.id,
    userId: t.user_id,
    amount: t.amount,
    reason: t.reason,
    createdAt: t.created_at,
  }));

  const coinTransactions: CoinTransaction[] = (coinTxRes.data ?? []).map((t) => ({
    id: t.id,
    userId: t.user_id,
    amount: t.amount,
    reason: t.reason,
    createdAt: t.created_at,
  }));

  const notifications: Notification[] = (notifRes.data ?? []).map((n) => ({
    id: n.id,
    userId: n.user_id,
    type: n.type,
    title: n.title,
    message: n.message,
    read: n.read,
    createdAt: n.created_at,
  }));

  const today = getTodayString();
  const todayXp = xpTransactions
    .filter((t) => t.createdAt.startsWith(today))
    .reduce((s, t) => s + t.amount, 0);

  const battleEntries = allUsers.map((u) => ({
    userId: u.id,
    xpToday: u.id === userId ? todayXp : 0,
    rank: 0,
  })).sort((a, b) => b.xpToday - a.xpToday).map((e, i) => ({ ...e, rank: i + 1 }));

  const dailyBattle: DailyBattle = {
    id: `battle-${today}`,
    date: today,
    entries: battleEntries.length ? battleEntries : DEMO_DAILY_BATTLE.entries,
    ended: false,
  };

  return {
    currentUser: mapProfile(profile, email),
    onboardingComplete: profile.onboarding_complete ?? false,
    arc,
    goals,
    completions,
    userBadges,
    friendships,
    allUsers,
    challenges,
    activities,
    xpTransactions,
    coinTransactions,
    notifications,
    dailyBattle,
  };
}

export async function completeGoalRpc(goalId: string): Promise<CompletionResult> {
  const sb = getSupabase();
  const { data, error } = await sb.rpc("complete_goal", { p_goal_id: goalId });
  if (error) throw error;
  return {
    xpEarned: data.xpEarned,
    coinsEarned: data.coinsEarned,
    multiplier: data.multiplier,
    leveledUp: data.leveledUp,
    levelUpInfo: data.levelUpInfo ?? undefined,
    newBadges: [],
    perfectDay: data.perfectDay,
    streakUpdated: data.streakUpdated,
    newStreak: data.newStreak,
  };
}

export async function purchaseRewardRpc(rewardId: string) {
  const sb = getSupabase();
  const { data, error } = await sb.rpc("purchase_reward", { p_reward_id: rewardId });
  if (error) throw error;
  return data;
}

export async function saveOnboarding(userId: string, data: {
  durationDays: number;
  focusAreas: string[];
  mission: string;
  goals: Array<{
    name: string;
    category: string;
    frequency: string;
    target: string;
    difficulty: string;
    xpReward: number;
    coinReward: number;
    isPaused: boolean;
  }>;
}) {
  const sb = getSupabase();
  const startDate = getTodayString();
  const end = new Date(startDate);
  end.setDate(end.getDate() + data.durationDays - 1);
  const endDate = end.toISOString().split("T")[0];

  // Allow retrying onboarding without duplicate active arcs
  const { error: deactivateError } = await sb
    .from("arcs")
    .update({ is_active: false })
    .eq("user_id", userId)
    .eq("is_active", true);
  if (deactivateError) throw deactivateError;

  const { data: arc, error: arcError } = await sb.from("arcs").insert({
    user_id: userId,
    name: `Winter Arc ${new Date().getFullYear()}`,
    mission: data.mission,
    duration_days: data.durationDays,
    start_date: startDate,
    end_date: endDate,
    focus_areas: data.focusAreas,
    is_active: true,
  }).select().single();

  if (arcError) throw arcError;

  const goalRows = data.goals.map((g) => ({
    user_id: userId,
    arc_id: arc.id,
    name: g.name,
    category: g.category,
    frequency: g.frequency,
    target: g.target,
    difficulty: g.difficulty,
    xp_reward: g.xpReward,
    coin_reward: g.coinReward,
    is_paused: g.isPaused,
  }));

  const { data: insertedGoals, error: goalsError } = await sb.from("goals").insert(goalRows).select();
  if (goalsError) throw goalsError;

  const { data: profile, error: profileError } = await sb
    .from("profiles")
    .update({ onboarding_complete: true })
    .eq("id", userId)
    .select("id, onboarding_complete")
    .single();

  if (profileError) {
    throw new Error(
      profileError.message.includes("onboarding_complete")
        ? "Missing onboarding_complete column. Run supabase/onboarding-fix.sql in Supabase."
        : profileError.message || "Could not mark onboarding complete."
    );
  }
  if (!profile?.onboarding_complete) {
    throw new Error("Could not mark onboarding complete. Run supabase/onboarding-fix.sql in Supabase.");
  }

  const arcResult: Arc = {
    id: arc.id,
    userId: arc.user_id,
    name: arc.name,
    mission: arc.mission,
    durationDays: arc.duration_days,
    startDate: arc.start_date,
    endDate: arc.end_date,
    focusAreas: arc.focus_areas ?? [],
    isActive: arc.is_active,
  };

  const goals: Goal[] = (insertedGoals ?? []).map((g) => ({
    id: g.id,
    userId: g.user_id,
    arcId: g.arc_id,
    name: g.name,
    category: g.category,
    frequency: g.frequency,
    customDays: g.custom_days,
    target: g.target,
    difficulty: g.difficulty,
    xpReward: g.xp_reward,
    coinReward: g.coin_reward,
    isPaused: g.is_paused,
    streak: g.streak ?? 0,
    createdAt: g.created_at,
  }));

  return { arc: arcResult, goals };
}

export async function addGoal(userId: string, arcId: string, goal: Omit<Goal, "id" | "userId" | "arcId" | "streak" | "createdAt">) {
  const sb = getSupabase();
  const { error } = await sb.from("goals").insert({
    user_id: userId,
    arc_id: arcId,
    name: goal.name,
    category: goal.category,
    frequency: goal.frequency,
    target: goal.target,
    difficulty: goal.difficulty,
    xp_reward: goal.xpReward,
    coin_reward: goal.coinReward,
    is_paused: goal.isPaused,
  });
  if (error) throw error;
}

export async function updateGoalDb(goalId: string, updates: Partial<Goal>) {
  const sb = getSupabase();
  const row: Record<string, unknown> = {};
  if (updates.name !== undefined) row.name = updates.name;
  if (updates.category !== undefined) row.category = updates.category;
  if (updates.frequency !== undefined) row.frequency = updates.frequency;
  if (updates.target !== undefined) row.target = updates.target;
  if (updates.difficulty !== undefined) row.difficulty = updates.difficulty;
  if (updates.xpReward !== undefined) row.xp_reward = updates.xpReward;
  if (updates.coinReward !== undefined) row.coin_reward = updates.coinReward;
  if (updates.isPaused !== undefined) row.is_paused = updates.isPaused;
  const { error } = await sb.from("goals").update(row).eq("id", goalId);
  if (error) throw error;
}

export async function deleteGoalDb(goalId: string) {
  const sb = getSupabase();
  const { error } = await sb.from("goals").delete().eq("id", goalId);
  if (error) throw error;
}

export async function sendFriendRequest(requesterId: string, username: string) {
  const sb = getSupabase();
  const { data: target, error } = await sb.from("profiles").select("id").eq("username", username.toLowerCase()).single();
  if (error || !target) return false;
  if (target.id === requesterId) return false;
  const { error: insertError } = await sb.from("friendships").insert({
    requester_id: requesterId,
    addressee_id: target.id,
    status: "pending",
  });
  return !insertError;
}

export async function updateFriendship(id: string, status: "accepted" | "rejected") {
  const sb = getSupabase();
  if (status === "rejected") {
    await sb.from("friendships").delete().eq("id", id);
  } else {
    await sb.from("friendships").update({ status }).eq("id", id);
  }
}

export async function joinChallengeDb(challengeId: string, userId: string) {
  const sb = getSupabase();
  await sb.from("challenge_participants").upsert({ challenge_id: challengeId, user_id: userId });
}

export async function markNotificationReadDb(id: string) {
  const sb = getSupabase();
  await sb.from("notifications").update({ read: true }).eq("id", id);
}

export async function markAllNotificationsReadDb(userId: string) {
  const sb = getSupabase();
  await sb.from("notifications").update({ read: true }).eq("user_id", userId).eq("read", false);
}
