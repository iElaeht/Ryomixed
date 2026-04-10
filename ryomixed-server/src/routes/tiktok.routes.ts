import { Router } from 'express';
import { TikTokController } from '../controllers/tiktok.controller.js';

const router = Router();
const tkController = new TikTokController();

// Definimos las rutas apuntando a los métodos del controlador
router.post('/info', (req, res) => tkController.getInfo(req, res));
router.get('/download', (req, res) => tkController.download(req, res));

export default router;