import { Request, Response } from 'express';
import { YouTubeService } from '../services/youtube.service.js';

const youtubeService = new YouTubeService();

export class YouTubeController {
    async getInfo(req: Request, res: Response) {
        try {
            const { url } = req.body;
            if (!url) {
                return res.status(400).json({ 
                    success: false, 
                    message: "La URL es obligatoria." 
                });
            }

            const data = await youtubeService.getInfo(url);
            // Mantenemos el formato de respuesta que tu Frontend espera para la vista
            return res.json({ success: true, data });

        } catch (error: any) {
            console.error("🔴 [Controller GetInfo Error]:", error.message);
            return res.status(500).json({ 
                success: false, 
                message: error.message || "Error al obtener info." 
            });
        }
    }

    async download(req: Request, res: Response) {
        const { url, formatId, title, type } = req.body;

        try {
            if (!url || !formatId) {
                return res.status(400).send("Faltan parámetros críticos.");
            }

            const isMp3 = type === 'audio' || formatId === 'mp3';
            const fileName = `${title || 'RyoMixed_Media'}.${isMp3 ? 'mp3' : 'mp4'}`;

            /**
             * LÓGICA DE CABECERAS (HÍBRIDA):
             * Solo configuramos cabeceras manualmente si es MP3 (Streaming directo).
             * Si es MP4, el Service usará res.download() que gestiona sus propias cabeceras.
             */
            if (isMp3) {
                res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
                res.setHeader('Content-Type', 'audio/mpeg');
                res.setHeader('Transfer-Encoding', 'chunked');
            }

            // Llamamos al Service
            const subprocess = await youtubeService.execDownload(url, formatId, res);

            /**
             * LIMPIEZA DE PROCESOS:
             * Vital para tu hardware. Si el usuario cierra la conexión, matamos el proceso.
             */
            req.on('close', () => {
                if (subprocess && typeof subprocess.kill === 'function') {
                    console.log(`⚠️ Conexión cerrada. Deteniendo motor RyoMixed para: ${fileName}`);
                    subprocess.kill(); 
                }
            });

        } catch (error: any) {
            console.error("🔴 [Controller Download Error]:", error);
            if (!res.headersSent) {
                res.status(500).send("Error crítico en el flujo de descarga.");
            }
        }
    }
}