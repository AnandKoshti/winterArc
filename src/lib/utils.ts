import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isToday, parseISO, differenceInDays, addDays } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "MMMM d, yyyy");
}

export function formatShortDate(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "MMM d");
}

export function formatRelative(date: string): string {
  return formatDistanceToNow(parseISO(date), { addSuffix: true });
}

export function getTodayString(): string {
  return format(new Date(), "yyyy-MM-dd");
}

/** Consecutive calendar days with ≥1 goal completion (today or yesterday must be active). */
export function computeDayStreak(completionDates: string[], today = getTodayString()): number {
  const unique = Array.from(
    new Set(completionDates.map((d) => d.slice(0, 10)).filter(Boolean))
  ).sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));

  if (unique.length === 0) return 0;

  const mostRecent = unique[0];
  const yesterday = format(addDays(parseISO(today), -1), "yyyy-MM-dd");

  // Streak broken if last active day is before yesterday
  if (mostRecent < yesterday) return 0;

  let streak = 1;
  let cursor = mostRecent;
  for (let i = 1; i < unique.length; i++) {
    const expected = format(addDays(parseISO(cursor), -1), "yyyy-MM-dd");
    if (unique[i] === expected) {
      streak += 1;
      cursor = unique[i];
    } else {
      break;
    }
  }
  return streak;
}

export function isDateToday(date: string): boolean {
  return isToday(parseISO(date));
}

export function getArcDay(startDate: string): number {
  const start = parseISO(startDate);
  const today = new Date();
  return Math.max(1, differenceInDays(today, start) + 1);
}

export function getArcEndDate(startDate: string, durationDays: number): string {
  return format(addDays(parseISO(startDate), durationDays - 1), "yyyy-MM-dd");
}

export function getArcProgress(currentDay: number, totalDays: number): number {
  return Math.min(100, (currentDay / totalDays) * 100);
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getTimeUntilMidnight(): { hours: number; minutes: number; seconds: number } {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diff = midnight.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { hours, minutes, seconds };
}

export function formatCountdown(h: number, m: number, s: number): string {
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function animateNumber(from: number, to: number, duration: number, callback: (val: number) => void) {
  const start = performance.now();
  const step = (now: number) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    callback(Math.round(from + (to - from) * eased));
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
