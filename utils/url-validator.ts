export type SupportedPlatform = "tiktok" | "instagram" | "youtube";

export interface UrlValidationResult {
  isValid: boolean;
  cleanUrl: string | null;
  platform: SupportedPlatform | null;
  errorTitle?: string;
  errorDescription?: string;
}

const ACTIVE_PLATFORMS: SupportedPlatform[] = ["tiktok"];

const TIKTOK_HOSTS = new Set([
  "tiktok.com",
  "www.tiktok.com",
  "m.tiktok.com",
  "vm.tiktok.com",
  "vt.tiktok.com",
]);

const INSTAGRAM_HOSTS = new Set([
  "instagram.com",
  "www.instagram.com",
  "m.instagram.com",
  "instagr.am",
  "www.instagr.am",
]);

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtu.be",
]);

function matchesHostSet(hostname: string, allowed: Set<string>): boolean {
  const host = hostname.toLowerCase();
  if (allowed.has(host)) return true;

  for (const domain of allowed) {
    if (!domain.startsWith("www.") && host.endsWith(`.${domain}`)) {
      return true;
    }
  }
  return false;
}

export function detectPlatform(url: string): SupportedPlatform | null {
  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }

    const host = parsed.hostname.toLowerCase();
    if (matchesHostSet(host, TIKTOK_HOSTS)) return "tiktok";
    if (matchesHostSet(host, INSTAGRAM_HOSTS)) return "instagram";
    if (matchesHostSet(host, YOUTUBE_HOSTS)) return "youtube";

    return null;
  } catch {
    return null;
  }
}

export function extractCleanUrl(rawInput: string): string | null {
  if (typeof rawInput !== "string") return null;

  const token = rawInput
    .trim()
    .split(/\s+/)
    .find((part) => /^https?:\/\//i.test(part));

  if (!token) return null;

  const trimmedToken = token.replace(/[),.;!?]+$/, "");

  try {
    const parsed = new URL(trimmedToken);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }

    const host = parsed.hostname.toLowerCase();
    const isShortTikTok = host === "vm.tiktok.com" || host === "vt.tiktok.com";

    if (matchesHostSet(host, TIKTOK_HOSTS) && !isShortTikTok) {
      return `${parsed.origin}${parsed.pathname}`;
    }

    return parsed.toString();
  } catch {
    return null;
  }
}

export function validateMediaUrl(rawInput: string): UrlValidationResult {
  const cleanUrl = extractCleanUrl(rawInput);

  if (!cleanUrl) {
    return {
      isValid: false,
      cleanUrl: null,
      platform: null,
      errorTitle: "Enlace incompleto",
      errorDescription:
        "Ingresa una URL válida que comience con http:// o https://.",
    };
  }

  const platform = detectPlatform(cleanUrl);

  if (!platform) {
    return {
      isValid: false,
      cleanUrl,
      platform: null,
      errorTitle: "Plataforma no reconocida",
      errorDescription:
        "Verifica que el enlace corresponda a una red social compatible.",
    };
  }

  if (!ACTIVE_PLATFORMS.includes(platform)) {
    const label =
      platform === "instagram"
        ? "Instagram"
        : platform === "youtube"
          ? "YouTube"
          : platform;

    return {
      isValid: false,
      cleanUrl,
      platform,
      errorTitle: `${label} estará disponible pronto`,
      errorDescription: "Por el momento estamos procesando enlaces de TikTok.",
    };
  }

  return {
    isValid: true,
    cleanUrl,
    platform,
  };
}