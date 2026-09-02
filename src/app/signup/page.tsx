"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppStore } from "@/store/app-store";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Mail, Snowflake, UserRoundCheck } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

export default function SignupPage() {
  const router = useRouter();
  const signup = useAppStore((s) => s.signup);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [takenOpen, setTakenOpen] = useState(false);
  const [dialogEmail, setDialogEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords don't match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const trimmed = email.trim();
      const result = await signup(name, username, trimmed, password);
      if (result === "verify_email") {
        setDialogEmail(trimmed);
        setVerifyOpen(true);
        return;
      }
      if (result === "email_taken") {
        setDialogEmail(trimmed);
        setTakenOpen(true);
        return;
      }
      if (result === "authenticated") {
        router.push("/onboarding");
        return;
      }
      setError("Signup failed. Username may be taken. Please try again.");
    } catch {
      setError("Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Snowflake className="text-frost-300" size={32} />
            <span className="text-2xl font-bold">{APP_NAME}</span>
          </Link>
          <h1 className="text-2xl font-bold">Start your Winter Arc</h1>
        </div>
        <form onSubmit={handleSubmit} className="glass-strong rounded-2xl p-6 space-y-4">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Input
            label="Confirm Password"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            error={error}
          />
          <Button type="submit" className="w-full" loading={loading}>
            Create Account
          </Button>
        </form>
        <p className="text-center text-sm text-arc-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-frost-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>

      <Modal
        open={verifyOpen}
        onClose={() => {
          setVerifyOpen(false);
          router.push("/login");
        }}
        title="Check your email"
      >
        <div className="space-y-4 text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-frost-400/10 flex items-center justify-center">
            <Mail className="text-frost-300" size={28} />
          </div>
          <p className="text-sm text-arc-muted">
            We sent a verification link to{" "}
            <span className="text-white font-medium">{dialogEmail}</span>.
          </p>
          <p className="text-sm text-arc-muted">
            Open the email and tap the link to activate your account, then come back and sign in.
          </p>
          <p className="text-xs text-arc-muted">
            Don&apos;t see it? Check spam or promotions. The link may take a minute to arrive.
          </p>
          <Button
            className="w-full"
            onClick={() => {
              setVerifyOpen(false);
              router.push("/login");
            }}
          >
            Go to Sign In
          </Button>
        </div>
      </Modal>

      <Modal open={takenOpen} onClose={() => setTakenOpen(false)} title="Email already registered">
        <div className="space-y-4 text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-arc-gold/10 flex items-center justify-center">
            <UserRoundCheck className="text-arc-gold" size={28} />
          </div>
          <p className="text-sm text-arc-muted">
            An account already exists for{" "}
            <span className="text-white font-medium">{dialogEmail}</span>.
          </p>
          <p className="text-sm text-arc-muted">
            Sign in with this email instead. If you haven&apos;t verified yet, check your inbox for the verification link.
          </p>
          <div className="flex flex-col gap-2">
            <Button
              className="w-full"
              onClick={() => {
                setTakenOpen(false);
                router.push("/login");
              }}
            >
              Go to Sign In
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => setTakenOpen(false)}>
              Use a different email
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
