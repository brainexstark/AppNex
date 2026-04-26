export type AppType = "pwa" | "apk" | "web" | "store";

export interface App {
  id: string;
  name: string;
  description: string;
  type: AppType;
  url: string;
  icon: string;
  theme_color?: string;
  // Store links for native apps (TikTok, Instagram, etc.)
  store_android?: string | null;
  store_ios?: string | null;
  store_windows?: string | null;
  created_at: string;
}

export interface AppMetadata {
  name: string;
  description: string;
  icon: string;
  type: AppType;
  theme_color?: string;
  store_android?: string | null;
  store_ios?: string | null;
  store_windows?: string | null;
}

export interface ExtractResult {
  success: boolean;
  data?: AppMetadata;
  error?: string;
}
