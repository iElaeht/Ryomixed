import type { Request, Response } from 'express';
import { TikTokService } from '../services/tiktok.service.js';
import axios from 'axios';

const tkService = new TikTokService();

export class TikTokController {
  
  async getInfo(req: Request, res: Response) {
    const { url } = req.body;
    console.log("🔍 [TikTokController] Petición de info para:", url);

    if (!url) {
      return res.status(400).json({ success: false, message: "URL obligatoria" });
    }

    try {
      const info = await tkService.getVideoInfo(url);
      console.log("✅ [TikTokController] Info encontrada:", info.title);
      return res.json({ success: true, data: info });
    } catch (error: any) {
      console.error("❌ [TikTokController] Error en getInfo:", error.message);
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async download(req: Request, res: Response) {
    const { url, title, type } = req.query;
    console.log("💾 [TikTokController] Intento de descarga:", { title, type });

    if (!url) {
      return res.status(400).send('Falta la URL de descarga');
    }

    try {
      let ext = 'mp4';
      let contentType = 'video/mp4';

      if (type === 'audio') {
        ext = 'mp3';
        contentType = 'audio/mpeg';
      } else if (type === 'photos') {
        ext = 'jpg';
        contentType = 'image/jpeg';
      }

      // --- BLOQUE DE SANITIZACIÓN ANTI-ERROR (EMOJIS Y CARACTERES ESPECIALES) ---
      // 1. Convertimos a string y normalizamos (quita tildes pero mantiene letras)
      const cleanTitle = String(title || `AI_Mangas_${Date.now()}`)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      // 2. Filtro estricto: Solo permitimos letras, números, espacios, guiones y puntos.
      // Esto elimina emojis y símbolos que rompen el header "Content-Disposition".
      const safeFileName = cleanTitle
        .replace(/[^a-zA-Z0-9\s-_.]/g, '') 
        .replace(/\s+/g, '_') // Espacios por guiones bajos
        .substring(0, 150)    // Limitamos longitud por seguridad
        .trim();

      const finalFileName = `${safeFileName}.${ext}`;
      console.log("📄 [TikTokController] Nombre final sanitizado:", finalFileName);

      // --- PETICIÓN DE STREAM ---
      const response = await axios({
        method: 'get',
        url: url as string,
        responseType: 'stream',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Referer': 'https://www.tiktok.com/'
        }
      });

      // --- CONFIGURACIÓN DE HEADERS ---
      res.setHeader('Content-Type', contentType);
      
      // Codificamos el nombre para que el estándar 'filename*' lo entienda perfectamente
      const encodedName = encodeURIComponent(finalFileName);
      
      /**
       * Para evitar el error "Invalid character", el nombre en 'filename' (el primero)
       * debe ser ASCII puro. El segundo (filename*) es el que permite caracteres especiales.
       */
      res.setHeader(
        'Content-Disposition', 
        `attachment; filename="${safeFileName}.${ext}"; filename*=UTF-8''${encodedName}`
      );
      
      response.data.pipe(res);

      response.data.on('end', () => {
        console.log("🏁 [TikTokController] Descarga terminada con éxito.");
      });

    } catch (error: any) {
      console.error("❌ [TikTokController] Error crítico en download:", error.message);
      
      if (!res.headersSent) {
        res.status(500).send("Error al procesar la descarga.");
      }
    }
  }
}