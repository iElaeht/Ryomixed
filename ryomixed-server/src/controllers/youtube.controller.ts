import { Request, Response } from 'express';
import { YouTubeService } from '../services/youtube.service.js';
import fs from 'fs';
import path from 'path';
const youtubeService = new YouTubeService();

/**
 * CONTROLADOR DE YOUTUBE (@RyoMixed)
 * Gestiona peticiones de información y orquestación de descargas pesadas.
 */
export class YouTubeController {
    
    /**
     * Obtiene metadatos detallados de un video.
     */
    async getInfo(req: Request, res: Response) {
        try {
            const { url } = req.body;
            if (!url) {
                return res.status(400).json({ success: false, message: "URL requerida." });
            }

            const data = await youtubeService.getInfo(url);
            return res.json({ success: true, data });

        } catch (error: any) {
            console.error("🔴 [YouTubeController Info]:", error.message);
            return res.status(500).json({ 
                success: false, 
                message: error.message || "Error al procesar YouTube." 
            });
        }
    }

    /**
     * Inicia el proceso de descarga/conversión.
     */
    async download(req: Request, res: Response) {
        const { url, formatId, title, type } = req.body;

        try {
            if (!url || !formatId) {
                return res.status(400).send("Parámetros insuficientes.");
            }

            const isMp3 = type === 'audio' || formatId === 'mp3';
            const fileName = `${title || 'RyoMixed_Media'}.${isMp3 ? 'mp3' : 'mp4'}`;
            const encodedName = encodeURIComponent(fileName);

            // Configuración de cabeceras para streaming MP3
            if (isMp3) {
                res.setHeader('Content-Type', 'audio/mpeg');
                res.setHeader('Content-Disposition', `attachment; filename="${encodedName}"; filename*=UTF-8''${encodedName}`);
                res.setHeader('Transfer-Encoding', 'chunked');
            }

            // Ejecutamos la descarga en el Service
            const subprocess = await youtubeService.execDownload(url, formatId, res);

            /**
             * PROTECCIÓN DE RECURSOS:
             * Si el usuario cierra la pestaña o cancela la descarga, matamos el proceso de FFmpeg/yt-dlp
             * para liberar CPU y RAM inmediatamente.
             */
            req.on('close', () => {
                if (subprocess && typeof subprocess.kill === 'function') {
                    console.log(`⚠️ Conexión abortada. Deteniendo motor para: ${fileName}`);
                    subprocess.kill('SIGKILL'); 
                }
            });

        } catch (error: any) {
            console.error("🔴 [YouTubeController Download]:", error.message);
            if (!res.headersSent) {
                res.status(500).send("Error en el motor de descarga.");
            }
        }
    }
}
/**
 * Función de limpieza para RyoMixed
 * Borra archivos temporales huérfanos para ahorrar espacio en disco.
 */
export const cleanTempFiles = () => {
    const rootPath = process.cwd();
    const files = fs.readdirSync(rootPath);

    console.log("🧹 [RyoMixed Cleaner]: Iniciando limpieza de archivos temporales...");

    files.forEach(file => {
        // Buscamos archivos que empiecen con nuestro prefijo ryo_tmp_ o ryo_download_
        if (file.startsWith('ryo_tmp_') || file.startsWith('ryo_download_')) {
            const filePath = path.join(rootPath, file);
            try {
                const stats = fs.statSync(filePath);
                const now = new Date().getTime();
                const fileAgeInMinutes = (now - stats.mtimeMs) / (1000 * 60);

                // Borramos archivos que tengan más de 15 minutos (por seguridad)
                if (fileAgeInMinutes > 15) {
                    fs.unlinkSync(filePath);
                    console.log(`🗑️  Eliminado residuo: ${file}`);
                }
            } catch (err) {
                console.error(`❌ No se pudo borrar ${file}:`, err);
            }
        }
    });
};