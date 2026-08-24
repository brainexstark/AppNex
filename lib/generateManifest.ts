export interface ManifestIcon {
  src: string;
  sizes: string;
  type: string;
  purpose?: string;
}

export interface GenerateManifestOptions {
  id?: string;
  name: string;
  shortName?: string;
  description?: string;
  url: string;
  icon?: string;
  themeColor?: string;
  backgroundColor?: string;
  display?: "standalone" | "fullscreen" | "minimal-ui" | "browser";
  orientation?: "any" | "natural" | "landscape" | "portrait" | "portrait-primary" | "portrait-secondary" | "landscape-primary" | "landscape-secondary";
  scope?: string;
  startUrl?: string;
  preferRelatedApplications?: boolean;
  screenshots?: Array<{ src: string; sizes?: string; type?: string }>;
}

export interface PwaManifest {
  id: string;
  name: string;
  short_name: string;
  description: string;
  start_url: string;
  scope: string;
  display: string;
  background_color: string;
  theme_color: string;
  orientation: string;
  icons: ManifestIcon[];
  screenshots?: Array<{ src: string; sizes?: string; type?: string }>;
  prefer_related_applications: boolean;
}

const DEFAULT_ICONS: ManifestIcon[] = [
  { src: "/icons/icon-36.png", sizes: "36x36", type: "image/png" },
  { src: "/icons/icon-48.png", sizes: "48x48", type: "image/png" },
  { src: "/icons/icon-72.png", sizes: "72x72", type: "image/png" },
  { src: "/icons/icon-96.png", sizes: "96x96", type: "image/png" },
  { src: "/icons/icon-128.png", sizes: "128x128", type: "image/png" },
  { src: "/icons/icon-144.png", sizes: "144x144", type: "image/png" },
  { src: "/icons/icon-152.png", sizes: "152x152", type: "image/png" },
  { src: "/icons/android-chrome-192x192.png", sizes: "192x192", type: "image/png", purpose: "any" },
  { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
  { src: "/icons/icon-256.png", sizes: "256x256", type: "image/png" },
  { src: "/icons/icon-384.png", sizes: "384x384", type: "image/png" },
  { src: "/icons/android-chrome-512x512.png", sizes: "512x512", type: "image/png", purpose: "any" },
  { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
  { src: "/icons/android-chrome-512x512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
  { src: "/icons/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
];

function buildIcons(customIcon?: string): ManifestIcon[] {
  const hasCustom = !!(customIcon && customIcon.trim().startsWith("http"));
  const icons: ManifestIcon[] = [];

  if (hasCustom) {
    icons.push({
      src: customIcon!,
      sizes: "192x192",
      type: "image/png",
      purpose: "any",
    });
    icons.push({
      src: customIcon!,
      sizes: "512x512",
      type: "image/png",
      purpose: "any maskable",
    });
  }

  icons.push(...DEFAULT_ICONS);
  return icons;
}

function truncate(str: string, max: number): string {
  return (str ?? "").slice(0, max);
}

export function generateManifest(options: GenerateManifestOptions): PwaManifest {
  const {
    id,
    name,
    shortName,
    description,
    url,
    icon,
    themeColor = "#3B82F6",
    backgroundColor = "#0F0F1A",
    display = "standalone",
    orientation = "any",
    scope,
    startUrl,
    preferRelatedApplications = false,
    screenshots,
  } = options;

  const safeName = truncate(name || "App", 45);
  const safeShortName = truncate(shortName || name || "App", 12);

  const manifestScope = scope || (id ? `/app/${id}` : "/");
  const manifestStartUrl = startUrl || url;

  const manifest: PwaManifest = {
    id: id ? `/app/${id}` : manifestScope,
    name: safeName,
    short_name: safeShortName,
    description: description || `Open ${safeName}`,
    start_url: manifestStartUrl,
    scope: manifestScope,
    display,
    background_color: backgroundColor,
    theme_color: themeColor,
    orientation,
    icons: buildIcons(icon),
    prefer_related_applications: preferRelatedApplications,
  };

  if (screenshots && screenshots.length > 0) {
    manifest.screenshots = screenshots;
  }

  return manifest;
}

export function generateManifestString(options: GenerateManifestOptions): string {
  return JSON.stringify(generateManifest(options), null, 2);
}

export function generateManifestResponse(options: GenerateManifestOptions): Response {
  const body = generateManifestString(options);
  return new Response(body, {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "public, max-age=60, stale-while-revalidate=30",
    },
  });
}

export { DEFAULT_ICONS };
