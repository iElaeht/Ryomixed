import { extractInstagramVideo } from '../extractors/instagram/reel.extractor.js';
import { extractInstagramPost } from '../extractors/instagram/post.extractor.js';
import https from 'https';

/**
 * Servicio encargado de la lógica de negocio para Instagram.
 * Maneja la extracción de datos y la transmisión de descargas.
 */
export class InstagramService {
  
  /**
   * Obtiene y normaliza la información de un link de Instagram (Reel, Post o Carrusel).
   * @param url URL original del contenido.
   * @returns Objeto normalizado con media, títulos y metadatos.
   */
  async getInfo(url: string) {
    try {
      // Limpiamos la URL de parámetros de rastreo (?utm_source, etc)
      const cleanUrl = url.split('?')[0];
      console.log(`🔎 [Service]: Analizando: ${cleanUrl}`);

      let data: any = null;

      // --- PASO 1: Extracción ---
      try {
        // Intentamos primero con PostExtractor (mejor para carruseles y fotos)
        data = await extractInstagramPost(cleanUrl);
      } catch (e) {
        console.warn(`⚠️ [Service]: PostExtractor falló, intentando alternativa...`);
      }

      // Si el primero falló o trajo contenido pobre, intentamos con ReelExtractor (yt-dlp)
      const isDataEmpty = !data || !data.media || data.media.length === 0;
      if (isDataEmpty || data.media.length <= 1) {
        try {
          const reelData = await extractInstagramVideo(cleanUrl);
          // Si el extractor de Reels encontró más contenido o el anterior estaba vacío, lo usamos
          if (reelData && (isDataEmpty || reelData.media.length >= data.media.length)) {
            data = reelData;
          }
        } catch (e) {
          if (isDataEmpty) throw new Error("No se pudo extraer información de ninguna fuente.");
        }
      }

      // --- PASO 2: Normalización y Limpieza ---
      
      /**
       * Evita bucles infinitos de proxy. Si el extractor ya devolvió una URL 
       * con el proxy aplicado, extraemos solo la URL original de Instagram.
       */
      const ensureOriginalUrl = (urlStr: string): string => {
        if (!urlStr) return "";
        if (urlStr.includes('/api/instagram/proxy/image?url=')) {
          return decodeURIComponent(urlStr.split('?url=')[1]);
        }
        return urlStr;
      };

      // Mapeamos los items de media para asegurar que todos tengan el formato correcto
      const mediaMapped = data.media.map((item: any) => ({
        ...item,
        thumbnail: ensureOriginalUrl(item.thumbnail),
        duration: item.duration || data.duration || 0 
      }));

      const isCarousel = mediaMapped.length > 1;

      // Respuesta final estructurada para el Frontend
      return {
        platform: 'instagram',
        // Determinamos el tipo de vista que debe cargar el frontend
        type: isCarousel ? 'carousel' : (mediaMapped[0]?.type === 'video' ? 'video' : 'photo'),
        title: data.title,
        sanitizedTitle: data.sanitizedTitle,
        author: data.author || 'Instagram_User',
        thumbnail: ensureOriginalUrl(data.thumbnail || mediaMapped[0]?.thumbnail),
        media: mediaMapped,
        duration: data.duration || mediaMapped[0]?.duration || 0,
        originalUrl: cleanUrl
      };

    } catch (error: any) {
      console.error(`❌ [InstagramService Error]: ${error.message}`);
      throw new Error("No se pudo obtener información. Verifica que el link sea público.");
    }
  }

  /**
   * Gestiona la descarga de archivos mediante streaming para no saturar la RAM.
   * @param url URL directa del recurso (CDN de Instagram).
   * @param res Objeto Response de Express.
   * @param sanitizedTitle Título limpio para el archivo.
   * @param type Tipo de contenido ('video' o 'photo').
   */
  async execDownload(url: string, res: any, sanitizedTitle: string, type: string = 'video') {
    const decodedUrl = decodeURIComponent(url);
    const isVideo = type.toLowerCase() === 'video' || type === 'REEL';
    const extension = isVideo ? 'mp4' : 'jpg';
    
    // Limpieza de nombre de archivo: quitamos prefijos repetidos y caracteres prohibidos en Windows
    const cleanFileName = sanitizedTitle
        .replace(/\.(mp4|jpg|jpeg|png)$/i, "")
        .replace(/^(Post_|Reel_)+/g, "")
        .replace(/[<>:"/\\|?*]/g, "")
        .trim();

    const finalFileName = isVideo ? `Reel_${cleanFileName}` : `Post_${cleanFileName}`;
    const encodedName = encodeURIComponent(finalFileName);

    // Configuramos cabeceras para forzar la descarga en el navegador
    res.setHeader('Content-Type', isVideo ? 'video/mp4' : 'image/jpeg');
    res.setHeader(
      'Content-Disposition', 
      `attachment; filename="${encodedName}.${extension}"; filename*=UTF-8''${encodedName}.${extension}`
    );

    // Petición al CDN de Instagram con User-Agent de navegador para evitar el 403
    https.get(decodedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'Referer': 'https://www.instagram.com/'
      }
    }, (stream) => {
      if (stream.statusCode !== 200) {
        console.error(`❌ [Download]: Instagram respondió con ${stream.statusCode}`);
        if (!res.headersSent) res.status(500).send("El enlace ha expirado.");
        return;
      }
      // Conectamos el flujo de Instagram directamente con la respuesta al usuario
      stream.pipe(res);
    }).on('error', (e) => {
      console.error("❌ [Download Error]:", e.message);
      if (!res.headersSent) res.status(500).send("Error en la conexión.");
    });
  }
}