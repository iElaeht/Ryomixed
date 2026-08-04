// ryomixed/app/api/tiktok/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || !url.includes("tiktok.com")) {
      return NextResponse.json(
        { success: false, message: "Por favor, ingresa un enlace válido de TikTok." },
        { status: 400 }
      );
    }

    const apiResponse = await fetch(`https://tikwm.com/api/?url=${encodeURIComponent(url)}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    });

    const data = await apiResponse.json();

    if (data.code !== 0 || !data.data) {
      return NextResponse.json(
        { success: false, message: "No se pudo extraer el contenido. Asegúrate de que el enlace sea público." },
        { status: 404 }
      );
    }

    const baseUrl = "https://tikwm.com";
    const formatUrl = (u?: string) => {
      if (!u) return null;
      return u.startsWith("http") ? u : `${baseUrl}${u}`;
    };

    // 1. Detección para Carrusel de Imágenes
    if (data.data.images && Array.isArray(data.data.images) && data.data.images.length > 0) {
      return NextResponse.json({
        success: true,
        data: {
          type: "image",
          platform: "tiktok",
          title: data.data.title || "Galería de TikTok",
          author: data.data.author?.nickname || "tiktok_user",
          images: data.data.images.map((img: string) => formatUrl(img)),
          musicUrl: formatUrl(data.data.music)
        }
      }, { status: 200 });
    }

    // 2. Detección para Video normal
    const rawVideoUrl = data.data.hdplay || data.data.play;
    const videoData = {
      type: "video",
      platform: "tiktok",
      title: data.data.title || "Video de TikTok",
      author: data.data.author?.nickname || "tiktok_user",
      cover: formatUrl(data.data.cover || data.data.origin_cover),
      downloadUrl: formatUrl(rawVideoUrl),
      musicUrl: formatUrl(data.data.music),
      duration: data.data.duration || 0
    };

    return NextResponse.json({
      success: true,
      data: videoData
    }, { status: 200 });

  } catch {
    return NextResponse.json(
      { success: false, message: "Error de conexión al procesar el enlace de TikTok." },
      { status: 500 }
    );
  }
}