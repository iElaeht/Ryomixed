import type { Request, Response } from 'express';
import { TikTokService } from '../services/tiktok.service.js';
import axios from 'axios';

const tkService = new TikTokService();

/**
 * CONTROLADOR DE TIKTOK (@RyoMixed)
 * Encargado de servir el contenido extraído por la API de TikWM.
 */
export class TikTokController {
    
    /**
     * Obtiene info del TikTok (Video o Fotos).
     */
    async getInfo(req: Request, res: Response) {
        try {
            const { url } = req.body;
            if (!url) return res.status(400).json({ success: false, message: "URL requerida" });

            const info = await tkService.getInfo(url);
            res.json({ success: true, data: info });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    /**
     * Realiza el pipe del stream desde los servidores de TikTok al cliente.
     */
    async download(req: Request, res: Response) {
        try {
            const { url, title, type } = req.query; 
            if (!url) return res.status(400).send("Falta la URL de origen.");

            // Determinación de extensión y tipo
            let ext = 'mp4';
            let contentType = 'video/mp4';
            
            if (type === 'audio') { 
                ext = 'mp3'; 
                contentType = 'audio/mpeg'; 
            } else if (type === 'photos') { 
                ext = 'jpg'; // O 'png' según devuelva la API
                contentType = 'image/jpeg'; 
            }

            const safeTitle = String(title || 'TikTok_RyoMixed').replace(/[^a-zA-Z0-9]/g, '_');
            const encodedName = encodeURIComponent(safeTitle);

            // Petición de stream a la CDN de TikTok
            const response = await axios({
                method: 'get',
                url: url as string,
                responseType: 'stream',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
                    'Referer': 'https://www.tiktok.com/' // TikTok a veces bloquea si no hay referer
                },
                timeout: 30000 // Aumentado a 30s para carruseles pesados
            });

            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Disposition', `attachment; filename="${encodedName}.${ext}"; filename*=UTF-8''${encodedName}.${ext}`);

            // Manejo de cierre inesperado de la conexión
            res.on('close', () => {
                if (response.data) response.data.destroy();
            });

            // Conexión directa: CDN -> Backend -> Cliente
            response.data.pipe(res);

        } catch (error: any) {
            console.error("❌ [TikTokController Download]:", error.message);
            if (!res.headersSent) res.status(500).send("Error al canalizar la descarga.");
        }
    }
}