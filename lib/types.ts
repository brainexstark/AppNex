export type AppType = "pwa" | "apk" | "web";

export interface App {
  id: string;
  name: string;
  description: string;
  type: AppType;
  url: string;
  icon: string;
  theme_color?: string;
  created_at: string;
}

export interface AppMetadata {
  name: string;
  description: string;
  icon: string;
  type: AppType;
  theme_color?: string;
}

export interface ExtractResult {
  success: boolean;
  data?: AppMetadata;
  error?: string;
}
