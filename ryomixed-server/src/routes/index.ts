import { Router } from 'express';
import youtubeRoutes from './youtube.routes.js';
import tiktokRoutes from './tiktok.routes.js';
import instagramRoutes from './instagram.routes.js';

const router = Router();

/**
 * ENRUTADOR MAESTRO (@RyoMixed API)
 * Aquí se centralizan todos los módulos de extracción.
 * Estructura de acceso: /api/[plataforma]/[acción]
 */

// Módulo de YouTube (yt-dlp + FFmpeg)
router.use('/youtube', youtubeRoutes);   

// Módulo de TikTok (TikWM API)
router.use('/tiktok', tiktokRoutes);     

// Módulo de Instagram (Multi-Extractor: Posts, Reels, Carruseles)
router.use('/instagram', instagramRoutes);

/**
 * PRÓXIMAS INTEGRACIONES (Hoja de ruta)
 * router.use('/x', xRoutes);
 * router.use('/facebook', facebookRoutes);
 */

export default router;