"use client";

import { useState, useRef, useCallback } from "react";
import { Search, Loader2, X, ArrowRight } from "lucide-react";
import { extractAppMetadata } from "@/lib/extract";
import type { AppMetadata } from "@/lib/types";

interface UrlInputProps {
  onPreview: (url: string, data: AppMetadata) => void;
  onClear: () => void;
}

export default function UrlInput({ onPreview, onClear }: UrlInputProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleExtract = useCallback(
    async (value: string) => {
      if (!value.trim()) {
        setError("");
        onClear();
        return;
      }

      setLoading(true);
      setError("");

      const result = await extractAppMetadata(value.trim());

      setLoading(false);

      if (result.success && result.data) {
        onPreview(value.trim(), result.data);
      } else {
        setError(result.error ?? "Failed to extract app data.");
        onClear();
      }
    },
    [onPreview, onClear]
  );

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setUrl(value);
    setError("");

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value.trim()) {
      onClear();
      return;
    }

    debounceRef.current = setTimeout(() => {
      handleExtract(value);
    }, 800);
  }

  function handleClear() {
    setUrl("");
    setError("");
    onClear();
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      handleExtract(url);
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`relative flex items-center rounded-2xl border bg-[#1A1A2E] transition-all duration-200 ${
          error
            ? "border-red-500/50 shadow-red-500/10 shadow-lg"
            : "border-[#2A2A4A] focus-within:border-blue-500/60 focus-within:shadow-blue-500/10 focus-within:shadow-lg"
        }`}
      >
        {/* Search icon / loader */}
        <div className="pl-4 pr-2 flex-shrink-0">
          {loading ? (
            <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
          ) : (
            <Search className="h-5 w-5 text-gray-500" />
          )}
        </div>

        {/* Input */}
        <input
          type="url"
          value={url}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Paste an app URL — https://example.com or app.apk"
          className="flex-1 bg-transparent py-4 text-sm text-white placeholder-gray-500 outline-none"
          aria-label="App URL"
          autoComplete="off"
          spellCheck={false}
        />

        {/* Clear / submit */}
        <div className="pr-3 flex items-center gap-2">
          {url && (
            <button
              onClick={handleClear}
              className="p-1 text-gray-500 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              aria-label="Clear input"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {url && !loading && (
            <button
              onClick={() => handleExtract(url)}
              className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:shadow-blue-500/30 hover:shadow-md transition-all hover:scale-105 active:scale-95"
              aria-label="Extract app data"
            >
              <ArrowRight className="h-3.5 w-3.5" />
              Extract
            </button>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-2 text-xs text-red-400 pl-4 animate-fade-in" role="alert">
          {error}
        </p>
      )}

      {/* Hint */}
      {!error && !url && (
        <p className="mt-2 text-xs text-gray-500 pl-4">
          Supports PWAs, APK files, and regular web apps
        </p>
      )}
    </div>
  );
}
