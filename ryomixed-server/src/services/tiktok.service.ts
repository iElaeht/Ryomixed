import axios from 'axios';

export interface TikTokMedia {
  type: 'video' | 'photos';
  title: string;
  sanitizedTitle: string;
  author: string;
  thumbnail: string;
  urls: string[];
  audioUrl?: string;
}

export class TikTokService {
  
  // Limpieza de títulos para nombres de archivos
  private sanitize(text: string): string {
    if (!text) return 'RyoMixed_Media';
    // Quitamos hashtags y caracteres no permitidos en sistemas de archivos
    const firstPart = text.split('#')[0] || 'RyoMixed_Media';
    return firstPart
      .trim()
      .replace(/[/\\?%*:|"<>]/g, '') 
      .replace(/\s+/g, '_')
      .substring(0, 80) || 'RyoMixed_Media';
  }

  async getInfo(url: string): Promise<TikTokMedia> {
    try {
      // Usamos la API de TikWM con URLSearchParams para máxima compatibilidad
      const res = await axios.post('https://www.tikwm.com/api/', new URLSearchParams({
        url: url,
        hd: '1' 
      }));

      if (res.data.code !== 0 || !res.data.data) {
        throw new Error(res.data.msg || "No se pudo encontrar el contenido. Verifica que el link sea público.");
      }

      const d = res.data.data;

      // Verificación de tipo: ¿Es un carrusel de imágenes?
      const isPhotos = Array.isArray(d.images) && d.images.length > 0;
      
      const displayTitle = d.title || 'TikTok Post';

      return {
        type: isPhotos ? 'photos' : 'video',
        title: displayTitle,
        sanitizedTitle: this.sanitize(displayTitle),
        author: d.author?.nickname || 'Creador de TikTok',
        thumbnail: d.cover || (isPhotos ? d.images[0] : ''),
        // Si son fotos, mandamos el array; si es video, el link 'play' (sin marca de agua)
        urls: isPhotos ? d.images : [d.play || d.wmplay],
        // Extraemos el audio para la opción de descarga de MP3
        audioUrl: d.music || d.music_info?.play || ''
      };
    } catch (error: any) {
      console.error("❌ [TikTokService] Error:", error.message);
      throw new Error(error.message || "Error al conectar con el motor de extracción.");
    }
  }
}