import { Router } from 'express';
import { InstagramController } from '../controllers/instagram.controller.js';

const router = Router();
const instagramController = new InstagramController();

/**
 * RUTAS DE INSTAGRAM (@RyoMixed)
 * Centraliza la extracción, descarga y bypass de CORS para imágenes.
 */

/**
 * @route   POST /api/instagram/info
 * @desc    Obtiene metadatos de Reels, Posts o Carruseles.
 */
router.post('/info', instagramController.getInfo.bind(instagramController));

/**
 * @route   GET /api/instagram/download
 * @desc    Inicia el streaming de descarga de un recurso específico.
 */
router.get('/download', instagramController.download.bind(instagramController));

/**
 * @route   GET /api/instagram/proxy/image
 * @desc    Proxy para cargar miniaturas de Instagram evitando el error 403.
 * Resuelve el problema de los "cuadros negros" en el Frontend.
 */
router.get('/proxy/image', instagramController.proxyImage.bind(instagramController));

export default router;