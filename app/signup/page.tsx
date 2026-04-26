"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Zap, Mail, Lock, Eye, EyeOff, User,
  ArrowRight, CheckCircle,
} from "lucide-react";

const PERKS = [
  "Submit unlimited apps",
  "Manage & edit your listings",
  "Realtime install analytics",
  "Priority support",
];

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkingSession, setCheckingSession] = useState(true);

  // If already logged in, redirect to home
  useEffect(() => {
    import("@/lib/supabase/client").then(({ createClient }) => {
      createClient().auth.getSession().then(({ data: { session } }) => {
        if (session) router.replace("/");
        else setCheckingSession(false);
      });
    });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError("");

    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();

    // Step 1: Sign up
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: name.trim() },
        // No emailRedirectTo — we handle redirect ourselves
      },
    });

    if (signUpError) {
      setLoading(false);
      const msg = signUpError.message.toLowerCase();
      if (msg.includes("already registered") || msg.includes("already exists") || msg.includes("user already")) {
        // Account exists — try to sign them in directly
        const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (!signInError) {
          router.push("/");
          router.refresh();
          return;
        }
        setError("An account with this email already exists. Try logging in.");
      } else {
        setError(signUpError.message);
      }
      return;
    }

    // Step 2: If session exists (email confirmation OFF) — go straight in
    if (signUpData?.session) {
      router.push("/");
      router.refresh();
      return;
    }

    // Step 3: Email confirmation is ON — sign in immediately anyway
    // (Supabase allows sign-in even before confirmation in some configs)
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (!signInError) {
      // Signed in successfully — go to home
      router.push("/");
      router.refresh();
    } else {
      // Email confirmation truly required — show a clear message
      setError(
        "Account created! Check your email for a confirmation link, then come back to sign in."
      );
    }
  }

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
        <div className="orb-a absolute -top-40 right-0 h-[500px] w-[500px] rounded-full bg-purple-600/15 blur-[100px]" />
        <div className="orb-b absolute bottom-0 -left-40 h-[400px] w-[400px] rounded-full bg-blue-600/15 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icons/icon-96.png" alt="AppNex" className="h-10 w-10 rounded-xl" />
            </div>
            <span className="text-2xl font-extrabold gradient-text">AppNex</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-white">Create your account</h1>
          <p className="mt-1 text-sm text-gray-400">Join AppNex — free forever</p>
        </div>

        <div className="glass rounded-3xl p-8 shadow-2xl">
          {/* Perks */}
          <div className="mb-6 grid grid-cols-2 gap-2">
            {PERKS.map((p) => (
              <div key={p} className="flex items-center gap-1.5 text-xs text-gray-400">
                <CheckCircle className="h-3.5 w-3.5 text-green-400 flex-shrink-0" />
                {p}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Full name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Smith"
                  className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/60 transition-all"
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            {/* Email */}
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

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-10 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/60 transition-all"
                  autoComplete="new-password"
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
              {/* Strength bar */}
              {password && (
                <div className="mt-2 flex gap-1">
                  {[1, 2, 3, 4].map((n) => (
                    <div key={n} className={`h-1 flex-1 rounded-full transition-all ${
                      password.length >= n * 3
                        ? n <= 1 ? "bg-red-500" : n <= 2 ? "bg-yellow-500" : n <= 3 ? "bg-blue-500" : "bg-green-500"
                        : "bg-white/10"
                    }`} />
                  ))}
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className={`text-xs rounded-lg px-3 py-2.5 border ${
                error.includes("Check your email")
                  ? "text-blue-300 bg-blue-400/10 border-blue-400/20"
                  : "text-red-400 bg-red-400/10 border-red-400/20"
              }`}>
                {error}
                {error.includes("already exists") && (
                  <Link href="/login" className="block mt-1 text-blue-400 hover:underline font-medium">
                    → Sign in instead
                  </Link>
                )}
              </div>
            )}

            <p className="text-[11px] text-gray-600">
              By signing up you agree to our{" "}
              <Link href="/support" className="text-blue-400 hover:underline">Terms</Link>
              {" "}and{" "}
              <Link href="/support" className="text-blue-400 hover:underline">Privacy Policy</Link>.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading
                ? <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                : <>Create account &amp; sign in <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
