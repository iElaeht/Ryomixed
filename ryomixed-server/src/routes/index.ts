import { Router } from 'express';
import youtubeRoutes from './youtube.routes.js';
import tiktokRoutes from './tiktok.routes.js';

const router = Router();

// Agrupación lógica
router.use('/youtube', youtubeRoutes); // Todas las rutas de YouTube colgarán de /api/youtube
router.use('/tiktok', tiktokRoutes);   // Todas las rutas de TikTok colgarán de /api/tiktok

export default router;