"use client";

import { useState } from "react";
import Link from "next/link";
import { Zap, Mail, ArrowRight, CheckCircle } from "lucide-react";
import { resetPassword } from "@/lib/db/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) { setError("Please enter your email."); return; }
    setLoading(true);
    setError("");

    const { error: authError } = await resetPassword(email.trim());
    setLoading(false);

    if (authError) {
      setError(authError.message);
    } else {
      setDone(true);
    }
  }

  return (
    <div className="min-h-screen hero-bg flex items-center justify-center px-4 py-16">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="orb-a absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-blue-600/15 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md animate-slide-up">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-extrabold gradient-text">AppNex</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-white">Reset your password</h1>
          <p className="mt-1 text-sm text-gray-400">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        <div className="glass rounded-3xl p-8 shadow-2xl">
          {done ? (
            <div className="text-center py-4 animate-fade-in">
              <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-500/20 border border-green-500/30">
                <CheckCircle className="h-7 w-7 text-green-400" />
              </div>
              <h2 className="text-lg font-bold text-white mb-2">Check your inbox</h2>
              <p className="text-sm text-gray-400 mb-1">
                We sent a reset link to <span className="text-white font-medium">{email}</span>.
              </p>
              <p className="text-xs text-gray-500">
                The link expires in 1 hour.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
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
                    className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/60 transition-all"
                    autoComplete="email"
                    required
                  />
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
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
              >
                {loading
                  ? <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  : <><span>Send reset link</span><ArrowRight className="h-4 w-4" /></>
                }
              </button>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Remember your password?{" "}
          <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
