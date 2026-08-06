// app/api/tiktok/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url } = body;

    // Validación flexible para URLs de web y móviles (vm, vt)
    const isValidTikTok = url && (
      url.includes("tiktok.com") || 
      url.includes("vm.tiktok.com") || 
      url.includes("vt.tiktok.com")
    );

    if (!isValidTikTok) {
      console.warn(`[TikTok - Warning] Intento de acceso con enlace no válido: ${url}`);
      return NextResponse.json(
        { success: false, message: "Por favor, ingresa un enlace válido de TikTok." },
        { status: 400 }
      );
    }

    // Solicitud a la API con parámetros para intentar forzar la máxima calidad si la API lo soporta
    const apiResponse = await fetch(`https://tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    });

    const data = await apiResponse.json();

    if (data.code !== 0 || !data.data) {
      console.error(`[TikTok - Error] No se pudo procesar la URL en la API externa: ${url}`);
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

    const authorName = data.data.author?.nickname || "tiktok_user";
    const contentTitle = data.data.title || "Sin título";

    // 1. Detección para Carrusel de Imágenes (Gallery)
    if (data.data.images && Array.isArray(data.data.images) && data.data.images.length > 0) {
      console.log(`[TikTok - Gallery] Éxito | Autor: @${authorName} | Imágenes: ${data.data.images.length} | URL: ${url}`);
      
      return NextResponse.json({
        success: true,
        data: {
          type: "image",
          platform: "tiktok",
          title: contentTitle,
          author: authorName,
          images: data.data.images.map((img: string) => formatUrl(img)),
          musicUrl: formatUrl(data.data.music)
        }
      }, { status: 200 });
    }

    // 2. Detección para Video: Priorizamos estrictamente HD, luego HD alternativo, y por último SD
    const rawVideoUrl = data.data.hdplay || data.data.hd_play || data.data.play;
    
    console.log(`[TikTok - Video] Éxito | Calidad HD disponible: ${Boolean(data.data.hdplay || data.data.hd_play)} | Autor: @${authorName} | URL: ${url}`);

    const videoData = {
      type: "video",
      platform: "tiktok",
      title: contentTitle,
      author: authorName,
      cover: formatUrl(data.data.cover || data.data.origin_cover),
      downloadUrl: formatUrl(rawVideoUrl),
      musicUrl: formatUrl(data.data.music),
      duration: data.data.duration || 0
    };

    return NextResponse.json({
      success: true,
      data: videoData
    }, { status: 200 });

  } catch (error) {
    console.error("[TikTok - Server Error] Excepción capturada:", error);
    return NextResponse.json(
      { success: false, message: "Error de conexión al procesar el enlace de TikTok." },
      { status: 500 }
    );
  }
}