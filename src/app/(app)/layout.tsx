"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useShallow } from "zustand/react/shallow";
import { useAppStore } from "@/store/app-store";
import { Navbar } from "@/components/Navbar";
import { MobileNavigation } from "@/components/MobileNavigation";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, onboardingComplete, authReady, supabaseMode } = useAppStore(
    useShallow((s) => ({
      isAuthenticated: s.isAuthenticated,
      onboardingComplete: s.onboardingComplete,
      authReady: s.authReady,
      supabaseMode: s.supabaseMode,
    }))
  );

  useEffect(() => {
    // Only gate on auth readiness — never block navigation on background data refresh
    if (supabaseMode && !authReady) return;
    if (!isAuthenticated) {
      router.replace("/login");
    } else if (!onboardingComplete) {
      router.replace("/onboarding");
    }
  }, [isAuthenticated, onboardingComplete, authReady, supabaseMode, router]);

  // Keep the shell mounted once the user is in the app so nav clicks stay instant
  const waitingForAuth = supabaseMode && !authReady;
  const blocked = waitingForAuth || !isAuthenticated || !onboardingComplete;

  if (blocked) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-frost-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh pb-20 lg:pb-0">
      <Navbar />
      <main className="lg:pt-16">{children}</main>
      <MobileNavigation />
    </div>
  );
}
