"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/app-store";
import { Snowflake } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { TAGLINE } from "@/lib/constants";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, onboardingComplete, authReady, isLoading, supabaseMode } = useAppStore();

  useEffect(() => {
    if (supabaseMode && (!authReady || isLoading)) return;
    if (isAuthenticated && onboardingComplete) {
      router.replace("/dashboard");
    } else if (isAuthenticated && !onboardingComplete) {
      router.replace("/onboarding");
    }
  }, [isAuthenticated, onboardingComplete, authReady, isLoading, supabaseMode, router]);

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-frost-900/20 via-transparent to-arc-bg" />
      <div className="relative text-center space-y-8 max-w-lg animate-float">
        <Snowflake className="mx-auto text-frost-300" size={64} />
        <div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-wider mb-3">
            WINTER <span className="text-gradient-ice">ARC</span>
          </h1>
          <p className="text-xl text-arc-muted">{TAGLINE}</p>
          <p className="text-sm text-arc-muted/70 mt-2">Your season of becoming.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/login">
            <Button size="lg" className="w-full sm:w-auto min-w-[160px]">Sign In</Button>
          </Link>
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto min-w-[160px]">
              Start Your Arc
            </Button>
          </Link>
        </div>
        <p className="text-xs text-arc-muted">
          Set goals · Earn XP · Compete with friends · Become unstoppable
        </p>
      </div>
    </div>
  );
}
