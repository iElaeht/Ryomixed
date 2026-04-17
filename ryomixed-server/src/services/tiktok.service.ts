import axios from 'axios';

/**
 * Estructura de datos para contenido de TikTok
 */
export interface TikTokMedia {
  type: 'video' | 'photos';
  title: string;
  sanitizedTitle: string;
  author: string;
  thumbnail: string;
  urls: string[];
  audioUrl?: string;
}

/**
 * SERVICIO DE TIKTOK (@RyoMixed)
 * Utiliza la API de TikWM para extraer contenido sin marca de agua.
 */
export class TikTokService {
  
  /**
   * Limpia el texto para generar nombres de archivo seguros.
   * Prioriza el contenido antes de los hashtags.
   */
  private sanitize(text: string): string {
    if (!text) return 'TikTok_Media';
    
    // Extraemos solo el texto antes del primer hashtag
    const description = text.split('#')[0].trim() || 'TikTok_Post';
    
    return description
      .replace(/[^\w\s-]/gi, '') // Elimina caracteres especiales
      .replace(/\s+/g, '_')      // Cambia espacios por guiones bajos
      .substring(0, 50)          // Límite de 50 caracteres
      .concat(`_${Date.now().toString().slice(-4)}`); // Sufijo único para evitar colisiones
  }

  /**
   * Obtiene la información del TikTok (Video o Galería de Fotos).
   * @param url Link de TikTok (Soporta links cortos de móvil y largos de PC).
   */
  async getInfo(url: string): Promise<TikTokMedia> {
    try {
      // Normalización de la URL: eliminamos parámetros de rastreo
      const cleanUrl = url.split('?')[0];
      console.log(`🔎 [TikTok Service]: Extrayendo de ${cleanUrl}`);

      const response = await axios.post('https://www.tikwm.com/api/', 
        new URLSearchParams({
          url: cleanUrl,
          hd: '1' // Intentamos obtener siempre la versión HD
        }), {
          timeout: 12000,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }
      );

      const result = response.data;

      // Validación de respuesta de la API externa
      if (result.code !== 0 || !result.data) {
        throw new Error(result.msg || "El contenido no está disponible o es privado.");
      }

      const data = result.data;
      
      // Detectamos si es una galería de fotos (carrusel)
      const isPhotos = Array.isArray(data.images) && data.images.length > 0;
      const displayTitle = data.title || 'TikTok Post';

      return {
        type: isPhotos ? 'photos' : 'video',
        title: displayTitle,
        sanitizedTitle: this.sanitize(displayTitle),
        author: data.author?.nickname || 'TikTok_Creator',
        thumbnail: isPhotos ? data.images[0] : (data.cover || ''),
        // Si hay fotos, las mandamos todas. Si es video, priorizamos el link sin marca de agua (play)
        urls: isPhotos ? data.images : [data.play || data.wmplay || data.music],
        audioUrl: data.music || data.music_info?.play || ''
      };

    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : "Error de red";
      console.error("❌ [TikTok Service Error]:", errorMsg);
      
      // Error específico para fallos de conexión con la API proveedora
      if (errorMsg.includes('ENOTFOUND') || errorMsg.includes('timeout')) {
        throw new Error("El motor de extracción de TikTok está saturado. Reintenta en un momento.");
      }
      
      throw new Error(errorMsg);
    }
  }
}