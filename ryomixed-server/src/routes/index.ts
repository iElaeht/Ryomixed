import { Router } from 'express';
import youtubeRoutes from './youtube.routes.js';
import tiktokRoutes from './tiktok.routes.js';

const router = Router();

router.use('/youtube', youtubeRoutes);
router.use('/tiktok', tiktokRoutes);

export default router;