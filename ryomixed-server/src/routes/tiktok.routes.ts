import { Router } from 'express';
import { TikTokController } from '../controllers/tiktok.controller.js';

const router = Router();
const tiktokController = new TikTokController();

// Esta se queda igual porque el buscador envía un JSON
router.post('/info', (req, res) => tiktokController.getInfo(req, res));

// CAMBIO CRUCIAL: Cambiar .post por .get para que coincida con el fetch del Flow
router.get('/download', (req, res) => tiktokController.download(req, res));

export default router;