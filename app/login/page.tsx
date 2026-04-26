"use client";

import { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight, Code2 } from "lucide-react";
import { signIn, signInWithGitHub } from "@/lib/db/auth";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Default redirect is homepage, not dashboard
  const next = searchParams.get("next") ?? "/";
  const callbackError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState(
    callbackError === "auth_callback_failed" ? "Authentication failed. Please try again." : ""
  );

  // If already logged in, redirect away — client-side only (no middleware race)
  useEffect(() => {
    import("@/lib/supabase/client").then(({ createClient }) => {
      createClient().auth.getSession().then(({ data: { session } }) => {
        if (session) {
          router.replace(next === "/login" ? "/" : next);
        } else {
          setCheckingSession(false);
        }
      });
    });
  }, [next, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    setError("");

    const { error: authError } = await signIn(email, password);

    if (authError) {
      setLoading(false);
      const msg = authError.message.toLowerCase();
      if (msg.includes("invalid login") || msg.includes("invalid credentials") || msg.includes("wrong password")) {
        setError("Incorrect email or password.");
      } else if (msg.includes("email not confirmed") || msg.includes("not confirmed")) {
        setError("Please confirm your email first. Check your inbox for a confirmation link.");
      } else {
        setError(authError.message);
      }
      return;
    }

    // Session set — go to intended page
    const destination = !next || next === "/login" || next === "/signup" ? "/" : next;
    router.push(destination);
    router.refresh();
  }

  async function handleGitHub() {
    setOauthLoading(true);
    setError("");
    const { error: authError } = await signInWithGitHub();
    if (authError) {
      setOauthLoading(false);
      setError(authError.message);
    }
  }

  // Show spinner while checking existing session
  if (checkingSession) {
    return (
      <div className="min-h-screen hero-bg flex items-center justify-center">
        <span className="h-8 w-8 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen hero-bg flex items-center justify-center px-4 py-16">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="orb-a absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-blue-600/15 blur-[100px]" />
        <div className="orb-b absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-purple-600/15 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md animate-slide-up">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg group-hover:shadow-blue-500/40 transition-all">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-extrabold gradient-text">AppNex</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-white">Welcome back</h1>
          <p className="mt-1 text-sm text-gray-400">Sign in to your AppNex account</p>
        </div>

        <div className="glass rounded-3xl p-8 shadow-2xl">
          <button
            onClick={handleGitHub}
            disabled={oauthLoading}
            className="w-full flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-gray-200 hover:bg-white/10 transition-all mb-6 disabled:opacity-60"
          >
            {oauthLoading
              ? <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              : <Code2 className="h-4 w-4" />}
            Continue with GitHub
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/8" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#12122A] px-3 text-xs text-gray-500">or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/60 transition-all"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-gray-400">Password</label>
                <Link href="/forgot-password" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-10 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/60 transition-all"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading
                ? <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                : <><span>Sign in</span><ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen hero-bg flex items-center justify-center">
        <span className="h-8 w-8 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
