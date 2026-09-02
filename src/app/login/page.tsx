"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppStore } from "@/store/app-store";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Mail, Snowflake } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { getSupabaseConfigIssue, isSupabaseConfigured } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const login = useAppStore((s) => s.login);
  const resendVerificationEmail = useAppStore((s) => s.resendVerificationEmail);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const onboardingComplete = useAppStore((s) => s.onboardingComplete);
  const authReady = useAppStore((s) => s.authReady);
  const isLoading = useAppStore((s) => s.isLoading);
  const supabaseMode = useAppStore((s) => s.supabaseMode);
  const [email, setEmail] = useState(isSupabaseConfigured() ? "" : "anand@demo.com");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [resendStatus, setResendStatus] = useState("");
  const [resending, setResending] = useState(false);
  const configIssue = getSupabaseConfigIssue();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error") === "auth_callback") {
      setError("Email verification failed. Request a new link or try signing in again.");
    }
  }, []);

  useEffect(() => {
    if (supabaseMode && (!authReady || isLoading)) return;
    if (isAuthenticated) {
      router.replace(onboardingComplete ? "/dashboard" : "/onboarding");
    }
  }, [isAuthenticated, onboardingComplete, authReady, isLoading, supabaseMode, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResendStatus("");
    try {
      const result = await login(email.trim(), password);
      if (result === "ok") {
        await new Promise((r) => setTimeout(r, 100));
        const { onboardingComplete: done, isAuthenticated: authed } = useAppStore.getState();
        if (!authed) {
          setError("Login succeeded but profile could not load. Run supabase/auth-fix.sql in Supabase SQL Editor.");
          return;
        }
        router.push(done ? "/dashboard" : "/onboarding");
        return;
      }
      if (result === "email_not_confirmed") {
        setVerifyOpen(true);
        return;
      }
      setError("Invalid email or password.");
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setResendStatus("");
    const ok = await resendVerificationEmail(email.trim());
    setResending(false);
    setResendStatus(
      ok
        ? "Verification email sent. Check your inbox (and spam)."
        : "Could not resend right now. Wait a minute and try again."
    );
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
          {configIssue && (
            <p className="text-sm text-arc-gold bg-arc-gold/10 border border-arc-gold/20 rounded-xl p-3">
              {configIssue}
            </p>
          )}
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <p className="text-sm text-arc-danger">{error}</p>}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-arc-muted cursor-pointer">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="rounded" />
              Remember me
            </label>
          </div>
          <Button type="submit" className="w-full" loading={loading}>
            Sign In
          </Button>
        </form>

        {!isSupabaseConfigured() && (
          <p className="text-center text-xs text-arc-muted">Demo mode — use any password with anand@demo.com</p>
        )}

        <p className="text-center text-sm text-arc-muted">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-frost-400 hover:underline">
            Sign up
          </Link>
        </p>
      </div>

      <Modal open={verifyOpen} onClose={() => setVerifyOpen(false)} title="Verify your email">
        <div className="space-y-4 text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-frost-400/10 flex items-center justify-center">
            <Mail className="text-frost-300" size={28} />
          </div>
          <p className="text-sm text-arc-muted">
            Your account for <span className="text-white font-medium">{email.trim()}</span> is not verified yet.
          </p>
          <p className="text-sm text-arc-muted">
            Open the verification link we sent you, then try signing in again.
          </p>
          {resendStatus && (
            <p className={`text-sm ${resendStatus.startsWith("Verification") ? "text-arc-success" : "text-arc-danger"}`}>
              {resendStatus}
            </p>
          )}
          <div className="flex flex-col gap-2">
            <Button className="w-full" variant="secondary" loading={resending} onClick={handleResend}>
              Resend verification email
            </Button>
            <Button className="w-full" onClick={() => setVerifyOpen(false)}>
              Got it
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
