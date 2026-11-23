import { NextResponse } from "next/server";
import { writeLog } from "@/utils/logger";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url } = body;

    const isValidTikTok =
      typeof url === "string" &&
      url.trim().length > 0 &&
      (url.includes("tiktok.com") ||
        url.includes("vm.tiktok.com") ||
        url.includes("vt.tiktok.com"));

    if (!isValidTikTok) {
      writeLog({
        scope: "TikTok",
        level: "warn",
        message: "Enlace no válido recibido",
        meta: { url: String(url ?? "") },
      });

      return NextResponse.json(
        {
          success: false,
          message: "Por favor, ingresa un enlace válido de TikTok.",
        },
        { status: 400 }
      );
    }

    const apiResponse = await fetch(
      `https://tikwm.com/api/?url=${encodeURIComponent(url.trim())}&hd=1`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        },
        cache: "no-store",
      }
    );

    const data = await apiResponse.json();

    if (data.code !== 0 || !data.data) {
      writeLog({
        scope: "TikTok",
        level: "error",
        message: "No se pudo extraer contenido desde la API externa",
        meta: { url: url.trim(), code: data.code ?? "N/A" },
      });

      return NextResponse.json(
        {
          success: false,
          message:
            "No se pudo extraer el contenido. Asegúrate de que el enlace sea público.",
        },
        { status: 404 }
      );
    }

    const baseUrl = "https://tikwm.com";
    const formatUrl = (u?: string | null) => {
      if (!u || typeof u !== "string") return null;
      return u.startsWith("http") ? u : `${baseUrl}${u}`;
    };

    const authorName =
      data.data.author?.unique_id || data.data.author?.nickname || "creador";
    const contentTitle =
      typeof data.data.title === "string" ? data.data.title.trim() : "";

    const bestAudioRaw = data.data.music_info?.play || data.data.music;
    const formattedAudioUrl = formatUrl(bestAudioRaw);

    // 1. Carrusel de imágenes
    if (Array.isArray(data.data.images) && data.data.images.length > 0) {
      writeLog({
        scope: "TikTok • Carrusel",
        level: "success",
        message: "Contenido extraído correctamente",
        meta: {
          autor: `@${authorName}`,
          imagenes: data.data.images.length,
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
            images: data.data.images
              .map((img: string) => formatUrl(img))
              .filter(Boolean),
            musicUrl: formattedAudioUrl,
            audioUrl: formattedAudioUrl,
          },
        },
        { status: 200 }
      );
    }

    // 2. Video
    const hdVideoUrl = formatUrl(data.data.hdplay || data.data.hd_play);
    const sdVideoUrl = formatUrl(data.data.play);
    const bestVideoUrl = hdVideoUrl || sdVideoUrl;

    const videoSize =
      data.data.hd_size || data.data.size || data.data.wm_size || null;

    writeLog({
      scope: "TikTok • Video",
      level: "success",
      message: "Contenido extraído correctamente",
      meta: {
        autor: `@${authorName}`,
        calidadHD: Boolean(hdVideoUrl),
        duracionSeg: data.data.duration || 0,
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
          cover: formatUrl(data.data.cover || data.data.origin_cover),
          downloadUrl: bestVideoUrl,
          hdUrl: hdVideoUrl,
          musicUrl: formattedAudioUrl,
          audioUrl: formattedAudioUrl,
          duration: data.data.duration || 0,
          videoSize,
        },
      },
      { status: 200 }
    );
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