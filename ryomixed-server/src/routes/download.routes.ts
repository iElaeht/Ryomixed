import { Router } from 'express';
import { getVideoInfo } from '../services/youtube.service.js';

const router = Router();

router.post('/info', async (req, res) => {
    const { url } = req.body;
    try {
        const info = await getVideoInfo(url);
        res.json({ 
            message: "Video encontrado con éxito", 
            video: info 
        });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

export default router;