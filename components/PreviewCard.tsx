"use client";

import { useState } from "react";
import { CheckCircle, Loader2, Globe, Smartphone, Package, Edit2 } from "lucide-react";
import AppIcon from "./AppIcon";
import type { AppMetadata } from "@/lib/types";

interface PreviewCardProps {
  url: string;
  data: AppMetadata;
  onSubmit: (name: string, description: string) => Promise<void>;
}

const typeConfig = {
  pwa: { label: "Progressive Web App", icon: Smartphone, color: "text-blue-400" },
  apk: { label: "Android APK", icon: Package, color: "text-green-400" },
  web: { label: "Web App", icon: Globe, color: "text-purple-400" },
};

export default function PreviewCard({ url, data, onSubmit }: PreviewCardProps) {
  const [name, setName] = useState(data.name || "");
  const [description, setDescription] = useState(data.description || "");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [editingName, setEditingName] = useState(false);

  const type = typeConfig[data.type] ?? typeConfig.web;
  const TypeIcon = type.icon;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    await onSubmit(name.trim(), description.trim());
    setSubmitting(false);
    setSubmitted(true);
  }

  return (
    <div className="w-full max-w-md mx-auto animate-slide-up">
      <div className="rounded-2xl border border-[#2A2A4A] bg-[#1A1A2E] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-5 py-3 border-b border-[#2A2A4A] flex items-center justify-between">
          <span className="text-xs font-medium text-gray-400">App Preview</span>
          <span className={`flex items-center gap-1 text-xs font-semibold ${type.color}`}>
            <TypeIcon className="h-3 w-3" />
            {type.label}
          </span>
        </div>

        {/* Preview body */}
        <div className="p-6">
          <div className="flex items-start gap-4 mb-5">
            <AppIcon src={data.icon} name={name} size={64} className="flex-shrink-0 shadow-lg" />
            <div className="flex-1 min-w-0">
              {/* Editable name */}
              {editingName ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => setEditingName(false)}
                  autoFocus
                  className="w-full bg-[#0F0F1A] border border-blue-500/50 rounded-lg px-2 py-1 text-sm font-semibold text-white outline-none"
                  aria-label="App name"
                />
              ) : (
                <button
                  onClick={() => setEditingName(true)}
                  className="group flex items-center gap-1.5 text-left"
                  aria-label="Edit app name"
                >
                  <span className="text-base font-semibold text-white leading-tight line-clamp-1">
                    {name || "Unnamed App"}
                  </span>
                  <Edit2 className="h-3 w-3 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </button>
              )}
              <p className="text-xs text-gray-500 mt-0.5 truncate">{url}</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Short description of the app…"
                className="w-full resize-none rounded-xl bg-[#0F0F1A] border border-[#2A2A4A] px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/60 transition-colors"
                aria-label="App description"
              />
            </div>

            {submitted ? (
              <div className="flex items-center justify-center gap-2 rounded-xl bg-green-500/10 border border-green-500/20 py-3 text-sm font-semibold text-green-400">
                <CheckCircle className="h-4 w-4" />
                App submitted successfully!
              </div>
            ) : (
              <button
                type="submit"
                disabled={submitting || !name.trim()}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  "Submit App"
                )}
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
