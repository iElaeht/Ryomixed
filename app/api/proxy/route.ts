import { NextRequest, NextResponse } from "next/server";
import { writeLog } from "@/utils/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_HOSTS = [
  "tikwm.com",
  "tiktokcdn.com",
  "tiktokcdn-us.com",
  "tiktokcdn-eu.com",
  "tiktokv.com",
  "muscdn.com",
  "musical.ly",
];

const HEAD_TIMEOUT_MS = 10000;
const GET_TIMEOUT_MS = 25000;

// Rate limit simple en memoria por IP (ventana de 60s)
const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 45;
const ipHits = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: NextRequest): string {
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

  // Limpieza ligera ocasional de entradas expiradas
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

function isSuspiciousBot(request: NextRequest): boolean {
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

function isAllowedMediaUrl(targetUrl: string): URL | null {
  try {
    const parsed = new URL(targetUrl);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return null;
    }

    const hostname = parsed.hostname.toLowerCase();
    const isPermitted = ALLOWED_HOSTS.some(
      (allowed) => hostname === allowed || hostname.endsWith(`.${allowed}`)
    );

    return isPermitted ? parsed : null;
  } catch {
    return null;
  }
}

function getUpstreamHeaders(target: URL, rangeHeader?: string | null): Headers {
  const host = target.hostname.toLowerCase();
  const isTikWm = host === "tikwm.com" || host.endsWith(".tikwm.com");

  const headers = new Headers({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    Accept: "*/*",
    "Accept-Language": "es-PE,es;q=0.9,en-US;q=0.8,en;q=0.7",
    Referer: isTikWm ? "https://tikwm.com/" : "https://www.tiktok.com/",
  });

  if (rangeHeader) {
    headers.set("Range", rangeHeader);
  }

  return headers;
}

function sanitizeDownloadName(rawName: string | null): string {
  if (!rawName) return "ryomixed_archivo";
  return (
    rawName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80) || "ryomixed_archivo"
  );
}

export async function HEAD(request: NextRequest) {
  const ip = getClientIp(request);
  if (isRateLimited(ip) || isSuspiciousBot(request)) {
    return new NextResponse(null, { status: 429 });
  }

  const rawUrl = request.nextUrl.searchParams.get("url");
  if (!rawUrl) {
    return new NextResponse(null, { status: 400 });
  }

  const target = isAllowedMediaUrl(rawUrl);
  if (!target) {
    return new NextResponse(null, { status: 403 });
  }

  try {
    let upstream = await fetch(target.toString(), {
      method: "HEAD",
      headers: getUpstreamHeaders(target),
      cache: "no-store",
      signal: AbortSignal.timeout(HEAD_TIMEOUT_MS),
    });

    if (upstream.status === 403 || upstream.status === 405) {
      await upstream.body?.cancel();
      upstream = await fetch(target.toString(), {
        method: "GET",
        headers: getUpstreamHeaders(target, "bytes=0-0"),
        cache: "no-store",
        signal: AbortSignal.timeout(HEAD_TIMEOUT_MS),
      });
    }

    const headers = new Headers();
    const contentLength = upstream.headers.get("content-length");
    const contentType = upstream.headers.get("content-type");
    const acceptRanges = upstream.headers.get("accept-ranges");

    if (contentLength) headers.set("Content-Length", contentLength);
    if (contentType) headers.set("Content-Type", contentType);
    if (acceptRanges) headers.set("Accept-Ranges", acceptRanges);
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("Cache-Control", "public, max-age=300");

    await upstream.body?.cancel();

    const status =
      upstream.ok || upstream.status === 206 ? 200 : upstream.status;
    return new NextResponse(null, { status, headers });
  } catch (error) {
    const isTimeout =
      error instanceof Error &&
      (error.name === "TimeoutError" || error.name === "AbortError");

    return new NextResponse(null, { status: isTimeout ? 504 : 502 });
  }
}

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);

  if (isSuspiciousBot(request)) {
    writeLog({
      scope: "Proxy",
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
      scope: "Proxy",
      level: "warn",
      message: "Límite de peticiones excedido en proxy",
      meta: { ip },
    });

    return NextResponse.json(
      {
        success: false,
        message: "Demasiadas solicitudes. Espera un momento e intenta de nuevo.",
      },
      { status: 429 }
    );
  }

  const rawUrl = request.nextUrl.searchParams.get("url");
  const downloadName = sanitizeDownloadName(
    request.nextUrl.searchParams.get("filename")
  );
  const forceDownload = request.nextUrl.searchParams.get("download") === "1";
  const rangeHeader = request.headers.get("range");

  if (!rawUrl) {
    writeLog({
      scope: "Proxy",
      level: "warn",
      message: "Petición sin parámetro url",
    });

    return NextResponse.json(
      { success: false, message: "Falta el parámetro url." },
      { status: 400 }
    );
  }

  const target = isAllowedMediaUrl(rawUrl);
  if (!target) {
    writeLog({
      scope: "Proxy",
      level: "warn",
      message: "Dominio bloqueado por política de origen",
      meta: { url: rawUrl },
    });

    return NextResponse.json(
      { success: false, message: "Dominio de origen no permitido." },
      { status: 403 }
    );
  }

  try {
    writeLog({
      scope: "Proxy",
      level: "info",
      message: forceDownload ? "Descarga solicitada" : "Transmisión solicitada",
      meta: {
        archivo: downloadName,
        host: target.hostname,
      },
    });

    const upstream = await fetch(target.toString(), {
      headers: getUpstreamHeaders(target, rangeHeader),
      cache: "no-store",
      signal: AbortSignal.timeout(GET_TIMEOUT_MS),
    });

    if ((!upstream.ok && upstream.status !== 206) || !upstream.body) {
      await upstream.body?.cancel();
      writeLog({
        scope: "Proxy",
        level: "error",
        message: "El servidor de origen respondió con error",
        meta: {
          status: upstream.status,
          host: target.hostname,
        },
      });

      return NextResponse.json(
        {
          success: false,
          message: "No se pudo obtener el archivo desde el origen.",
        },
        { status: upstream.status || 502 }
      );
    }

    const headers = new Headers();
    const contentType =
      upstream.headers.get("content-type") || "application/octet-stream";
    const contentLength = upstream.headers.get("content-length");
    const contentRange = upstream.headers.get("content-range");
    const acceptRanges = upstream.headers.get("accept-ranges");

    headers.set("Content-Type", contentType);
    headers.set("X-Content-Type-Options", "nosniff");
    if (contentLength) {
      headers.set("Content-Length", contentLength);
    }
    if (contentRange) {
      headers.set("Content-Range", contentRange);
    }
    if (acceptRanges) {
      headers.set("Accept-Ranges", acceptRanges);
    }
    if (forceDownload) {
      headers.set(
        "Content-Disposition",
        `attachment; filename="${downloadName}"; filename*=UTF-8''${encodeURIComponent(downloadName)}`
      );
    }
    headers.set("Cache-Control", "no-store");

    return new NextResponse(upstream.body, {
      status: upstream.status === 206 ? 206 : 200,
      headers,
    });
  } catch (error) {
    const isTimeout =
      error instanceof Error &&
      (error.name === "TimeoutError" || error.name === "AbortError");

    writeLog({
      scope: "Proxy",
      level: "error",
      message: isTimeout
        ? "Tiempo de espera agotado al transmitir el archivo"
        : "Fallo al transmitir el archivo",
      meta: {
        host: target.hostname,
        detalle: error instanceof Error ? error.message : "Error desconocido",
      },
    });

    return NextResponse.json(
      {
        success: false,
        message: isTimeout
          ? "La transmisión tardó demasiado. Intenta descargar nuevamente."
          : "Error al transmitir el archivo.",
      },
      { status: isTimeout ? 504 : 500 }
    );
  }
}