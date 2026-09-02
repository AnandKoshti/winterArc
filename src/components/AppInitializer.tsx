"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/store/app-store";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { createClient } from "@/lib/supabase/client";
import type { Session } from "@supabase/supabase-js";

export function AppInitializer({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false);
  const setSupabaseSession = useAppStore((s) => s.setSupabaseSession);
  const initDemo = useAppStore((s) => s.initDemo);
  const isLoading = useAppStore((s) => s.isLoading);
  const supabaseMode = isSupabaseConfigured();

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    if (supabaseMode) {
      const sb = createClient();
      if (!sb) return;

      const { data: { subscription } } = sb.auth.onAuthStateChange(async (event: string, session: Session | null) => {
        if (event === "SIGNED_OUT" || (event === "INITIAL_SESSION" && !session)) {
          await setSupabaseSession(null);
          return;
        }
        if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session?.user) {
          await setSupabaseSession(session.user.id, session.user.email);
        }
      });

      return () => subscription.unsubscribe();
    }

    initDemo();
  }, [supabaseMode, setSupabaseSession, initDemo]);

  if (supabaseMode && isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-arc-bg">
        <div className="animate-spin w-10 h-10 border-2 border-frost-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  return <>{children}</>;
}
