import { Request, Response } from 'express';
import { YouTubeService } from '../services/youtube.service.js';
import fs from 'fs';
import path from 'path';

// Instanciamos el servicio (esto activa setupFFmpeg y setupYtdl)
const youtubeService = new YouTubeService();

/**
 * CONTROLADOR DE YOUTUBE (@RyoMixed)
 * Gestiona peticiones de información y orquestación de descargas.
 */
export class YouTubeController {
    
    /**
     * Obtiene metadatos detallados de un video (Título, Formatos, Miniatura).
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
     * Inicia el proceso de descarga o conversión a MP3.
     */
    async download(req: Request, res: Response) {
        const { url, formatId, title, type } = req.body;

        try {
            if (!url || !formatId) {
                return res.status(400).send("Parámetros insuficientes (url y formatId requeridos).");
            }

            const isMp3 = type === 'audio' || formatId === 'mp3';
            const fileName = `${title || 'RyoMixed_Media'}.${isMp3 ? 'mp3' : 'mp4'}`;
            
            // Codificamos el nombre para que no haya errores con espacios o tildes
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
             * MONITOREO DE ERRORES EN TIEMPO REAL:
             * Verificamos que 'stderr' exista y sea una función para evitar errores en logs.
             */
            if (subprocess && subprocess.stderr && typeof subprocess.stderr.on === 'function') {
                subprocess.stderr.on('data', (data: any) => {
                    const log = data.toString();
                    // Solo logueamos si es un error real, no advertencias comunes
                    if (log.includes('ERROR') || log.includes('HTTP Error')) {
                        console.error(`[yt-dlp engine]: ${log.trim()}`);
                    }
                });
            }

            /**
             * PROTECCIÓN DE RECURSOS (Anti-Zombie):
             * Si el usuario cierra la pestaña o cancela en el móvil, matamos el motor.
             */
            req.on('close', () => {
                if (subprocess && typeof subprocess.kill === 'function') {
                    console.log(`⚠️ Conexión abortada por el usuario. Deteniendo motor para: ${fileName}`);
                    // SIGKILL asegura que el proceso se detenga de inmediato
                    subprocess.kill('SIGKILL'); 
                }
            });

        } catch (error: any) {
            console.error("🔴 [YouTubeController Download]:", error.message);
            // Solo enviamos error si la respuesta no ha empezado ya (evita doble header)
            if (!res.headersSent) {
                res.status(500).send("Error crítico en el motor de descarga.");
            }
        }
    }
}

/**
 * FUNCIÓN DE LIMPIEZA (@RyoMixed)
 * Escanea la raíz del proyecto para borrar archivos temporales que no se eliminaron.
 */
export const cleanTempFiles = () => {
    const rootPath = process.cwd();
    
    try {
        const files = fs.readdirSync(rootPath);
        console.log("🧹 [RyoMixed Cleaner]: Iniciando limpieza de residuos...");

        files.forEach(file => {
            if (file.startsWith('ryo_tmp_') || file.startsWith('ryo_download_')) {
                const filePath = path.join(rootPath, file);
                try {
                    const stats = fs.statSync(filePath);
                    const now = new Date().getTime();
                    const fileAgeInMinutes = (now - stats.mtimeMs) / (1000 * 60);

                    // Borramos archivos de más de 15 minutos
                    if (fileAgeInMinutes > 15) {
                        fs.unlinkSync(filePath);
                        console.log(`🗑️ Eliminado residuo antiguo: ${file}`);
                    }
                } catch (err) {
                    console.error(`❌ Falló al procesar ${file}:`, err);
                }
            }
        });
    } catch (error) {
        console.error("❌ [Cleaner Error]: No se pudo acceder al directorio raíz.");
    }
};