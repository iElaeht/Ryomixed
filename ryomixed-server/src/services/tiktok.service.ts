import axios from 'axios';
import { extractTikTokReel } from '../extractors/tiktok/reelTiktok.extractor.js';
import { extractTikTokPost } from '../extractors/tiktok/PostTiktok.extractor.js';

export interface TikTokMedia {
  type: 'video' | 'photos'; // Asegúrate de que esto coincida con lo que devuelve el extractor
  title: string;
  sanitizedTitle: string;
  author: string;
  thumbnail: string;
  urls: string[];
  audioUrl?: string;
  duration?: number;
}

export class TikTokService {
  
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

  async getInfo(url: string): Promise<TikTokMedia> {
    try {
      const cleanUrl = url.split('?')[0];
      console.log(`🔎 [TikTok Service]: Extrayendo de ${cleanUrl}`);

      const response = await axios.post('https://www.tikwm.com/api/', 
        new URLSearchParams({ url: cleanUrl, hd: '1' }), 
        {
          timeout: 12000,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }
      );

      const result = response.data;

      if (result.code !== 0 || !result.data) {
        throw new Error(result.msg || "El contenido no está disponible o es privado.");
      }

      const data = result.data;
      const videoId = data.id || ''; 
      
      const isPhotos = Array.isArray(data.images) && data.images.length > 0;

      // Usamos "as TikTokMedia" para asegurar la compatibilidad de la interfaz
      if (isPhotos) {
        return extractTikTokPost(data, (txt: string) => this.sanitize(txt, videoId)) as TikTokMedia;
      } else {
        return extractTikTokReel(data, (txt: string) => this.sanitize(txt, videoId)) as TikTokMedia;
      }

    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : "Error de red";
      console.error("❌ [TikTok Service Error]:", errorMsg);
      
      if (errorMsg.includes('ENOTFOUND') || errorMsg.includes('timeout')) {
        throw new Error("El motor de extracción de TikTok está saturado. Reintenta en un momento.");
      }
      throw new Error(errorMsg);
    }
  }
}