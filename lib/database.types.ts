/**
 * AppNex — Supabase Database Types
 * Auto-generated shape matching supabase/schema.sql
 * Use these with createClient<Database>() for full type safety.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      // ── profiles ──────────────────────────────────────────
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          website: string | null;
          plan: "free" | "pro" | "team" | "enterprise";
          app_count: number;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          website?: string | null;
          plan?: "free" | "pro" | "team" | "enterprise";
          app_count?: number;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          website?: string | null;
          plan?: "free" | "pro" | "team" | "enterprise";
          updated_at?: string;
        };
      };

      // ── apps ──────────────────────────────────────────────
      apps: {
        Row: {
          id: string;
          owner_id: string | null;
          name: string;
          description: string;
          type: "pwa" | "apk" | "web";
          url: string;
          icon: string;
          theme_color: string | null;
          install_count: number;
          view_count: number;
          is_featured: boolean;
          is_published: boolean;
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id?: string | null;
          name: string;
          description?: string;
          type: "pwa" | "apk" | "web";
          url: string;
          icon?: string;
          theme_color?: string | null;
          install_count?: number;
          view_count?: number;
          is_featured?: boolean;
          is_published?: boolean;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string;
          type?: "pwa" | "apk" | "web";
          url?: string;
          icon?: string;
          theme_color?: string | null;
          is_featured?: boolean;
          is_published?: boolean;
          tags?: string[];
          updated_at?: string;
        };
      };

      // ── reviews ───────────────────────────────────────────
      reviews: {
        Row: {
          id: string;
          app_id: string;
          user_id: string;
          rating: 1 | 2 | 3 | 4 | 5;
          body: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          app_id: string;
          user_id: string;
          rating: 1 | 2 | 3 | 4 | 5;
          body?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          rating?: 1 | 2 | 3 | 4 | 5;
          body?: string | null;
          updated_at?: string;
        };
      };

      // ── install_events ────────────────────────────────────
      install_events: {
        Row: {
          id: number;
          app_id: string;
          user_id: string | null;
          platform: "web" | "android" | "ios" | "desktop" | "unknown" | null;
          ip_hash: string | null;
          created_at: string;
        };
        Insert: {
          app_id: string;
          user_id?: string | null;
          platform?: "web" | "android" | "ios" | "desktop" | "unknown" | null;
          ip_hash?: string | null;
          created_at?: string;
        };
        Update: Record<string, never>; // immutable
      };

      // ── saved_apps ────────────────────────────────────────
      saved_apps: {
        Row: {
          user_id: string;
          app_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          app_id: string;
          created_at?: string;
        };
        Update: Record<string, never>; // immutable
      };

      // ── notifications ─────────────────────────────────────
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: "review" | "install" | "system" | "welcome";
          title: string;
          body: string | null;
          is_read: boolean;
          meta: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: "review" | "install" | "system" | "welcome";
          title: string;
          body?: string | null;
          is_read?: boolean;
          meta?: Json | null;
          created_at?: string;
        };
        Update: {
          is_read?: boolean;
        };
      };
    };

    Views: {
      apps_with_stats: {
        Row: {
          id: string;
          owner_id: string | null;
          name: string;
          description: string;
          type: "pwa" | "apk" | "web";
          url: string;
          icon: string;
          theme_color: string | null;
          install_count: number;
          view_count: number;
          is_featured: boolean;
          is_published: boolean;
          tags: string[];
          created_at: string;
          updated_at: string;
          owner_name: string | null;
          owner_avatar: string | null;
          avg_rating: number;
          review_count: number;
        };
      };
    };

    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// ── Convenience row types ──────────────────────────────────────
export type Profile      = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];
export type App          = Database["public"]["Tables"]["apps"]["Row"];
export type AppInsert    = Database["public"]["Tables"]["apps"]["Insert"];
export type AppUpdate    = Database["public"]["Tables"]["apps"]["Update"];
export type Review       = Database["public"]["Tables"]["reviews"]["Row"];
export type ReviewInsert = Database["public"]["Tables"]["reviews"]["Insert"];
export type InstallEvent = Database["public"]["Tables"]["install_events"]["Row"];
export type InstallEventInsert = Database["public"]["Tables"]["install_events"]["Insert"];
export type SavedApp     = Database["public"]["Tables"]["saved_apps"]["Row"];
export type Notification = Database["public"]["Tables"]["notifications"]["Row"];
export type AppWithStats = Database["public"]["Views"]["apps_with_stats"]["Row"];
