import { Router } from 'express';
import { YouTubeController } from '../controllers/youtube.controller.js';

const router = Router();
const ytController = new YouTubeController();

// POST para obtener info (evita problemas de longitud de URL en GET)
router.post('/info', (req, res) => ytController.getInfo(req, res));

// GET para la descarga (permite que el navegador maneje el stream)
router.get('/download', (req, res) => ytController.download(req, res));

export default router;