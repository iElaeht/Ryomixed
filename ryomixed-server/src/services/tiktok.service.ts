import axios from 'axios';
import https from 'https';
import { extractTikTokReel } from '../extractors/tiktok/reelTiktok.extractor.js';
import { extractTikTokPost } from '../extractors/tiktok/PostTiktok.extractor.js';

/**
 * @interface TikTokMedia
 * @description Estructura de datos normalizada para el contenido de TikTok.
 */
export interface TikTokMedia {
  type: 'video' | 'photos';
  title: string;
  sanitizedTitle: string;
  author: string;
  thumbnail: string;
  urls: string[];
  audioUrl?: string;
  duration?: number;
}

/**
 * @class TikTokService
 * @description Motor de extracción y descarga para TikTok (RyoMixed Engine).
 */
export class TikTokService {
  
  /**
   * @method sanitize
   * @private
   * @description Limpia el título del contenido para nombres de archivo seguros.
   * @param {string} text - Título original o descripción.
   * @param {string} videoId - ID único del video para evitar colisiones.
   */
  private sanitize(text: string, videoId?: string): string {
    if (!text) return `TikTok_Reel_${videoId?.slice(-6) || 'Media'}`;

    const baseText = text.split('#')[0].trim();
    let cleanText = baseText
      .replace(/[^\w\s-]/gi, '') 
      .replace(/\s+/g, '_')      
      .trim();

    if (!cleanText || cleanText.length < 2) {
      const shortId = videoId ? videoId.slice(-10) : Date.now().toString().slice(-6);
      return `TikTok_Reel_${shortId}`;
    }

    const shortTitle = cleanText.substring(0, 25);
    const suffix = videoId ? videoId.slice(-4) : Date.now().toString().slice(-4);
    
    return `${shortTitle}_${suffix}`;
  }

  /**
   * @method getInfo
   * @description Obtiene metadatos de TikTok usando el API de TikWM y normaliza la respuesta.
   * @param {string} url - URL del video o post de TikTok.
   */
  async getInfo(url: string): Promise<TikTokMedia> {
    try {
      const cleanUrl = url.split('?')[0];

      // --- LOG DE INICIO DE OPERACIÓN ---
      console.log(`\n--- 📱 NUEVA SOLICITUD DE TIKTOK ---`);
      console.log(`🔗 URL: ${cleanUrl}`);

      const response = await axios.post('https://www.tikwm.com/api/', 
        new URLSearchParams({ url: cleanUrl, hd: '1' }), 
        {
          timeout: 12000,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }
      );

      const result = response.data;

      if (result.code !== 0 || !result.data) {
        throw new Error(result.msg || "Contenido privado o no disponible.");
      }

      const data = result.data;
      const videoId = data.id || ''; 
      const isPhotos = Array.isArray(data.images) && data.images.length > 0;

      // --- DEBUGGER DETALLADO (ESTILO YOUTUBE) ---
      console.log(`👾 [Motor]: Detección exitosa -> ${isPhotos ? '📸 Galería de Fotos' : '🎥 Video/Reel'}`);
      console.log(`👤 Autor: ${data.author?.unique_id || 'Desconocido'}`);
      console.log(`✅ Título: ${data.title?.substring(0, 40) || 'Sin título'}...`);
      console.log(`---------------------------------------\n`);

      // Selección de extractor según tipo de contenido
      if (isPhotos) {
        return extractTikTokPost(data, (txt: string) => this.sanitize(txt, videoId)) as TikTokMedia;
      } else {
        return extractTikTokReel(data, (txt: string) => this.sanitize(txt, videoId)) as TikTokMedia;
      }

    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : "Error de red";
      console.error(`\n❌ [TikTok Error]: ${errorMsg}\n`);
      throw new Error(errorMsg);
    }
  }

  /**
   * @method execDownload
   * @description Realiza el bypass de descarga mediante un túnel HTTPS para evitar logs de URLs gigantes.
   * @param {string} url - URL de descarga directa de TikTok.
   * @param {any} res - Objeto de respuesta de Express.
   * @param {string} fileName - Nombre sanitizado para el archivo.
   */
  async execDownload(url: string, res: any, fileName: string) {
    const finalFileName = fileName || 'TikTok_RyoMixed';
    
    // --- LOG DE DESCARGA SIMPLIFICADO ---
    // Nota: Ocultamos la URL original para mantener la consola limpia.
    console.log(`\n📥 [TIKTOK DOWNLOAD INICIADA]`);
    console.log(`   📂 Archivo: ${finalFileName}.mp4`);
    console.log(`   🛠️  Estado: Creando túnel de transferencia segura...`);

    // Configuración de Headers para forzar descarga en el navegador
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(finalFileName)}.mp4"`);

    // Iniciamos el túnel HTTPS silencioso
    const request = https.get(url, (stream) => {
      console.log(`   📦 [Stream]: Enviando datos de video al cliente...`);
      
      stream.pipe(res);

      stream.on('end', () => {
        console.log(`✅ [TikTok]: Descarga completada con éxito.`);
        console.log(`---------------------------------------\n`);
      });

    });

    request.on('error', (e) => {
      console.error(`\n🔴 [TikTok Tunnel Error]:`);
      console.error(`   ⚠️ Motivo: ${e.message}\n`);
      if (!res.headersSent) res.status(500).send("Error en la descarga de TikTok.");
    });
  }
}