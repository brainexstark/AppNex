"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Zap, Lock, Eye, EyeOff, CheckCircle, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  // Supabase sends the token in the URL hash — exchange it for a session
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        // User is now in password recovery mode — form is ready
      }
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }

    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    setLoading(false);
    if (updateError) {
      setError(updateError.message);
    } else {
      setDone(true);
      setTimeout(() => router.push("/login"), 2500);
    }
  }

  return (
    <div className="min-h-screen hero-bg flex items-center justify-center px-4 py-16">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="orb-b absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-purple-600/15 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md animate-slide-up">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-extrabold gradient-text">AppNex</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-white">Set new password</h1>
          <p className="mt-1 text-sm text-gray-400">Choose a strong password for your account.</p>
        </div>

        <div className="glass rounded-3xl p-8 shadow-2xl">
          {done ? (
            <div className="text-center py-4 animate-fade-in">
              <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-500/20 border border-green-500/30">
                <CheckCircle className="h-7 w-7 text-green-400" />
              </div>
              <h2 className="text-lg font-bold text-white mb-2">Password updated!</h2>
              <p className="text-sm text-gray-400">Redirecting you to login…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { label: "New password", field: "password", value: password, setter: setPassword },
                { label: "Confirm password", field: "confirm", value: confirm, setter: setConfirm },
              ].map(({ label, field, value, setter }) => (
                <div key={field}>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">{label}</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                      type={showPw ? "text" : "password"}
                      value={value}
                      onChange={(e) => setter(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-10 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/60 transition-all"
                      required
                    />
                    {field === "password" && (
                      <button
                        type="button"
                        onClick={() => setShowPw((v) => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {error && (
                <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-blue-500/30 transition-all hover:scale-[1.02] disabled:opacity-60"
              >
                {loading
                  ? <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  : <><span>Update password</span><ArrowRight className="h-4 w-4" /></>
                }
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return <Suspense><ResetForm /></Suspense>;
}
