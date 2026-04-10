import type { Request, Response } from 'express';
import { TikTokService } from '../services/tiktok.service.js';
import axios from 'axios';

const tkService = new TikTokService();

export class TikTokController {
    async getInfo(req: Request, res: Response) {
        try {
            const { url } = req.body;
            if (!url) return res.status(400).json({ success: false, message: "URL requerida" });

            const info = await tkService.getInfo(url);
            res.json({ success: true, data: info });
        } catch (error: any) {
            console.error("❌ [TK Controller Error]:", error.message);
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async download(req: Request, res: Response) {
        try {
            const { url, title, type } = req.query;
            if (!url) return res.status(400).send("Falta la URL");

            // Definimos extensión y tipo de contenido
            let ext = 'mp4';
            let contentType = 'video/mp4';
            if (type === 'audio') { ext = 'mp3'; contentType = 'audio/mpeg'; }
            if (type === 'photos') { ext = 'jpg'; contentType = 'image/jpeg'; }

            // Sanitización del título para RyoMixed
            const safeTitle = String(title || 'RyoMixed_Media').replace(/[^a-zA-Z0-9]/g, '_');

            const response = await axios({
                method: 'get',
                url: url as string,
                responseType: 'stream',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
                }
            });

            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}.${ext}"`);

            response.data.pipe(res);
        } catch (error: any) {
            console.error("❌ [TK Download Error]:", error.message);
            if (!res.headersSent) res.status(500).send("No se pudo descargar el archivo");
        }
    }
}