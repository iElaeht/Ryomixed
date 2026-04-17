import { Router } from 'express';
import { YouTubeController } from '../controllers/youtube.controller.js';

const router = Router();
const youtubeController = new YouTubeController();

/**
 * RUTAS DE YOUTUBE (@RyoMixed)
 * Maneja la integración con yt-dlp y el procesamiento de FFmpeg.
 */

/**
 * @route   POST /api/youtube/info
 * @desc    Extrae metadatos y lista de formatos (calidades) disponibles.
 * @access  Público
 */
router.post('/info', youtubeController.getInfo.bind(youtubeController));

/**
 * @route   POST /api/youtube/download
 * @desc    Procesa y sirve el archivo final (MP4 con merge o MP3).
 * @note    Se usa POST aquí porque el frontend envía el objeto de formato elegido.
 */
router.post('/download', youtubeController.download.bind(youtubeController));

export default router;