import axios from 'axios';

interface TikTokRawResponse {
  images?: string[];
  title?: string;
  description?: string;
  video_url?: string;
  cover?: string;
  author?: {
    nickname: string;
    avatar?: string;
  };
  music_info?: {
    play_url: string;
    title: string;
  };
}

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
  
  private cleanTitle(text: string): string {
    if (!text) return 'TikTok_Media';
    // Quitamos los hashtags y emojis básicos para el nombre del archivo
    const parts = text.split('#');
    const firstPart = parts[0];
    if (!firstPart) return 'TikTok_Media';

    return firstPart
      .trim()
      .replace(/[/\\?%*:|"<>]/g, '') 
      .replace(/\s+/g, '_')          
      .substring(0, 100)             
      || 'TikTok_Media';             
  }

  async getVideoInfo(url: string): Promise<TikTokMedia> {
    try {
      const rawResponse = await this.fetchFromAPI(url); 

      const isPhotos = !!(rawResponse.images && rawResponse.images.length > 0);
      
      // Priorizamos el título o descripción real que venga de la API
      const displayTitle = rawResponse.title || rawResponse.description || 'TikTok Post';
      const cleanName = this.cleanTitle(displayTitle);

      return {
        type: isPhotos ? 'photos' : 'video',
        title: displayTitle,
        sanitizedTitle: cleanName,
        author: rawResponse.author?.nickname || 'Creador de TikTok',
        thumbnail: isPhotos ? (rawResponse.images?.[0] || '') : (rawResponse.cover || ''),
        urls: isPhotos ? (rawResponse.images || []) : [rawResponse.video_url || ''],
        audioUrl: rawResponse.music_info?.play_url || ''
      };
    } catch (error: any) {
      console.error("Error en TikTokService:", error.message);
      throw new Error("No se pudo extraer la información del video. El enlace podría ser privado o inválido.");
    }
  }

  private async fetchFromAPI(url: string): Promise<TikTokRawResponse> {
    try {
      // Usamos la API de TikWM para obtener datos reales
      const res = await axios.post('https://www.tikwm.com/api/', {
        url: url
      });

      if (res.data.code !== 0) {
        throw new Error(res.data.msg || "Error en la API externa");
      }

      const d = res.data.data;

      // Mapeamos el formato de TikWM a nuestro TikTokRawResponse
      return {
        description: d.title, // TikWM llama 'title' a la descripción del post
        video_url: d.play,    // Video sin marca de agua
        cover: d.cover,
        images: d.images,     // Si es un carrusel de fotos
        author: {
          nickname: d.author.nickname
        },
        music_info: {
          play_url: d.music,
          title: d.music_info.title
        }
      };
    } catch (error) {
      throw new Error("Error al conectar con el motor de extracción");
    }
  }
}