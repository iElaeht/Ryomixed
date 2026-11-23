import { NextResponse } from "next/server";
import { writeLog } from "@/utils/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TIKWM_BASE_URL = "https://tikwm.com";
const REQUEST_TIMEOUT_MS = 25000;

const ALLOWED_TIKTOK_HOSTS = new Set([
  "tiktok.com",
  "www.tiktok.com",
  "m.tiktok.com",
  "vm.tiktok.com",
  "vt.tiktok.com",
]);

// Rate limit simple en memoria por IP (ventana de 60s)
const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 25;
const ipHits = new Map<string, { count: number; resetAt: number }>();

// Deduplicación de peticiones idénticas en vuelo
const inFlightRequests = new Map<string, Promise<Response>>();

interface TikWmPayload {
  code?: number;
  msg?: string;
  data?: {
    title?: string;
    duration?: number;
    cover?: string;
    origin_cover?: string;
    play?: string;
    hdplay?: string;
    hd_play?: string;
    music?: string;
    size?: number;
    hd_size?: number;
    wm_size?: number;
    images?: string[];
    author?: {
      unique_id?: string;
      nickname?: string;
    };
    music_info?: {
      play?: string;
    };
  };
}

function getClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const firstIp = xff.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  return realIp || "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();

  if (ipHits.size > 500) {
    for (const [key, entry] of ipHits.entries()) {
      if (entry.resetAt <= now) {
        ipHits.delete(key);
      }
    }
  }

  const current = ipHits.get(ip);
  if (!current || current.resetAt <= now) {
    ipHits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (current.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  current.count += 1;
  return false;
}

function isSuspiciousBot(request: Request): boolean {
  const ua = (request.headers.get("user-agent") || "").trim().toLowerCase();
  if (!ua || ua.length < 8) return true;

  const botPatterns = [
    "curl/",
    "wget/",
    "python-requests",
    "python-urllib",
    "axios/",
    "go-http-client",
    "scrapy",
    "headlesschrome",
    "phantomjs",
    "selenium",
    "puppeteer",
  ];

  return botPatterns.some((pattern) => ua.includes(pattern));
}

function parseAndNormalizeTikTokUrl(
  rawUrl: unknown
): { valid: true; cleanUrl: string; isPhotoPost: boolean } | { valid: false } {
  if (typeof rawUrl !== "string") return { valid: false };
  const trimmed = rawUrl.trim();
  if (!trimmed || trimmed.length > 2048) return { valid: false };

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return { valid: false };
    }

    const host = parsed.hostname.toLowerCase();
    if (!ALLOWED_TIKTOK_HOSTS.has(host)) {
      return { valid: false };
    }

    const isShortLink = host === "vm.tiktok.com" || host === "vt.tiktok.com";
    const cleanUrl = isShortLink
      ? parsed.toString()
      : `${parsed.origin}${parsed.pathname}`;

    return {
      valid: true,
      cleanUrl,
      isPhotoPost: parsed.pathname.includes("/photo/"),
    };
  } catch {
    return { valid: false };
  }
}

function formatTikWmUrl(rawUrl?: string | null): string | null {
  if (!rawUrl || typeof rawUrl !== "string") return null;
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  try {
    const parsed =
      trimmed.startsWith("http://") || trimmed.startsWith("https://")
        ? new URL(trimmed)
        : new URL(
            `${TIKWM_BASE_URL}${trimmed.startsWith("/") ? "" : "/"}${trimmed}`
          );

    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

async function processTikTokExtraction(
  cleanUrl: string,
  isPhotoPost: boolean
): Promise<NextResponse> {
  const endpoint = isPhotoPost
    ? `${TIKWM_BASE_URL}/api/?url=${encodeURIComponent(cleanUrl)}`
    : `${TIKWM_BASE_URL}/api/?url=${encodeURIComponent(cleanUrl)}&hd=1`;

  let apiResponse: Response;
  try {
    apiResponse = await fetch(endpoint, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        Accept: "application/json, text/plain, */*",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    const isTimeout =
      error instanceof Error &&
      (error.name === "TimeoutError" || error.name === "AbortError");

    writeLog({
      scope: "TikTok",
      level: "error",
      message: isTimeout
        ? "Tiempo de espera agotado al consultar API externa"
        : "Error de red al consultar API externa",
      meta: {
        url: cleanUrl,
        detalle: error instanceof Error ? error.message : "Error desconocido",
      },
    });

    return NextResponse.json(
      {
        success: false,
        message: isTimeout
          ? "La consulta tardó demasiado. Intenta nuevamente en unos segundos."
          : "Error de conexión al procesar el enlace de TikTok.",
      },
      { status: isTimeout ? 504 : 502 }
    );
  }

  const rawText = await apiResponse.text();
  const trimmed = rawText.trim();
  const lowerStart = trimmed.slice(0, 32).toLowerCase();

  if (
    !trimmed ||
    lowerStart.startsWith("<!doctype") ||
    lowerStart.startsWith("<html") ||
    trimmed.startsWith("<")
  ) {
    writeLog({
      scope: "TikTok",
      level: "warn",
      message: "API externa devolvió respuesta no-JSON",
      meta: { url: cleanUrl, status: apiResponse.status },
    });

    return NextResponse.json(
      {
        success: false,
        message:
          apiResponse.status === 429
            ? "Demasiadas solicitudes seguidas. Espera unos segundos e intenta de nuevo."
            : "El servicio externo no respondió en formato válido. Intenta de nuevo.",
      },
      { status: apiResponse.status === 429 ? 429 : 502 }
    );
  }

  let data: TikWmPayload;
  try {
    data = JSON.parse(trimmed) as TikWmPayload;
  } catch {
    writeLog({
      scope: "TikTok",
      level: "error",
      message: "JSON malformado desde API externa",
      meta: { url: cleanUrl, status: apiResponse.status },
    });

    return NextResponse.json(
      {
        success: false,
        message: "No se pudo leer la respuesta del servicio externo.",
      },
      { status: 502 }
    );
  }

  if (!apiResponse.ok || data.code !== 0 || !data.data) {
    const statusCode = apiResponse.status === 429 ? 429 : 404;
    writeLog({
      scope: "TikTok",
      level: "error",
      message: "No se pudo extraer contenido desde la API externa",
      meta: {
        url: cleanUrl,
        code: data.code ?? "N/A",
        status: apiResponse.status,
      },
    });

    return NextResponse.json(
      {
        success: false,
        message:
          statusCode === 429
            ? "Demasiadas solicitudes seguidas. Espera unos segundos e intenta de nuevo."
            : "No se pudo extraer el contenido. Asegúrate de que el enlace sea público.",
      },
      { status: statusCode }
    );
  }

  const media = data.data;
  const authorName =
    media.author?.unique_id?.trim() ||
    media.author?.nickname?.trim() ||
    "creador";
  const contentTitle =
    typeof media.title === "string" ? media.title.trim() : "";

  const bestAudioRaw = media.music_info?.play || media.music;
  const formattedAudioUrl = formatTikWmUrl(bestAudioRaw);

  // 1. Carrusel de imágenes
  if (Array.isArray(media.images) && media.images.length > 0) {
    const formattedImages = Array.from(
      new Set(
        media.images
          .map((img) => formatTikWmUrl(img))
          .filter((img): img is string => Boolean(img))
      )
    );

    if (formattedImages.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No se encontraron imágenes disponibles para descargar en este carrusel.",
        },
        { status: 404 }
      );
    }

    writeLog({
      scope: "TikTok • Carrusel",
      level: "success",
      message: "Contenido extraído correctamente",
      meta: {
        autor: `@${authorName}`,
        imagenes: formattedImages.length,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          type: "image",
          platform: "tiktok",
          title: contentTitle,
          author: authorName,
          images: formattedImages,
          musicUrl: formattedAudioUrl,
          audioUrl: formattedAudioUrl,
        },
      },
      { status: 200 }
    );
  }

  // 2. Video
  const hdVideoUrl = formatTikWmUrl(media.hdplay || media.hd_play);
  const sdVideoUrl = formatTikWmUrl(media.play);
  const bestVideoUrl = hdVideoUrl || sdVideoUrl;

  if (!bestVideoUrl) {
    writeLog({
      scope: "TikTok • Video",
      level: "warn",
      message: "Respuesta sin URL de descarga disponible",
      meta: { url: cleanUrl, autor: `@${authorName}` },
    });

    return NextResponse.json(
      {
        success: false,
        message:
          "El video no tiene un enlace de descarga disponible en este momento.",
      },
      { status: 404 }
    );
  }

  const videoSize =
    media.hd_size || media.size || media.wm_size || null;

  writeLog({
    scope: "TikTok • Video",
    level: "success",
    message: "Contenido extraído correctamente",
    meta: {
      autor: `@${authorName}`,
      calidadHD: Boolean(hdVideoUrl),
      duracionSeg: media.duration || 0,
    },
  });

  return NextResponse.json(
    {
      success: true,
      data: {
        type: "video",
        platform: "tiktok",
        title: contentTitle,
        author: authorName,
        cover: formatTikWmUrl(media.cover || media.origin_cover),
        downloadUrl: bestVideoUrl,
        hdUrl: hdVideoUrl,
        musicUrl: formattedAudioUrl,
        audioUrl: formattedAudioUrl,
        duration: media.duration || 0,
        videoSize,
      },
    },
    { status: 200 }
  );
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);

    if (isSuspiciousBot(request)) {
      writeLog({
        scope: "TikTok",
        level: "warn",
        message: "Petición bloqueada por firma de bot/cliente no válido",
        meta: { ip },
      });

      return NextResponse.json(
        { success: false, message: "Acceso no permitido." },
        { status: 403 }
      );
    }

    if (isRateLimited(ip)) {
      writeLog({
        scope: "TikTok",
        level: "warn",
        message: "Límite de peticiones excedido en /api/tiktok",
        meta: { ip },
      });

      return NextResponse.json(
        {
          success: false,
          message:
            "Demasiadas solicitudes seguidas. Espera unos segundos e intenta de nuevo.",
        },
        { status: 429 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Solicitud inválida. Verifica el enlace enviado.",
        },
        { status: 400 }
      );
    }

    const rawUrl =
      typeof body === "object" && body !== null && "url" in body
        ? (body as { url?: unknown }).url
        : undefined;

    const parsed = parseAndNormalizeTikTokUrl(rawUrl);

    if (!parsed.valid) {
      writeLog({
        scope: "TikTok",
        level: "warn",
        message: "Enlace no válido recibido",
        meta: { url: String(rawUrl ?? "").slice(0, 160) },
      });

      return NextResponse.json(
        {
          success: false,
          message: "Por favor, ingresa un enlace válido de TikTok.",
        },
        { status: 400 }
      );
    }

    const dedupeKey = parsed.cleanUrl;
    const existingPromise = inFlightRequests.get(dedupeKey);

    if (existingPromise) {
      const sharedResponse = await existingPromise;
      return sharedResponse.clone();
    }

    const promise = processTikTokExtraction(
      parsed.cleanUrl,
      parsed.isPhotoPost
    ).finally(() => {
      inFlightRequests.delete(dedupeKey);
    });

    inFlightRequests.set(dedupeKey, promise);
    const response = await promise;
    return response.clone();
  } catch (error) {
    writeLog({
      scope: "TikTok",
      level: "error",
      message: "Excepción al procesar el enlace",
      meta: {
        detalle: error instanceof Error ? error.message : "Error desconocido",
      },
    });

    return NextResponse.json(
      {
        success: false,
        message: "Error de conexión al procesar el enlace de TikTok.",
      },
      { status: 500 }
    );
  }
}