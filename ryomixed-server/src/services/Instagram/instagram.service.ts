import { extractInstagramVideo } from '../../extractors/instagram/reel.extractor.js';
import { extractPostImage } from '../../extractors/instagram/PostImage.extractor.js';
import { getInstagramFromRapid } from './RapidApi.service.js';
import https from 'https';

export class InstagramService {
  
  async getInfo(url: string) {
    try {
      const cleanUrl = url.split('?')[0];
      console.log(`\n🔎 [Service]: ========================================`);
      console.log(`🔎 [Service]: Analizando: ${cleanUrl}`);
      console.log(`🔎 [Service]: ========================================`);

      let finalData: any = null;

      console.log(`🚀 [Step 1]: Consultando API STABLE (RapidAPI)...`);
      const rapidData = await getInstagramFromRapid(cleanUrl);

      if (rapidData) {
        console.log(`✅ [Step 1]: Datos recibidos de STABLE.`);
        finalData = this.mapRapidToInternal(rapidData, cleanUrl);
      } else {
        console.warn(`⚠️ [Step 1]: STABLE falló. Usando Extractor Local.`);
        
        let imageData: any = null;
        let videoData: any = null;

        try {
          imageData = await extractPostImage(cleanUrl);
        } catch (e) {
          console.warn(`❌ [Step 2.1]: PostImage falló.`);
        }

        const appearsIncomplete = !imageData || !imageData.media || imageData.media.length <= 1;

        if (appearsIncomplete) {
          try {
            videoData = await extractInstagramVideo(cleanUrl);
          } catch (e) {
            console.warn(`❌ [Step 2.2]: Motor de Video falló.`);
          }
        }

        finalData = videoData || imageData;
      }

      if (!finalData || !finalData.media || finalData.media.length === 0) {
        throw new Error("No se pudo extraer información de ninguna fuente.");
      }

      const mediaMapped = finalData.media.map((item: any) => ({
        ...item,
        duration: item.duration || finalData.duration || 0 
      }));

      return {
        platform: 'instagram',
        type: mediaMapped.length > 1 ? 'carousel' : (mediaMapped[0]?.type === 'video' ? 'video' : 'photo'),
        title: finalData.title || 'Instagram Post',
        sanitizedTitle: finalData.sanitizedTitle || 'instagram_post',
        author: finalData.author || 'Instagram_User',
        thumbnail: finalData.thumbnail || mediaMapped[0]?.thumbnail,
        media: mediaMapped,
        duration: finalData.duration || mediaMapped[0]?.duration || 0,
        originalUrl: cleanUrl
      };

    } catch (error: any) {
      console.error(`❌ [InstagramService Error]: ${error.message}`);
      throw new Error("Contenido privado o no disponible.");
    }
  }

  private mapRapidToInternal(data: any, originalUrl: string) {
    console.log("📦 [JSON Recibido]:", JSON.stringify(data, null, 2));

    // Ahora data.media ya trae el {url, type, thumbnail} correcto desde el Api.service
    const media = data.media.map((item: any) => ({
        url: item.url,
        type: item.type, 
        thumbnail: item.thumbnail
    }));
    
    return {
      title: data.description || "Post de Instagram",
      sanitizedTitle: "instagram_post",
      author: data.author || "Instagram_User",
      media: media, 
      thumbnail: data.media[0]?.thumbnail || "",
      duration: 0
    };
  }

  async execDownload(url: string, res: any, sanitizedTitle: string, type: string = 'video') {
    const decodedUrl = decodeURIComponent(url);
    const isVideo = type.toLowerCase() === 'video' || type === 'REEL';
    const extension = isVideo ? 'mp4' : 'jpg';
    
    const finalFileName = isVideo ? `Reel_${sanitizedTitle}` : `Post_${sanitizedTitle}`;

    res.setHeader('Content-Type', isVideo ? 'video/mp4' : 'image/jpeg');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(finalFileName)}.${extension}"`);

    https.get(decodedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.instagram.com/'
      }
    }, (stream) => {
      stream.pipe(res);
    }).on('error', (e) => {
      console.error("❌ [Download Error]:", e.message);
    });
  }
}