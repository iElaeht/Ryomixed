import { Router } from 'express';
import { YouTubeController } from '../controllers/youtube.controller.js';

const router = Router();
const youtubeController = new YouTubeController();

/**
 * RUTA: POST /api/youtube/info
 * DESCRIPCIÓN: Recibe una URL y devuelve los metadatos (título, duración, calidades).
 * DETALLE: Es el primer paso cuando el usuario hace clic en "Buscar".
 */
router.post('/info', (req, res) => youtubeController.getInfo(req, res));

/**
 * RUTA: POST /api/youtube/download
 * DESCRIPCIÓN: Inicia el flujo de descarga de video o audio MP3.
 * DETALLE: Se dispara cuando el usuario hace clic en "Continuar a descarga".
 */
router.post('/download', (req, res) => youtubeController.download(req, res));

export default router;