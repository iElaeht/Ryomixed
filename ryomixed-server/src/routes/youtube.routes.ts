import { Router } from 'express';
import * as youtubeController from '../controllers/youtube.controller.js';

const router = Router();

router.post('/info', youtubeController.getInfo);
router.get('/download', youtubeController.download);

export default router;