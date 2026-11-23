import { NextRequest, NextResponse } from "next/server";
import { writeLog } from "@/utils/logger";

const ALLOWED_HOSTS = [
  "tikwm.com",
  "tiktokcdn.com",
  "tiktokcdn-us.com",
  "tiktokcdn-eu.com",
  "tiktokv.com",
  "muscdn.com",
  "musical.ly",
];

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

function sanitizeDownloadName(rawName: string | null): string {
  if (!rawName) return "ryomixed_archivo";
  return (
    rawName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80) || "ryomixed_archivo"
  );
}

export async function HEAD(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get("url");
  if (!rawUrl) {
    return new NextResponse(null, { status: 400 });
  }

  const target = isAllowedMediaUrl(rawUrl);
  if (!target) {
    return new NextResponse(null, { status: 403 });
  }

  try {
    const upstream = await fetch(target.toString(), {
      method: "HEAD",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        Referer: "https://www.tiktok.com/",
      },
    });

    const headers = new Headers();
    const contentLength = upstream.headers.get("content-length");
    const contentType = upstream.headers.get("content-type");

    if (contentLength) headers.set("Content-Length", contentLength);
    if (contentType) headers.set("Content-Type", contentType);
    headers.set("Cache-Control", "public, max-age=300");

    return new NextResponse(null, {
      status: upstream.ok ? 200 : upstream.status,
      headers,
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}

export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get("url");
  const downloadName = sanitizeDownloadName(
    request.nextUrl.searchParams.get("filename")
  );
  const forceDownload = request.nextUrl.searchParams.get("download") === "1";

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
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        Referer: "https://www.tiktok.com/",
      },
    });

    if (!upstream.ok || !upstream.body) {
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

    headers.set("Content-Type", contentType);
    if (contentLength) {
      headers.set("Content-Length", contentLength);
    }
    if (forceDownload) {
      headers.set(
        "Content-Disposition",
        `attachment; filename="${downloadName}"`
      );
    }
    headers.set("Cache-Control", "no-store");

    return new NextResponse(upstream.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    writeLog({
      scope: "Proxy",
      level: "error",
      message: "Fallo al transmitir el archivo",
      meta: {
        detalle: error instanceof Error ? error.message : "Error desconocido",
      },
    });

    return NextResponse.json(
      { success: false, message: "Error al transmitir el archivo." },
      { status: 500 }
    );
  }
}