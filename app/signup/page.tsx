"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Zap, Mail, Lock, Eye, EyeOff, User,
  ArrowRight, Code2, CheckCircle,
} from "lucide-react";
import { signUp, signInWithGitHub } from "@/lib/db/auth";

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
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    setError("");

    const { data, error: authError } = await signUp(email.trim(), password, name.trim());

    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    // If email confirmation is disabled in Supabase, user is immediately active
    if (data?.session) {
      router.push("/dashboard");
      router.refresh();
    } else {
      // Email confirmation required
      setDone(true);
    }
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

  return (
    <div className="min-h-screen hero-bg flex items-center justify-center px-4 py-16">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="orb-a absolute -top-40 right-0 h-[500px] w-[500px] rounded-full bg-purple-600/15 blur-[100px]" />
        <div className="orb-b absolute bottom-0 -left-40 h-[400px] w-[400px] rounded-full bg-blue-600/15 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-lg animate-slide-up">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg group-hover:shadow-blue-500/40 transition-all">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-extrabold gradient-text">AppNex</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-white">Create your account</h1>
          <p className="mt-1 text-sm text-gray-400">
            Join thousands of developers distributing apps on AppNex
          </p>
        </div>

        {done ? (
          <div className="glass rounded-3xl p-10 text-center shadow-2xl animate-fade-in">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 border border-green-500/30">
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Check your email!</h2>
            <p className="text-sm text-gray-400 mb-2">
              We sent a confirmation link to <span className="text-white font-medium">{email}</span>.
            </p>
            <p className="text-xs text-gray-500 mb-6">
              Click the link in the email to activate your account, then log in.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-blue-500/30 transition-all hover:scale-105"
            >
              Go to login <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
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

            {/* GitHub OAuth */}
            <button
              onClick={handleGitHub}
              disabled={oauthLoading}
              className="w-full flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-gray-200 hover:bg-white/10 transition-all mb-5 disabled:opacity-60"
            >
              {oauthLoading
                ? <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                : <Code2 className="h-4 w-4" />
              }
              Sign up with GitHub
            </button>

            <div className="relative mb-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/8" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-[#12122A] px-3 text-xs text-gray-500">or with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Full name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Smith"
                    className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/60 focus:bg-white/8 transition-all"
                    autoComplete="name"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/60 focus:bg-white/8 transition-all"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-10 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/60 focus:bg-white/8 transition-all"
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
                      <div
                        key={n}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          password.length >= n * 3
                            ? n <= 1
                              ? "bg-red-500"
                              : n <= 2
                              ? "bg-yellow-500"
                              : n <= 3
                              ? "bg-blue-500"
                              : "bg-green-500"
                            : "bg-white/10"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {error && (
                <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <p className="text-[11px] text-gray-600">
                By signing up you agree to our{" "}
                <Link href="/support" className="text-blue-400 hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/support" className="text-blue-400 hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <>
                    Create account <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
