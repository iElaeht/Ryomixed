import type { Request, Response } from 'express';
import { YouTubeService } from '../services/youtube.service.js';

const ytService = new YouTubeService();

export class YouTubeController {
    async getInfo(req: Request, res: Response) {
        try {
            const { url } = req.body;
            if (!url) return res.status(400).json({ success: false, message: "URL requerida" });

            const info = await ytService.getInfo(url);
            res.json({ success: true, data: info });
        } catch (error: any) {
            console.error("❌ [YT Controller Error]:", error.message);
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async download(req: Request, res: Response) {
        try {
            const { url, format, title } = req.query;
            if (!url) return res.status(400).send("Falta la URL");

            const isAudio = format === 'mp3';
            const ext = isAudio ? 'mp3' : 'mp4';
            
            // Sanitización para el header de descarga
            const safeTitle = String(title || 'RyoMixed_Video').replace(/[^a-zA-Z0-9]/g, '_');

            res.setHeader('Content-Type', isAudio ? 'audio/mpeg' : 'video/mp4');
            res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}.${ext}"`);

            await ytService.execDownload(url as string, format as string, res);
        } catch (error: any) {
            console.error("❌ [YT Download Error]:", error.message);
            if (!res.headersSent) res.status(500).send("Error procesando la descarga");
        }
    }
}