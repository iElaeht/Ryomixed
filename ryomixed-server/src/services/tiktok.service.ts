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
  
  private sanitize(text: string): string {
    if (!text) return 'RyoMixed_Media';
    
    // Quitamos hashtags para un nombre de archivo más limpio
    const firstPart = text.split('#')[0].trim() || 'TikTok_Post';
    
    const sanitized = firstPart
      .replace(/[^\w\s-]/gi, '') // Solo letras, números, espacios y guiones
      .replace(/\s+/g, '_')      // Espacios por guiones bajos
      .substring(0, 50);

    return sanitized || 'RyoMixed_Media';
  }

  async getInfo(url: string): Promise<TikTokMedia> {
    try {
      // Limpiamos la URL (mantiene compatibilidad PC/Móvil)
      const cleanUrl = url.split('?')[0];

      const res = await axios.post('https://www.tikwm.com/api/', 
        new URLSearchParams({
          url: cleanUrl,
          hd: '1' 
        }), {
          timeout: 12000, // Aumentado ligeramente para evitar timeouts en conexiones lentas
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }
      );

      if (res.data.code !== 0 || !res.data.data) {
        throw new Error(res.data.msg || "El contenido es privado o no existe");
      }

      const d = res.data.data;
      
      // Verificamos si es carrusel (photos) o video
      const isPhotos = Array.isArray(d.images) && d.images.length > 0;
      const displayTitle = d.title || 'TikTok Post';

      return {
        type: isPhotos ? 'photos' : 'video',
        title: displayTitle,
        sanitizedTitle: this.sanitize(displayTitle),
        author: d.author?.nickname || 'Creador de TikTok',
        thumbnail: isPhotos ? d.images[0] : (d.cover || ''),
        // Si son fotos, pasamos el array completo para la Galería
        urls: isPhotos ? d.images : [d.play || d.wmplay || d.music],
        audioUrl: d.music || d.music_info?.play || ''
      };
    } catch (error: unknown) {
      // Manejo de error profesional sin usar 'any'
      const msg = error instanceof Error ? error.message : "Error desconocido";
      console.error("❌ [TikTokService]:", msg);
      
      // Si es un error de DNS (ENOTFOUND), damos un mensaje más claro
      if (msg.includes('ENOTFOUND')) {
        throw new Error("El servidor de TikTok no responde. Intenta de nuevo en unos segundos.");
      }
      
      throw new Error(msg);
    }
  }
}