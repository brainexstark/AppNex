"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/context/AuthContext";
import {
  User, Mail, Globe, FileText, Camera,
  CheckCircle, Loader2, ArrowLeft, Lock, AlertTriangle,
} from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState({ full_name: "", bio: "", website: "" });
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [pwForm, setPwForm] = useState({ next: "", confirm: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwDone, setPwDone] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) router.push("/login?next=/settings");
  }, [user, loading, router]);

  // Load profile — supabase client created inside effect
  useEffect(() => {
    if (!user) return;
    import("@/lib/supabase/client").then(({ createClient }) => {
      createClient()
        .from("profiles")
        .select("full_name, bio, website, avatar_url")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            const d = data as Record<string, string | null>;
            setProfile({
              full_name: d.full_name ?? "",
              bio: d.bio ?? "",
              website: d.website ?? "",
            });
            setAvatarUrl(d.avatar_url ?? "");
          }
        });
    });
  }, [user]);

  const handleAvatarUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setAvatarUploading(true);
    setError("");

    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("app-icons")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setError("Upload failed: " + uploadError.message);
      setAvatarUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("app-icons").getPublicUrl(path);
    await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", user.id);
    setAvatarUrl(publicUrl);
    setAvatarUploading(false);
  }, [user]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError("");
    setSaved(false);

    const { createClient } = await import("@/lib/supabase/client");
    const { error: updateError } = await createClient()
      .from("profiles")
      .update({
        full_name: profile.full_name.trim(),
        bio: profile.bio.trim(),
        website: profile.website.trim(),
      })
      .eq("id", user.id);

    setSaving(false);
    if (updateError) {
      setError(updateError.message);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pwForm.next !== pwForm.confirm) { setPwError("Passwords do not match."); return; }
    if (pwForm.next.length < 8) { setPwError("Password must be at least 8 characters."); return; }
    setPwLoading(true);
    setPwError("");

    const { createClient } = await import("@/lib/supabase/client");
    const { error: pwUpdateError } = await createClient().auth.updateUser({ password: pwForm.next });

    setPwLoading(false);
    if (pwUpdateError) {
      setPwError(pwUpdateError.message);
    } else {
      setPwDone(true);
      setPwForm({ next: "", confirm: "" });
      setTimeout(() => setPwDone(false), 4000);
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#0F0F1A] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  const userInitial = (profile.full_name || user.email || "U")[0].toUpperCase();

  return (
    <div className="min-h-screen bg-[#0F0F1A]">
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors mb-8 group">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to dashboard
        </Link>

        <h1 className="text-2xl font-extrabold text-white mb-8">Account Settings</h1>

        {/* Profile */}
        <section className="rounded-3xl border border-white/8 bg-[#1A1A2E] p-6 mb-6">
          <h2 className="text-base font-bold text-white mb-5">Profile</h2>

          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="Avatar" className="h-16 w-16 rounded-2xl object-cover ring-2 ring-white/10" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-2xl font-extrabold text-white">
                  {userInitial}
                </div>
              )}
              <button
                onClick={() => fileRef.current?.click()}
                disabled={avatarUploading}
                className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 hover:bg-blue-400 transition-colors shadow-lg"
                aria-label="Upload avatar"
              >
                {avatarUploading ? <Loader2 className="h-3 w-3 text-white animate-spin" /> : <Camera className="h-3 w-3 text-white" />}
              </button>
              <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleAvatarUpload} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{profile.full_name || "Your Name"}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            {[
              { label: "Full name", field: "full_name", icon: User, type: "text", placeholder: "Your full name" },
              { label: "Website", field: "website", icon: Globe, type: "url", placeholder: "https://yoursite.com" },
            ].map(({ label, field, icon: Icon, type, placeholder }) => (
              <div key={field}>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input
                    type={type}
                    value={profile[field as keyof typeof profile]}
                    onChange={(e) => setProfile({ ...profile, [field]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/60 transition-all"
                  />
                </div>
              </div>
            ))}

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input type="email" value={user.email ?? ""} disabled className="w-full rounded-xl bg-white/3 border border-white/5 pl-10 pr-4 py-2.5 text-sm text-gray-500 cursor-not-allowed" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Bio</label>
              <div className="relative">
                <FileText className="absolute left-3.5 top-3 h-4 w-4 text-gray-500" />
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="A short bio…"
                  rows={3}
                  maxLength={300}
                  className="w-full resize-none rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/60 transition-all"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2 flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />{error}
              </p>
            )}

            <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-blue-500/30 transition-all hover:scale-[1.02] disabled:opacity-60">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <><CheckCircle className="h-4 w-4" /> Saved!</> : "Save changes"}
            </button>
          </form>
        </section>

        {/* Change password */}
        <section className="rounded-3xl border border-white/8 bg-[#1A1A2E] p-6">
          <h2 className="text-base font-bold text-white mb-5">Change Password</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            {(["next", "confirm"] as const).map((field) => (
              <div key={field}>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  {field === "next" ? "New password" : "Confirm new password"}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input
                    type="password"
                    value={pwForm[field]}
                    onChange={(e) => setPwForm({ ...pwForm, [field]: e.target.value })}
                    placeholder="••••••••"
                    className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/60 transition-all"
                    required
                  />
                </div>
              </div>
            ))}
            {pwError && <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{pwError}</p>}
            {pwDone && <p className="text-xs text-green-400 bg-green-400/10 border border-green-400/20 rounded-lg px-3 py-2 flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5" />Password updated.</p>}
            <button type="submit" disabled={pwLoading} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-all disabled:opacity-60">
              {pwLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update password"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
