import { Router } from 'express';
import { TikTokController } from '../controllers/tiktok.controller.js';

const router = Router();
const tkController = new TikTokController();

// POST para obtener la info del video o carrusel
router.post('/info', (req, res) => tkController.getInfo(req, res));

// GET para descargar el recurso procesado
router.get('/download', (req, res) => tkController.download(req, res));

export default router;