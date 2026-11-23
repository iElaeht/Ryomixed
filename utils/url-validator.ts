export type SupportedPlatform = "tiktok" | "instagram" | "youtube";

export interface UrlValidationResult {
  isValid: boolean;
  cleanUrl: string | null;
  platform: SupportedPlatform | null;
  errorTitle?: string;
  errorDescription?: string;
}

const ACTIVE_PLATFORMS: SupportedPlatform[] = ["tiktok"];

export function extractCleanUrl(rawInput: string): string | null {
  const token = rawInput
    .trim()
    .split(/\s+/)
    .find((part) => /^https?:\/\//i.test(part));

  if (!token) return null;

  try {
    const parsed = new URL(token);
    return parsed.toString();
  } catch {
    return null;
  }
}

export function detectPlatform(url: string): SupportedPlatform | null {
  const lower = url.toLowerCase();

  if (
    lower.includes("tiktok.com") ||
    lower.includes("vm.tiktok.com") ||
    lower.includes("vt.tiktok.com")
  ) {
    return "tiktok";
  }

  if (lower.includes("instagram.com") || lower.includes("instagr.am")) {
    return "instagram";
  }

  if (lower.includes("youtube.com") || lower.includes("youtu.be")) {
    return "youtube";
  }

  return null;
}

export function validateMediaUrl(rawInput: string): UrlValidationResult {
  const cleanUrl = extractCleanUrl(rawInput);

  if (!cleanUrl) {
    return {
      isValid: false,
      cleanUrl: null,
      platform: null,
      errorTitle: "Enlace incompleto",
      errorDescription: "Ingresa una URL válida que comience con http:// o https://.",
    };
  }

  const platform = detectPlatform(cleanUrl);

  if (!platform) {
    return {
      isValid: false,
      cleanUrl,
      platform: null,
      errorTitle: "Plataforma no reconocida",
      errorDescription: "Verifica que el enlace corresponda a una red social compatible.",
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