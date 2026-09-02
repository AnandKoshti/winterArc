"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppStore } from "@/store/app-store";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Snowflake } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const login = useAppStore((s) => s.login);
  const loginWithGoogle = useAppStore((s) => s.loginWithGoogle);
  const [email, setEmail] = useState(isSupabaseConfigured() ? "" : "anand@demo.com");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const success = await login(email, password);
    setLoading(false);
    if (success) {
      // Small delay to ensure store is updated after async session load
      await new Promise((r) => setTimeout(r, 100));
      const { onboardingComplete, isAuthenticated } = useAppStore.getState();
      if (!isAuthenticated) {
        setError("Login succeeded but profile could not load. Run supabase/auth-fix.sql in Supabase SQL Editor.");
        return;
      }
      router.push(onboardingComplete ? "/dashboard" : "/onboarding");
    } else {
      setError("Invalid email or password");
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch {
      setError("Google sign-in failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center px-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Snowflake className="text-frost-300" size={32} />
            <span className="text-2xl font-bold">{APP_NAME}</span>
          </Link>
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-arc-muted mt-1">Your Arc continues.</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-strong rounded-2xl p-6 space-y-4">
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <p className="text-sm text-arc-danger">{error}</p>}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-arc-muted cursor-pointer">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="rounded" />
              Remember me
            </label>
          </div>
          <Button type="submit" className="w-full" loading={loading}>Sign In</Button>
          {isSupabaseConfigured() && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-arc-border" /></div>
                <div className="relative flex justify-center text-xs"><span className="bg-arc-card px-2 text-arc-muted">or</span></div>
              </div>
              <Button type="button" variant="secondary" className="w-full" onClick={handleGoogle} loading={loading}>
                Continue with Google
              </Button>
            </>
          )}
        </form>

        {!isSupabaseConfigured() && (
          <p className="text-center text-xs text-arc-muted">Demo mode — use any password with anand@demo.com</p>
        )}

        <p className="text-center text-sm text-arc-muted">
          Don&apos;t have an account? <Link href="/signup" className="text-frost-400 hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
