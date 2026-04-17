import { Router } from 'express';
import { TikTokController } from '../controllers/tiktok.controller.js';

const router = Router();
const tiktokController = new TikTokController();

/**
 * RUTAS DE TIKTOK (@RyoMixed)
 * Bypass de marcas de agua y descarga de carruseles/fotos.
 */

/**
 * @route   POST /api/tiktok/info
 * @desc    Obtiene la información del post, autor y links de medios.
 */
router.post('/info', tiktokController.getInfo.bind(tiktokController));

/**
 * @route   GET /api/tiktok/download
 * @desc    Inicia la descarga directa del video o foto.
 * @note    Cambiado a GET para permitir que el navegador gestione el stream 
 * de descarga directamente mediante un enlace dinámico.
 */
router.get('/download', tiktokController.download.bind(tiktokController));

export default router;