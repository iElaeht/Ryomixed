import { extractInstagramVideo } from '../../extractors/instagram/reel.extractor.js';
import { extractPostImage } from '../../extractors/instagram/PostImage.extractor.js';
import { getInstagramFromRapid } from './scraperStable.service.js';
import { getInstagramFromDownloader } from './downloaderScraper.service.js';
import { getInstagramFromMediaExtractor } from './mediaExtractor.service.js';
import { StatsService } from '../stats/stats.service.js';
import https from 'https';

/**
 * SERVICIO DE INSTAGRAM (@RyoMixed)
 * Sistema de extracción multi-motor con bypass de seguridad.
 */
export class InstagramService {
  
  async getInfo(url: string) {
    try {
      const cleanUrl = url.split('?')[0];
      let finalData: any = null;

      console.log(`\n--- 📸 NUEVA SOLICITUD DE INSTAGRAM ---`);
      console.log(`🔗 URL: ${cleanUrl}`);

      // Cascada de motores (Fallback System)
      console.log(`🚀 [Step 1]: Probando Motor MEDIA EXTRACTOR...`);
      finalData = await getInstagramFromMediaExtractor(cleanUrl);
      
      if (!finalData) {
        console.log(`🚀 [Step 2]: Falló anterior. Probando DOWNLOADER...`);
        finalData = await getInstagramFromDownloader(cleanUrl);
      }

      if (!finalData) {
        console.log(`🚀 [Step 3]: Falló anterior. Probando STABLE...`);
        finalData = await getInstagramFromRapid(cleanUrl);
      }

      if (!finalData) {
        console.log(`⚠️ [Step 4]: APIs externas agotadas. Intentando Local...`);
        const imageData = await extractPostImage(cleanUrl).catch(() => null);
        let videoData = null;

        if (!imageData || (imageData.media && imageData.media.length <= 1)) {
            videoData = await extractInstagramVideo(cleanUrl).catch(() => null);
        }
        finalData = videoData || imageData;
      }

      if (finalData) {
        console.log(`✅ [Instagram]: Contenido obtenido con éxito.`);
        console.log(`👤 Autor: ${finalData.author || 'Privado/Desconocido'}`);
        console.log(`---------------------------------------\n`);
        return this.formatResponse(finalData, cleanUrl);
      }

      await StatsService.registerActivity('FAILED_ALL', false);
      throw new Error("No se pudo obtener contenido de ninguna fuente.");

    } catch (error: any) {
      console.error(`\n❌ [Instagram Error]: ${error.message}\n`);
      throw new Error(error.message || "Error en el procesamiento de Instagram.");
    }
  }

  /**
   * Normaliza la respuesta para que el Front-end la entienda.
   */
  private formatResponse(data: any, originalUrl: string) {
    const isReel = originalUrl.includes('/reel/');
    const prefix = isReel ? 'Reel' : 'Post';

    const urlParts = originalUrl.split('/');
    const postID = urlParts.find((part, index) => 
      urlParts[index - 1] === 'p' || urlParts[index - 1] === 'reel'
    ) || 'content';

    const cleanTitle = (data.title || '')
      .replace(/[^\w\s-]/gi, '')
      .trim()
      .substring(0, 30);

    const titlePart = cleanTitle.length > 2 ? cleanTitle.replace(/\s+/g, '_') : null;
    const finalBaseName = titlePart ? `${prefix}_${titlePart}_${postID}` : `${prefix}_${postID}`;

    const isMultiple = data.media && data.media.length > 1;

    const mediaWithNames = data.media.map((m: any, index: number) => ({
      ...m,
      customFileName: isMultiple 
        ? `${finalBaseName}_${index + 1}` 
        : finalBaseName
    }));

    return {
      platform: 'instagram',
      type: isMultiple ? 'carousel' : (data.media[0]?.type === 'video' ? 'video' : 'photo'),
      title: data.title || `${prefix} ${postID}`,
      author: data.author || 'Instagram_User',
      thumbnail: data.thumbnail || data.media[0]?.thumbnail,
      media: mediaWithNames,
      originalUrl: originalUrl
    };
  }

  /**
   * EJECUCIÓN DE DESCARGA (Túnel Blindado)
   * Corregido para evitar archivos corruptos 0xC00D36C4.
   */
async execDownload(url: string, res: any, fileName: string, type: string = 'video') {
    const decodedUrl = decodeURIComponent(url);
    const isVideo = type.toLowerCase() === 'video' || type.toLowerCase() === 'reel';
    const extension = isVideo ? 'mp4' : 'jpg';
    
    // 1. Limpiamos el nombre para evitar caracteres raros en la descarga
    const safeFileName = fileName.replace(/[^\w\s-]/gi, '').trim() || 'RyoMixed_Download';
    const finalFileName = `${safeFileName}.${extension}`;

    console.log(`\n📥 [INSTAGRAM DOWNLOAD]`);
    console.log(`   📂 Archivo: ${finalFileName}`);

    // --- LAS CABECERAS CLAVE ---
    res.setHeader('Content-Type', isVideo ? 'video/mp4' : 'image/jpeg');
    
    // ESTA LÍNEA ES LA QUE FUERZA LA DESCARGA:
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(finalFileName)}"`);
    
    res.setHeader('Content-Transfer-Encoding', 'binary');
    // ---------------------------

    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Referer': 'https://www.instagram.com/',
        'Accept': '*/*'
      },
      timeout: 30000 
    };


    const request = https.get(decodedUrl, options, (stream) => {
      // Si Instagram nos devuelve algo que no sea 200 (éxito), informamos
      if (stream.statusCode !== 200) {
        console.error(`🔴 [Tunnel Error]: Instagram respondió con ${stream.statusCode}`);
        if (!res.headersSent) res.status(500).send("Instagram denegó el acceso al archivo.");
        return;
      }

      console.log(`   📦 [Stream]: Transfiriendo datos al cliente...`);
      stream.pipe(res);

      stream.on('end', () => {
        console.log(`✅ [Instagram]: Túnel cerrado con éxito.\n`);
      });

      stream.on('error', (err) => {
        console.error(`🔴 [Stream Pipe Error]: ${err.message}`);
      });
    });

    request.on('error', (e) => {
      console.error(`\n🔴 [Tunnel Error]: ${e.message}\n`);
      if (!res.headersSent) res.status(500).send("Error en el túnel de descarga.");
    });

    // Importante: establecer un timeout en la petición
    request.on('timeout', () => {
      request.destroy();
      console.error("🔴 [Tunnel Error]: Tiempo de espera agotado.");
    });
  }
}