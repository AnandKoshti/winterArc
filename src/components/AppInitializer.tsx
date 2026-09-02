"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/store/app-store";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";
import type { Session } from "@supabase/supabase-js";

export function AppInitializer({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false);
  const restoreStarted = useRef(false);
  const setSupabaseSession = useAppStore((s) => s.setSupabaseSession);
  const initDemo = useAppStore((s) => s.initDemo);
  const authReady = useAppStore((s) => s.authReady);
  const supabaseMode = isSupabaseConfigured();

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    if (!supabaseMode) {
      initDemo();
      return;
    }

    const sb = createClient();
    if (!sb) {
      useAppStore.setState({ isLoading: false, authReady: true });
      return;
    }

    useAppStore.setState({ isLoading: true, authReady: false });

    const applySession = (session: Session | null, silent = false) => {
      setTimeout(() => {
        void (async () => {
          const state = useAppStore.getState();
          const userId = session?.user?.id ?? null;

          if (userId) {
            if (state.authReady && state.isAuthenticated && state.currentUser?.id === userId) {
              // Already in-app — skip full reload (token refresh / duplicate SIGNED_IN)
              useAppStore.setState({ isLoading: false, authReady: true });
              return;
            }
            if (restoreStarted.current && !state.authReady && !silent) {
              return;
            }
            restoreStarted.current = true;
            await setSupabaseSession(session!.user.id, session!.user.email ?? undefined, { silent });
          } else {
            restoreStarted.current = true;
            await setSupabaseSession(null);
          }
        })();
      }, 0);
    };

    const { data: { subscription } } = sb.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        restoreStarted.current = false;
        applySession(null);
        return;
      }
      if (event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
        applySession(session, true);
        return;
      }
      if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
        const state = useAppStore.getState();
        const silent =
          state.isAuthenticated &&
          !!session?.user?.id &&
          state.currentUser?.id === session.user.id;
        applySession(session, silent);
      }
    });

    void sb.auth.getSession().then(({ data: { session } }) => {
      if (!restoreStarted.current && !useAppStore.getState().authReady) {
        applySession(session);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabaseMode, setSupabaseSession, initDemo]);

  if (supabaseMode && !authReady) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-arc-bg">
        <div className="animate-spin w-10 h-10 border-2 border-frost-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  return <>{children}</>;
}
