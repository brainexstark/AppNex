import type { AppMetadata, AppType, ExtractResult } from "./types";

function resolveUrl(base: string, path: string): string {
  try {
    return new URL(path, base).href;
  } catch {
    return path;
  }
}

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export async function extractAppMetadata(url: string): Promise<ExtractResult> {
  if (!isValidUrl(url)) {
    return { success: false, error: "Invalid URL. Please enter a valid http/https URL." };
  }

  // APK detection
  if (url.toLowerCase().endsWith(".apk")) {
    return {
      success: true,
      data: {
        name: url.split("/").pop()?.replace(".apk", "") ?? "Android App",
        description: "Android application package",
        icon: "",
        type: "apk",
      },
    };
  }

  try {
    const res = await fetch(`/api/extract?url=${encodeURIComponent(url)}`);
    if (!res.ok) {
      const err = await res.json();
      return { success: false, error: err.error ?? "Failed to extract metadata" };
    }
    const data: AppMetadata = await res.json();
    return { success: true, data };
  } catch (e) {
    return { success: false, error: "Network error while extracting metadata." };
  }
}
