import { SupportedPlatform } from "@/utils/url-validator";

export type SearchPlatformKey = SupportedPlatform | "default";

export const SEARCH_PROGRESS_DURATION_MS = 8000;

export const SEARCH_STATUS_BY_PLATFORM: Record<SearchPlatformKey, readonly string[]> = {
  default: [
    "Verificando enlace...",
    "Extrayendo contenido...",
    "Preparando descarga...",
  ],
  tiktok: [
    "Verificando enlace...",
    "Extrayendo video...",
    "Preparando descarga...",
  ],
  instagram: [
    "Conectando con post...",
    "Obteniendo multimedia...",
    "Preparando descarga...",
  ],
  youtube: [
    "Analizando stream...",
    "Obteniendo formatos...",
    "Preparando descarga...",
  ],
};

export function getSearchStatusMessages(
  platform?: SupportedPlatform | null
): string[] {
  const list =
    (platform && SEARCH_STATUS_BY_PLATFORM[platform]) ||
    SEARCH_STATUS_BY_PLATFORM.default;

  return list.length > 0 ? [...list] : [...SEARCH_STATUS_BY_PLATFORM.default];
}