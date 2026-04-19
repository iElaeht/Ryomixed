import { extractInstagramVideo } from '../extractors/instagram/reel.extractor.js';
import { extractPostImage } from '../extractors/instagram/PostImage.extractor.js';
import https from 'https';

/**
 * Servicio encargado de la lógica de negocio para Instagram.
 */
export class InstagramService {
  
  async getInfo(url: string) {
    try {
      const cleanUrl = url.split('?')[0];
      console.log(`🔎 [Service]: Analizando: ${cleanUrl}`);

      let imageData: any = null;
      let videoData: any = null;

      // --- PASO 1: Extracción en Cascada Inteligente ---
      // Intentamos primero con PostImage (Especialista en Fotos/Carruseles)
      try {
        imageData = await extractPostImage(cleanUrl);
      } catch (e) {
        console.warn(`⚠️ [Service]: PostImage falló.`);
      }

      /**
       * LÓGICA DE ACTIVACIÓN DEL MOTOR PESADO:
       * Si PostImage no trajo nada, O si solo trajo 1 imagen (sospecha de carrusel incompleto),
       * activamos el motor de video/yt-dlp para confirmar el contenido.
       */
      const appearsIncomplete = !imageData || !imageData.media || imageData.media.length <= 1;

      if (appearsIncomplete) {
        try {
          console.log(`🔄 [Service]: Detectado contenido potencialmente mixto o pesado. Activando yt-dlp...`);
          videoData = await extractInstagramVideo(cleanUrl);
        } catch (e) {
          console.warn(`⚠️ [Service]: Motor de Video falló.`);
        }
      }

      // --- PASO 2: Fusión de Resultados ---
      
      // Decidimos cuál es nuestra fuente principal. Priorizamos videoData por ser más completo.
      let finalData = videoData || imageData;

      if (!finalData || !finalData.media || finalData.media.length === 0) {
        throw new Error("No se pudo extraer información de ninguna fuente.");
      }

      // Si ambos trajeron info, nos aseguramos de no tener duplicados por URL
      if (videoData && imageData) {
        const videoUrls = new Set(videoData.media.map((m: any) => m.url.split('?')[0]));
        
        imageData.media.forEach((img: any) => {
          const pureImgUrl = img.url.split('?')[0];
          if (!videoUrls.has(pureImgUrl)) {
            finalData.media.push(img);
          }
        });
        
        // Re-ordenamos por índice para mantener la coherencia del carrusel
        finalData.media.sort((a: any, b: any) => (a.index || 0) - (b.index || 0));
      }

      // --- PASO 3: Normalización y Limpieza de Proxy ---
      
      const ensureOriginalUrl = (urlStr: string): string => {
        if (!urlStr) return "";
        if (urlStr.includes('/api/instagram/proxy/image?url=')) {
          return decodeURIComponent(urlStr.split('?url=')[1]);
        }
        return urlStr;
      };

      const mediaMapped = finalData.media.map((item: any) => ({
        ...item,
        thumbnail: ensureOriginalUrl(item.thumbnail),
        duration: item.duration || finalData.duration || 0 
      }));

      const isCarousel = mediaMapped.length > 1;

      return {
        platform: 'instagram',
        type: isCarousel ? 'carousel' : (mediaMapped[0]?.type === 'video' ? 'video' : 'photo'),
        title: finalData.title,
        sanitizedTitle: finalData.sanitizedTitle,
        author: finalData.author || 'Instagram_User',
        thumbnail: ensureOriginalUrl(finalData.thumbnail || mediaMapped[0]?.thumbnail),
        media: mediaMapped,
        duration: finalData.duration || mediaMapped[0]?.duration || 0,
        originalUrl: cleanUrl
      };

    } catch (error: any) {
      console.error(`❌ [InstagramService Error]: ${error.message}`);
      throw new Error("Contenido privado o no disponible.");
    }
  }

  /**
   * Streaming de descarga
   */
  async execDownload(url: string, res: any, sanitizedTitle: string, type: string = 'video') {
    const decodedUrl = decodeURIComponent(url);
    const isVideo = type.toLowerCase() === 'video' || type === 'REEL';
    const extension = isVideo ? 'mp4' : 'jpg';
    
    const cleanFileName = sanitizedTitle
        .replace(/\.(mp4|jpg|jpeg|png)$/i, "")
        .replace(/^(Post_|Reel_)+/g, "")
        .replace(/[<>:"/\\|?*]/g, "")
        .trim();

    const finalFileName = isVideo ? `Reel_${cleanFileName}` : `Post_${cleanFileName}`;
    const encodedName = encodeURIComponent(finalFileName);

    res.setHeader('Content-Type', isVideo ? 'video/mp4' : 'image/jpeg');
    res.setHeader(
      'Content-Disposition', 
      `attachment; filename="${encodedName}.${extension}"; filename*=UTF-8''${encodedName}.${extension}`
    );

    https.get(decodedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'Referer': 'https://www.instagram.com/'
      }
    }, (stream) => {
      if (stream.statusCode !== 200) {
        console.error(`❌ [Download]: Error HTTP ${stream.statusCode}`);
        if (!res.headersSent) res.status(500).send("El enlace ha expirado.");
        return;
      }
      stream.pipe(res);
    }).on('error', (e) => {
      console.error("❌ [Download Error]:", e.message);
      if (!res.headersSent) res.status(500).send("Error de conexión.");
    });
  }
}