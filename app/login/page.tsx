"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { signIn, signInWithGoogle, signInWithGitHub } from "@/lib/db/auth";
import Image from "next/image";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/apps";
  const callbackError = searchParams.get("error");

  const [tab, setTab] = useState<"oauth" | "email">("oauth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState(
    callbackError ? "Sign-in failed. Please try again." : ""
  );
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    import("@/lib/supabase/client").then(({ createClient }) => {
      createClient().auth.getSession().then(({ data: { session } }) => {
        if (session) router.replace(next === "/login" ? "/apps" : next);
        else setChecking(false);
      });
    });
  }, [next, router]);

  async function handleGoogle() {
    setLoading("google"); setError("");
    const { error: e } = await signInWithGoogle();
    if (e) { setLoading(null); setError(e.message); }
  }

  async function handleGitHub() {
    setLoading("github"); setError("");
    const { error: e } = await signInWithGitHub();
    if (e) { setLoading(null); setError(e.message); }
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) { setError("Please fill in both fields."); return; }
    setLoading("email"); setError("");
    const { error: authError } = await signIn(email, password);
    if (authError) {
      setLoading(null);
      const msg = authError.message.toLowerCase();
      setError(
        msg.includes("invalid") || msg.includes("credentials") ? "Wrong email or password." :
        msg.includes("not confirmed") ? "Please confirm your email first." :
        authError.message
      );
      return;
    }
    const dest = !next || next === "/login" || next === "/signup" ? "/apps" : next;
    router.push(dest); router.refresh();
  }

  if (checking) return (
    <div className="min-h-screen hero-bg flex items-center justify-center">
      <span className="h-8 w-8 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen hero-bg flex items-center justify-center px-4 py-12">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="orb-a absolute -top-40 -left-32 h-[500px] w-[500px] rounded-full bg-blue-600/15 blur-[100px]" />
        <div className="orb-b absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-purple-600/15 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-sm animate-slide-up">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="h-12 w-12 rounded-2xl overflow-hidden shadow-xl group-hover:shadow-blue-500/30 transition-all group-hover:scale-105">
              <Image src="/icons/icon-96.png" alt="AppNex" width={48} height={48} className="rounded-2xl" />
            </div>
            <span className="text-3xl font-extrabold gradient-text">AppNex</span>
          </Link>
          <h1 className="mt-5 text-xl font-bold text-white">Sign in to continue</h1>
          <p className="mt-1 text-sm text-gray-400">
            Access the app store for everything
          </p>
        </div>

        <div className="glass rounded-3xl p-6 shadow-2xl space-y-3">
          {/* Google — primary, most prominent */}
          <button
            onClick={handleGoogle}
            disabled={!!loading}
            className="w-full flex items-center gap-3 rounded-2xl border border-white/10 bg-white px-4 py-3.5 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 shadow-lg"
          >
            {loading === "google"
              ? <span className="h-5 w-5 rounded-full border-2 border-gray-300 border-t-blue-500 animate-spin flex-shrink-0" />
              : (
                <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
            <span className="flex-1 text-center">Continue with Google</span>
          </button>

          {/* GitHub */}
          <button
            onClick={handleGitHub}
            disabled={!!loading}
            className="w-full flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-gray-200 hover:bg-white/10 transition-all disabled:opacity-60"
          >
            {loading === "github"
              ? <span className="h-5 w-5 rounded-full border-2 border-white/20 border-t-white animate-spin flex-shrink-0" />
              : (
                <svg className="h-5 w-5 flex-shrink-0 fill-white" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                </svg>
              )}
            <span className="flex-1 text-center">Continue with GitHub</span>
          </button>

          {/* Divider */}
          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/8" />
            </div>
            <div className="relative flex justify-center">
              <button
                onClick={() => setTab(tab === "oauth" ? "email" : "oauth")}
                className="bg-[#12122A] px-3 text-xs text-gray-500 hover:text-blue-400 transition-colors"
              >
                {tab === "oauth" ? "or sign in with email →" : "← back to quick sign in"}
              </button>
            </div>
          </div>

          {/* Email form — shown only when user explicitly chooses it */}
          {tab === "email" && (
            <form onSubmit={handleEmail} className="space-y-3 animate-fade-in">
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address" autoComplete="email" required
                  className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/60 transition-all"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password" autoComplete="current-password" required
                  className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-10 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/60 transition-all"
                />
                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="flex justify-end">
                <Link href="/forgot-password" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">Forgot password?</Link>
              </div>
              <button
                type="submit" disabled={loading === "email"}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-blue-500/30 transition-all hover:scale-[1.02] disabled:opacity-60"
              >
                {loading === "email"
                  ? <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  : <><span>Sign in</span><ArrowRight className="h-4 w-4" /></>}
              </button>
            </form>
          )}

          {error && (
            <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-3 py-2.5 text-center">
              {error}
            </p>
          )}
        </div>

        <p className="mt-5 text-center text-sm text-gray-500">
          New to AppNex?{" "}
          <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen hero-bg flex items-center justify-center"><span className="h-8 w-8 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
