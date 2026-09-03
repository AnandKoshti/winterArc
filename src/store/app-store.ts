"use client";

import { create } from "zustand";
import {
  Activity,
  Arc,
  Badge,
  Challenge,
  CompletionResult,
  DailyBattle,
  Friendship,
  Goal,
  GoalCompletion,
  Group,
  LevelUpInfo,
  Notification,
  OnboardingData,
  User,
  UserBadge,
  XPTransaction,
  CoinTransaction,
} from "@/types";
import {
  DEMO_ACTIVITIES,
  DEMO_ARC,
  DEMO_CHALLENGES,
  DEMO_COIN_TRANSACTIONS,
  DEMO_COMPLETIONS,
  DEMO_DAILY_BATTLE,
  DEMO_FRIENDSHIPS,
  DEMO_GOALS,
  DEMO_GROUPS,
  DEMO_NOTIFICATIONS,
  DEMO_USER_BADGES,
  DEMO_USER_ID,
  DEMO_USERS,
  DEMO_XP_TRANSACTIONS,
} from "@/lib/demo-data";
import {
  BADGES,
  checkBadgeUnlocks,
  createCompletion,
  getPerfectDayBonus,
  getRandomMysteryReward,
  processGoalCompletion,
  SHOP_ITEMS,
} from "@/lib/game-logic";
import { getLevelFromXp, getTitleForLevel, MOTIVATIONAL_MESSAGES } from "@/lib/constants";
import { generateId, getTodayString } from "@/lib/utils";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  loadUserData,
  signIn,
  signUpWithProfile,
  signOut as supabaseSignOut,
  completeGoalRpc,
  uncompleteGoalRpc,
  purchaseRewardRpc,
  saveOnboarding,
  addGoal as addGoalDb,
  updateGoalDb,
  deleteGoalDb,
  sendFriendRequest as sendFriendRequestDb,
  updateFriendship,
  joinChallengeDb,
  markNotificationReadDb,
  markAllNotificationsReadDb,
  createGroupDb,
  joinGroupByCodeDb,
  leaveGroupDb,
  addFriendsToGroupDb,
  resendSignupVerification,
} from "@/lib/supabase/database";

interface AppState {
  currentUser: User | null;
  isAuthenticated: boolean;
  onboardingComplete: boolean;
  isLoading: boolean;
  authReady: boolean;
  supabaseMode: boolean;
  arc: Arc | null;
  goals: Goal[];
  completions: GoalCompletion[];
  userBadges: UserBadge[];
  friendships: Friendship[];
  groups: Group[];
  challenges: Challenge[];
  activities: Activity[];
  notifications: Notification[];
  dailyBattle: DailyBattle;
  xpTransactions: XPTransaction[];
  coinTransactions: CoinTransaction[];
  allUsers: User[];

  showLevelUp: boolean;
  levelUpInfo: LevelUpInfo | null;
  showAchievement: boolean;
  achievementBadge: Badge | null;
  showPerfectDay: boolean;
  showMysteryBox: boolean;
  mysteryReward: ReturnType<typeof getRandomMysteryReward> | null;
  completionToast: { xp: number; coins: number } | null;

  setSupabaseSession: (userId: string | null, email?: string, options?: { silent?: boolean }) => Promise<void>;
  login: (email: string, password: string) => Promise<"ok" | "email_not_confirmed" | "failed">;
  signup: (
    name: string,
    username: string,
    email: string,
    password: string
  ) => Promise<"authenticated" | "verify_email" | "email_taken" | "failed">;
  resendVerificationEmail: (email: string) => Promise<boolean>;
  logout: () => Promise<void>;
  completeOnboarding: (data: OnboardingData) => Promise<void>;
  completeGoal: (goalId: string) => Promise<CompletionResult | null>;
  uncompleteGoal: (goalId: string) => Promise<void>;
  addGoal: (goal: Omit<Goal, "id" | "userId" | "arcId" | "streak" | "createdAt">) => Promise<void>;
  updateGoal: (goalId: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (goalId: string) => Promise<void>;
  togglePauseGoal: (goalId: string) => Promise<void>;
  purchaseReward: (rewardId: string) => Promise<boolean>;
  openMysteryBox: () => void;
  closeMysteryBox: () => void;
  sendFriendRequest: (username: string) => Promise<boolean>;
  acceptFriendRequest: (friendshipId: string) => Promise<void>;
  rejectFriendRequest: (friendshipId: string) => Promise<void>;
  removeFriend: (friendshipId: string) => Promise<void>;
  createGroup: (name: string, description: string, memberIds: string[]) => Promise<Group | null>;
  joinGroupByCode: (inviteCode: string) => Promise<boolean>;
  leaveGroup: (groupId: string) => Promise<void>;
  addFriendsToGroup: (groupId: string, memberIds: string[]) => Promise<void>;
  joinChallenge: (challengeId: string) => Promise<void>;
  addReaction: (activityId: string, emoji: string) => void;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  dismissLevelUp: () => void;
  dismissAchievement: () => void;
  dismissPerfectDay: () => void;
  dismissCompletionToast: () => void;
  isGoalCompletedToday: (goalId: string) => boolean;
  getFriends: () => User[];
  getPendingRequests: () => Friendship[];
  getSentRequests: () => Friendship[];
  getGroupMembers: (groupId: string) => User[];
  initDemo: () => void;
  refreshUserData: () => Promise<void>;
}

export const useAppStore = create<AppState>()((set, get) => ({
  currentUser: null,
  isAuthenticated: false,
  onboardingComplete: false,
  isLoading: isSupabaseConfigured(),
  authReady: !isSupabaseConfigured(),
  supabaseMode: isSupabaseConfigured(),
  arc: null,
  goals: [],
  completions: [],
  userBadges: [],
  friendships: [],
  groups: [],
  challenges: [],
  activities: [],
  notifications: [],
  dailyBattle: DEMO_DAILY_BATTLE,
  xpTransactions: [],
  coinTransactions: [],
  allUsers: [],

  showLevelUp: false,
  levelUpInfo: null,
  showAchievement: false,
  achievementBadge: null,
  showPerfectDay: false,
  showMysteryBox: false,
  mysteryReward: null,
  completionToast: null,

  setSupabaseSession: async (userId, email, options) => {
    if (!userId) {
      set({
        currentUser: null,
        isAuthenticated: false,
        onboardingComplete: false,
        isLoading: false,
        authReady: true,
      });
      return;
    }

    const state = get();
    const alreadyLoaded =
      state.authReady &&
      state.isAuthenticated &&
      state.currentUser?.id === userId;

    // Background refreshes / token renewals must not flash a full-page spinner
    if (!options?.silent && !alreadyLoaded) set({ isLoading: true });

    try {
      const data = await loadUserData(userId, email);
      set({
        ...data,
        isAuthenticated: true,
        isLoading: false,
        authReady: true,
        challenges: data.challenges.length ? data.challenges : DEMO_CHALLENGES,
        activities: data.activities.length ? data.activities : DEMO_ACTIVITIES,
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : JSON.stringify(e);
      console.error("Failed to load user data:", message);
      if (!options?.silent && !alreadyLoaded) {
        set({ isLoading: false, isAuthenticated: false, authReady: true });
      } else {
        set({ isLoading: false, authReady: true });
      }
    }
  },

  refreshUserData: async () => {
    const user = get().currentUser;
    if (!user || !get().supabaseMode) return;
    await get().setSupabaseSession(user.id, user.email, { silent: true });
  },

  initDemo: () => {
    if (get().supabaseMode) return;
    const today = getTodayString();
    const user = DEMO_USERS[0];
    const pendingIncoming = DEMO_FRIENDSHIPS.filter(
      (f) => f.status === "pending" && f.addresseeId === user.id
    );
    const friendNotifs: Notification[] = pendingIncoming.map((f) => {
      const requester = DEMO_USERS.find((u) => u.id === f.requesterId);
      return {
        id: `n-friend-${f.id}`,
        userId: user.id,
        type: "friend" as const,
        title: "Friend Request",
        message: `${requester?.name ?? "Someone"} sent you a friend request.`,
        read: false,
        createdAt: f.createdAt,
      };
    });
    const dailyExtras: Notification[] = [
      {
        id: "n-streak-today",
        userId: user.id,
        type: "streak",
        title: "Streak Reminder",
        message: `Your ${user.streak}-day streak is waiting. Complete a goal today.`,
        read: false,
        createdAt: `${today}T06:00:00Z`,
      },
      {
        id: "n-battle-today",
        userId: user.id,
        type: "challenge",
        title: "Daily Battle",
        message: "Your Daily Battle has started. Earn XP to climb the board.",
        read: false,
        createdAt: `${today}T00:05:00Z`,
      },
    ];
    const existingTitles = new Set(DEMO_NOTIFICATIONS.map((n) => n.title));
    const merged = [
      ...friendNotifs,
      ...dailyExtras.filter((n) => !existingTitles.has(n.title)),
      ...DEMO_NOTIFICATIONS,
    ];
    set({
      currentUser: user,
      isAuthenticated: true,
      onboardingComplete: true,
      arc: DEMO_ARC,
      goals: DEMO_GOALS,
      completions: DEMO_COMPLETIONS,
      userBadges: DEMO_USER_BADGES,
      friendships: DEMO_FRIENDSHIPS,
      groups: DEMO_GROUPS,
      challenges: DEMO_CHALLENGES,
      activities: DEMO_ACTIVITIES,
      notifications: merged,
      dailyBattle: DEMO_DAILY_BATTLE,
      xpTransactions: DEMO_XP_TRANSACTIONS,
      coinTransactions: DEMO_COIN_TRANSACTIONS,
      allUsers: DEMO_USERS,
    });
  },

  login: async (email, password) => {
    if (get().supabaseMode) {
      try {
        set({ isLoading: true });
        const user = await signIn(email, password);
        if (!user) {
          set({ isLoading: false });
          return "failed";
        }
        await get().setSupabaseSession(user.id, user.email ?? email);
        set({ isLoading: false });
        return get().isAuthenticated ? "ok" : "failed";
      } catch (e) {
        console.error("Login failed:", e instanceof Error ? e.message : e);
        set({ isLoading: false });
        if (e instanceof Error && e.message === "EMAIL_NOT_CONFIRMED") {
          return "email_not_confirmed";
        }
        return "failed";
      }
    }
    const demoUser = DEMO_USERS.find((u) => u.email === email) ?? DEMO_USERS[0];
    set({
      currentUser: demoUser,
      isAuthenticated: true,
      onboardingComplete: true,
      arc: DEMO_ARC,
      goals: DEMO_GOALS,
      completions: DEMO_COMPLETIONS,
      userBadges: DEMO_USER_BADGES,
      friendships: DEMO_FRIENDSHIPS,
      groups: DEMO_GROUPS,
      challenges: DEMO_CHALLENGES,
      activities: DEMO_ACTIVITIES,
      notifications: DEMO_NOTIFICATIONS,
      dailyBattle: DEMO_DAILY_BATTLE,
      xpTransactions: DEMO_XP_TRANSACTIONS,
      coinTransactions: DEMO_COIN_TRANSACTIONS,
      allUsers: DEMO_USERS,
    });
    return "ok";
  },

  signup: async (name, username, email, password) => {
    if (get().supabaseMode) {
      try {
        const result = await signUpWithProfile(email, password, name, username);
        if ("alreadyRegistered" in result) return "email_taken";
        if (!result?.userId) return "failed";

        if (result.needsEmailVerification) {
          try {
            await supabaseSignOut();
          } catch {
            /* ignore */
          }
          set({
            currentUser: null,
            isAuthenticated: false,
            isLoading: false,
            authReady: true,
          });
          return "verify_email";
        }

        set({ isLoading: true });
        await get().setSupabaseSession(result.userId, email);
        set({ isLoading: false });
        return get().isAuthenticated ? "authenticated" : "failed";
      } catch (e) {
        console.error("Signup failed:", e instanceof Error ? e.message : e);
        set({ isLoading: false, authReady: true });
        const msg = e instanceof Error ? e.message.toLowerCase() : "";
        if (msg.includes("already") || msg.includes("registered")) return "email_taken";
        return "failed";
      }
    }
    const newUser: User = {
      id: generateId(),
      name,
      username,
      email,
      xp: 0,
      coins: 100,
      level: 1,
      title: getTitleForLevel(1),
      streak: 0,
      longestStreak: 0,
      streakFreezes: 1,
      createdAt: new Date().toISOString(),
    };
    set({ currentUser: newUser, isAuthenticated: true, onboardingComplete: false, allUsers: [...DEMO_USERS, newUser] });
    return "authenticated";
  },

  resendVerificationEmail: async (email) => {
    if (!get().supabaseMode || !email.trim()) return false;
    try {
      await resendSignupVerification(email.trim());
      return true;
    } catch (e) {
      console.error("Resend verification failed:", e instanceof Error ? e.message : e);
      return false;
    }
  },

  logout: async () => {
    if (get().supabaseMode) await supabaseSignOut();
    set({ currentUser: null, isAuthenticated: false, onboardingComplete: false, arc: null, goals: [], completions: [] });
  },

  completeOnboarding: async (data) => {
    const user = get().currentUser;
    if (!user) throw new Error("You must be signed in to finish onboarding.");
    if (get().supabaseMode) {
      const saved = await saveOnboarding(user.id, data);
      set({
        onboardingComplete: true,
        arc: saved.arc,
        goals: saved.goals,
      });
      return;
    }
    const startDate = getTodayString();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + data.durationDays - 1);
    set({
      arc: {
        id: generateId(),
        userId: user.id,
        name: `Winter Arc ${new Date().getFullYear()}`,
        mission: data.mission,
        durationDays: data.durationDays,
        startDate,
        endDate: endDate.toISOString().split("T")[0],
        focusAreas: data.focusAreas,
        isActive: true,
      },
      goals: data.goals.map((g) => ({
        ...g,
        id: generateId(),
        userId: user.id,
        arcId: "local-arc",
        streak: 0,
        createdAt: new Date().toISOString(),
      })),
      onboardingComplete: true,
    });
  },

  isGoalCompletedToday: (goalId) => {
    const localToday = getTodayString();
    const utcToday = new Date().toISOString().slice(0, 10);
    return get().completions.some(
      (c) =>
        c.goalId === goalId &&
        (c.completedAt.startsWith(localToday) || c.completedAt.startsWith(utcToday))
    );
  },

  completeGoal: async (goalId) => {
    const state = get();
    if (!state.currentUser) return null;

    if (state.supabaseMode) {
      try {
        const result = await completeGoalRpc(goalId);
        const goal = state.goals.find((g) => g.id === goalId);
        if (!goal) return null;

        const newXp = state.currentUser.xp + result.xpEarned;
        const newCoins = state.currentUser.coins + result.coinsEarned;
        const newLevel = result.levelUpInfo?.newLevel ?? getLevelFromXp(newXp);

        set({
          currentUser: {
            ...state.currentUser,
            xp: newXp,
            coins: newCoins,
            level: newLevel,
            title: result.levelUpInfo?.newTitle ?? getTitleForLevel(newLevel),
            streak: result.newStreak,
            longestStreak: Math.max(state.currentUser.longestStreak, result.newStreak),
          },
          completions: [
            createCompletion(goalId, state.currentUser.id, result.xpEarned, result.coinsEarned, result.multiplier),
            ...state.completions,
          ],
          goals: state.goals.map((g) => (g.id === goalId ? { ...g, streak: g.streak + 1 } : g)),
          completionToast: { xp: result.xpEarned, coins: result.coinsEarned },
          showLevelUp: result.leveledUp,
          levelUpInfo: result.levelUpInfo ?? null,
          showPerfectDay: result.perfectDay,
        });

        void get().refreshUserData();
        return result;
      } catch {
        return null;
      }
    }

    const goal = state.goals.find((g) => g.id === goalId);
    if (!goal || goal.isPaused) return null;
    const today = getTodayString();
    if (state.completions.some((c) => c.goalId === goalId && c.completedAt.startsWith(today))) return null;

    const result = processGoalCompletion(
      state.currentUser,
      goal,
      state.completions,
      state.goals.filter((g) => !g.isPaused),
      state.currentUser.xpBoostUntil ? new Date(state.currentUser.xpBoostUntil) > new Date() : false
    );

    const totalXp = result.xpEarned + (result.perfectDay ? getPerfectDayBonus().xp : 0) + (result.levelUpInfo?.bonusXp ?? 0);
    const totalCoins = result.coinsEarned + (result.perfectDay ? getPerfectDayBonus().coins : 0) + (result.levelUpInfo?.bonusCoins ?? 0);
    const newXp = state.currentUser.xp + totalXp;

    set({
      currentUser: {
        ...state.currentUser,
        xp: newXp,
        coins: state.currentUser.coins + totalCoins,
        level: getLevelFromXp(newXp),
        title: getTitleForLevel(getLevelFromXp(newXp)),
        streak: result.newStreak,
        longestStreak: Math.max(state.currentUser.longestStreak, result.newStreak),
      },
      completions: [...state.completions, createCompletion(goalId, state.currentUser.id, totalXp, totalCoins, result.multiplier)],
      goals: state.goals.map((g) => (g.id === goalId ? { ...g, streak: g.streak + 1 } : g)),
      completionToast: { xp: totalXp, coins: totalCoins },
      showLevelUp: result.leveledUp,
      levelUpInfo: result.levelUpInfo ?? null,
      showPerfectDay: result.perfectDay,
    });
    return result;
  },

  uncompleteGoal: async (goalId) => {
    const state = get();
    if (!state.currentUser) return;

    // Match local or UTC "today" so timezone edges don't hide the completion
    const localToday = getTodayString();
    const utcToday = new Date().toISOString().slice(0, 10);
    const completion = state.completions.find(
      (c) =>
        c.goalId === goalId &&
        (c.completedAt.startsWith(localToday) || c.completedAt.startsWith(utcToday))
    );
    if (!completion) return;

    if (state.supabaseMode) {
      try {
        const result = await uncompleteGoalRpc(goalId);
        set({
          currentUser: {
            ...state.currentUser,
            xp: result.newXp,
            coins: result.newCoins,
            level: result.newLevel,
            title: getTitleForLevel(result.newLevel),
            streak: result.newStreak,
            longestStreak: Math.max(state.currentUser.longestStreak, result.newStreak),
          },
          completions: state.completions.filter(
            (c) => !(c.goalId === goalId && (c.id === completion.id || c.completedAt.startsWith(localToday) || c.completedAt.startsWith(utcToday)))
          ),
          goals: state.goals.map((g) =>
            g.id === goalId ? { ...g, streak: Math.max(0, g.streak - 1) } : g
          ),
          showPerfectDay: false,
        });
        void get().refreshUserData();
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        console.error("Undo goal failed:", message);
      }
      return;
    }

    const newXp = Math.max(0, state.currentUser.xp - completion.xpEarned);
    set({
      currentUser: {
        ...state.currentUser,
        xp: newXp,
        coins: Math.max(0, state.currentUser.coins - completion.coinsEarned),
        level: getLevelFromXp(newXp),
        title: getTitleForLevel(getLevelFromXp(newXp)),
      },
      completions: state.completions.filter((c) => c.id !== completion.id),
      goals: state.goals.map((g) => (g.id === goalId ? { ...g, streak: Math.max(0, g.streak - 1) } : g)),
    });
  },

  addGoal: async (goalData) => {
    const state = get();
    if (!state.currentUser || !state.arc) return;
    if (state.supabaseMode) {
      await addGoalDb(state.currentUser.id, state.arc.id, goalData);
      await get().refreshUserData();
      return;
    }
    set({ goals: [...state.goals, { ...goalData, id: generateId(), userId: state.currentUser.id, arcId: state.arc.id, streak: 0, createdAt: new Date().toISOString() }] });
  },

  updateGoal: async (goalId, updates) => {
    if (get().supabaseMode) {
      await updateGoalDb(goalId, updates);
      await get().refreshUserData();
      return;
    }
    set({ goals: get().goals.map((g) => (g.id === goalId ? { ...g, ...updates } : g)) });
  },

  deleteGoal: async (goalId) => {
    if (get().supabaseMode) {
      await deleteGoalDb(goalId);
      await get().refreshUserData();
      return;
    }
    set({ goals: get().goals.filter((g) => g.id !== goalId) });
  },

  togglePauseGoal: async (goalId) => {
    const goal = get().goals.find((g) => g.id === goalId);
    if (goal) await get().updateGoal(goalId, { isPaused: !goal.isPaused });
  },

  purchaseReward: async (rewardId) => {
    const user = get().currentUser;
    if (!user) return false;
    if (get().supabaseMode) {
      try {
        const result = await purchaseRewardRpc(rewardId);
        if (result.type === "mystery-box") set({ showMysteryBox: true, mysteryReward: getRandomMysteryReward() });
        await get().refreshUserData();
        return true;
      } catch {
        return false;
      }
    }
    const item = SHOP_ITEMS.find((r) => r.id === rewardId);
    if (!item || user.coins < item.price) return false;
    const updated = { ...user, coins: user.coins - item.price };
    if (item.type === "streak-freeze") updated.streakFreezes += 1;
    if (item.type === "mystery-box") {
      set({ currentUser: updated, showMysteryBox: true, mysteryReward: getRandomMysteryReward() });
      return true;
    }
    set({ currentUser: updated });
    return true;
  },

  openMysteryBox: () => set({ showMysteryBox: true, mysteryReward: getRandomMysteryReward() }),
  closeMysteryBox: () => set({ showMysteryBox: false, mysteryReward: null }),

  sendFriendRequest: async (username) => {
    const user = get().currentUser;
    if (!user) return false;
    if (get().supabaseMode) {
      const ok = await sendFriendRequestDb(user.id, username);
      if (ok) await get().refreshUserData();
      return ok;
    }
    const target = get().allUsers.find((u) => u.username.toLowerCase() === username.toLowerCase());
    if (!target || target.id === user.id) return false;
    const already = get().friendships.some(
      (f) =>
        (f.requesterId === user.id && f.addresseeId === target.id) ||
        (f.requesterId === target.id && f.addresseeId === user.id)
    );
    if (already) return false;
    set({
      friendships: [
        ...get().friendships,
        {
          id: generateId(),
          requesterId: user.id,
          addresseeId: target.id,
          status: "pending",
          createdAt: new Date().toISOString(),
        },
      ],
      // Demo: show confirmation for sender; real recipient notif is trigger-based in Supabase
      notifications: [
        {
          id: generateId(),
          userId: user.id,
          type: "friend",
          title: "Friend Request Sent",
          message: `Invite sent to ${target.name}.`,
          read: false,
          createdAt: new Date().toISOString(),
        },
        ...get().notifications,
      ],
    });
    return true;
  },

  acceptFriendRequest: async (id) => {
    const state = get();
    const friendship = state.friendships.find((f) => f.id === id);
    if (get().supabaseMode) {
      await updateFriendship(id, "accepted");
      await get().refreshUserData();
      return;
    }
    const requester = state.allUsers.find((u) => u.id === friendship?.requesterId);
    set({
      friendships: state.friendships.map((f) =>
        f.id === id ? { ...f, status: "accepted" as const } : f
      ),
      notifications: [
        {
          id: generateId(),
          userId: state.currentUser!.id,
          type: "friend",
          title: "New Friend",
          message: `You and ${requester?.name ?? "someone"} are now friends.`,
          read: false,
          createdAt: new Date().toISOString(),
        },
        ...state.notifications,
      ],
    });
  },

  rejectFriendRequest: async (id) => {
    if (get().supabaseMode) { await updateFriendship(id, "rejected"); await get().refreshUserData(); return; }
    set({ friendships: get().friendships.filter((f) => f.id !== id) });
  },

  removeFriend: async (id) => {
    if (get().supabaseMode) { await updateFriendship(id, "rejected"); await get().refreshUserData(); return; }
    set({ friendships: get().friendships.filter((f) => f.id !== id) });
  },

  createGroup: async (name, description, memberIds) => {
    const user = get().currentUser;
    if (!user || !name.trim()) return null;
    if (get().supabaseMode) {
      try {
        const group = await createGroupDb(user.id, name, description, memberIds);
        await get().refreshUserData();
        return group;
      } catch (e) {
        console.error("Create group failed:", e instanceof Error ? e.message : e);
        return null;
      }
    }
    const group: Group = {
      id: generateId(),
      name: name.trim(),
      description: description.trim(),
      creatorId: user.id,
      inviteCode: `ARC-${generateId().slice(0, 6).toUpperCase()}`,
      memberIds: Array.from(new Set([user.id, ...memberIds])),
      createdAt: new Date().toISOString(),
    };
    set({ groups: [...get().groups, group] });
    return group;
  },

  joinGroupByCode: async (inviteCode) => {
    const user = get().currentUser;
    if (!user || !inviteCode.trim()) return false;
    if (get().supabaseMode) {
      const ok = await joinGroupByCodeDb(user.id, inviteCode);
      if (ok) await get().refreshUserData();
      return ok;
    }
    const code = inviteCode.trim().toUpperCase();
    const group = get().groups.find((g) => g.inviteCode === code);
    if (!group) return false;
    if (group.memberIds.includes(user.id)) return true;
    set({
      groups: get().groups.map((g) =>
        g.id === group.id ? { ...g, memberIds: [...g.memberIds, user.id] } : g
      ),
    });
    return true;
  },

  leaveGroup: async (groupId) => {
    const user = get().currentUser;
    if (!user) return;
    if (get().supabaseMode) {
      await leaveGroupDb(groupId, user.id);
      await get().refreshUserData();
      return;
    }
    set({
      groups: get().groups
        .map((g) =>
          g.id === groupId ? { ...g, memberIds: g.memberIds.filter((id) => id !== user.id) } : g
        )
        .filter((g) => g.memberIds.length > 0),
    });
  },

  addFriendsToGroup: async (groupId, memberIds) => {
    if (!memberIds.length) return;
    if (get().supabaseMode) {
      await addFriendsToGroupDb(groupId, memberIds);
      await get().refreshUserData();
      return;
    }
    set({
      groups: get().groups.map((g) =>
        g.id === groupId
          ? { ...g, memberIds: Array.from(new Set([...g.memberIds, ...memberIds])) }
          : g
      ),
    });
  },

  joinChallenge: async (challengeId) => {
    const user = get().currentUser;
    if (!user) return;
    if (get().supabaseMode) { await joinChallengeDb(challengeId, user.id); await get().refreshUserData(); return; }
    set({ challenges: get().challenges.map((c) => c.id === challengeId && !c.participantIds.includes(user.id) ? { ...c, participantIds: [...c.participantIds, user.id] } : c) });
  },

  addReaction: (activityId, emoji) => {
    const user = get().currentUser;
    if (!user) return;
    set({
      activities: get().activities.map((a) => {
        if (a.id !== activityId) return a;
        const reactions = { ...a.reactions };
        const users = reactions[emoji] ?? [];
        reactions[emoji] = users.includes(user.id) ? users.filter((id) => id !== user.id) : [...users, user.id];
        return { ...a, reactions };
      }),
    });
  },

  markNotificationRead: async (id) => {
    set({ notifications: get().notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) });
    if (get().supabaseMode) void markNotificationReadDb(id);
  },

  markAllNotificationsRead: async () => {
    const user = get().currentUser;
    set({ notifications: get().notifications.map((n) => ({ ...n, read: true })) });
    if (get().supabaseMode && user) void markAllNotificationsReadDb(user.id);
  },

  dismissLevelUp: () => set({ showLevelUp: false, levelUpInfo: null }),
  dismissAchievement: () => set({ showAchievement: false, achievementBadge: null }),
  dismissPerfectDay: () => set({ showPerfectDay: false }),
  dismissCompletionToast: () => set({ completionToast: null }),

  getFriends: () => {
    const state = get();
    const user = state.currentUser;
    if (!user) return [];
    return state.friendships
      .filter((f) => f.status === "accepted" && (f.requesterId === user.id || f.addresseeId === user.id))
      .map((f) => state.allUsers.find((u) => u.id === (f.requesterId === user.id ? f.addresseeId : f.requesterId))!)
      .filter(Boolean);
  },

  getPendingRequests: () => {
    const user = get().currentUser;
    if (!user) return [];
    return get().friendships.filter((f) => f.status === "pending" && f.addresseeId === user.id);
  },

  getSentRequests: () => {
    const user = get().currentUser;
    if (!user) return [];
    return get().friendships.filter((f) => f.status === "pending" && f.requesterId === user.id);
  },

  getGroupMembers: (groupId) => {
    const state = get();
    const group = state.groups.find((g) => g.id === groupId);
    if (!group) return [];
    return group.memberIds
      .map((id) => state.allUsers.find((u) => u.id === id) ?? (id === state.currentUser?.id ? state.currentUser : null))
      .filter((u): u is User => Boolean(u))
      .sort((a, b) => b.xp - a.xp);
  },
}));

export { MOTIVATIONAL_MESSAGES, BADGES, SHOP_ITEMS, DEMO_USER_ID };
