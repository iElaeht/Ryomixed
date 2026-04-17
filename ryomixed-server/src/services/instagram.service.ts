import { extractInstagramVideo } from '../extractors/instagram/reel.extractor.js';
import { extractInstagramPost } from '../extractors/instagram/post.extractor.js';
import https from 'https';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Configuración de rutas para manejo de archivos en el servidor
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootPath = path.resolve(__dirname, "../../");

/**
 * SERVICIO DE INSTAGRAM (@RyoMixed)
 * Maneja la lógica de extracción multiz-fuente y streaming de medios.
 */
export class InstagramService {
  
  constructor() {
    this.syncCookies();
  }

  /**
   * Sincroniza las cookies desde las variables de entorno de Railway.
   * Esto permite que los extractores (yt-dlp) eviten bloqueos de sesión.
   */
  private syncCookies() {
    if (process.env.INSTAGRAM_COOKIES) {
      const instaCookiesPath = path.join(rootPath, "instagramCook.txt");
      fs.writeFileSync(instaCookiesPath, process.env.INSTAGRAM_COOKIES);
      console.log("📸 [InstagramService]: instagramCook.txt generado desde Railway.");
    }
  }

  /**
   * Obtiene y normaliza la información de un link de Instagram (Reel, Post o Carrusel).
   * Intenta múltiples métodos de extracción para asegurar la obtención de datos.
   */
  async getInfo(url: string) {
    try {
      // Limpieza de parámetros de rastreo (?utm_source, etc.)
      const cleanUrl = url.split('?')[0];
      console.log(`🔎 [Service]: Analizando Instagram: ${cleanUrl}`);

      let data: any = null;

      // --- PASO 1: Extracción Primaria (Posts/Carruseles) ---
      try {
        data = await extractInstagramPost(cleanUrl);
      } catch (e) {
        console.warn(`⚠️ [Service]: PostExtractor falló, intentando alternativa...`);
      }

      // --- PASO 2: Extracción Secundaria (Reels/yt-dlp) ---
      // Si el primero falló o no trajo suficiente media, usamos el extractor de Reels
      const isDataEmpty = !data || !data.media || data.media.length === 0;
      if (isDataEmpty || data.media.length <= 1) {
        try {
          const reelData = await extractInstagramVideo(cleanUrl);
          if (reelData && (isDataEmpty || reelData.media.length >= data.media.length)) {
            data = reelData;
          }
        } catch (e) {
          if (isDataEmpty) throw new Error("No se pudo extraer información de ninguna fuente.");
        }
      }

      // --- PASO 3: Normalización de URLs y Proxies ---
      const ensureOriginalUrl = (urlStr: string): string => {
        if (!urlStr) return "";
        // Si la URL ya viene con nuestro proxy de imágenes, extraemos la original
        if (urlStr.includes('/api/instagram/proxy/image?url=')) {
          return decodeURIComponent(urlStr.split('?url=')[1]);
        }
        return urlStr;
      };

      // Mapeo seguro de items de media
      const mediaMapped = data.media.map((item: any) => ({
        ...item,
        thumbnail: ensureOriginalUrl(item.thumbnail),
        duration: item.duration || data.duration || 0 
      }));

      const isCarousel = mediaMapped.length > 1;

      // Respuesta estructurada para el Frontend
      return {
        platform: 'instagram',
        type: isCarousel ? 'carousel' : (mediaMapped[0]?.type === 'video' ? 'video' : 'photo'),
        title: data.title || "Instagram Content",
        sanitizedTitle: data.sanitizedTitle || "instagram_download",
        author: data.author || 'Instagram_User',
        thumbnail: ensureOriginalUrl(data.thumbnail || mediaMapped[0]?.thumbnail),
        media: mediaMapped,
        duration: data.duration || mediaMapped[0]?.duration || 0,
        originalUrl: cleanUrl
      };

    } catch (error: any) {
      console.error(`❌ [InstagramService Error]: ${error.message}`);
      throw new Error("Contenido no disponible. Verifica que la cuenta sea pública.");
    }
  }

  /**
   * Gestiona la descarga de archivos mediante streaming directo desde el CDN de Instagram.
   * Evita cargar archivos pesados en la RAM del servidor.
   */
  async execDownload(url: string, res: any, sanitizedTitle: string, type: string = 'video') {
    const decodedUrl = decodeURIComponent(url);
    const isVideo = type.toLowerCase() === 'video' || type === 'REEL';
    const extension = isVideo ? 'mp4' : 'jpg';
    
    // Sanitización final del nombre de archivo para evitar caracteres inválidos
    const cleanFileName = sanitizedTitle
        .replace(/\.(mp4|jpg|jpeg|png)$/i, "")
        .replace(/^(Post_|Reel_)+/g, "")
        .replace(/[<>:"/\\|?*]/g, "")
        .trim();

    const finalFileName = isVideo ? `Reel_${cleanFileName}` : `Post_${cleanFileName}`;
    const encodedName = encodeURIComponent(finalFileName);

    // Configuración de cabeceras para forzar descarga
    res.setHeader('Content-Type', isVideo ? 'video/mp4' : 'image/jpeg');
    res.setHeader(
      'Content-Disposition', 
      `attachment; filename="${encodedName}.${extension}"; filename*=UTF-8''${encodedName}.${extension}`
    );

    // Petición al CDN con User-Agent de navegador para evitar errores 403 (Forbidden)
    https.get(decodedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'Referer': 'https://www.instagram.com/'
      }
    }, (stream) => {
      if (stream.statusCode !== 200) {
        console.error(`❌ [Download]: Error de Instagram: ${stream.statusCode}`);
        if (!res.headersSent) res.status(500).send("El enlace de descarga ha expirado.");
        return;
      }
      // Conexión del flujo de datos con la respuesta del cliente
      stream.pipe(res);
    }).on('error', (e) => {
      console.error("❌ [Download Error]:", e.message);
      if (!res.headersSent) res.status(500).send("Error de conexión con el servidor de medios.");
    });
  }
}