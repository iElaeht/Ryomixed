import { Router } from 'express';
import { getVideoInfo, downloadStream } from '../services/youtube.service.js';

const router = Router();

// 1. POST /api/download/info -> Metadatos del video
router.post('/info', async (req, res) => {
    const { url } = req.body;
    
    if (!url) {
        return res.status(400).json({ message: "La URL es obligatoria" });
    }

    try {
        const info = await getVideoInfo(url);
        // Ahora info incluye 'formats', 'sanitizedTitle' e 'isTikTok'
        res.json({ 
            message: "Video encontrado con éxito", 
            video: info 
        });
    } catch (error: any) {
        console.error("Error en /info:", error.message);
        res.status(400).json({ message: error.message });
    }
});

// 2. GET /api/download -> Stream de descarga con Calidad y Título Real
router.get('/', async (req, res) => {
    // Recibimos 'title' y 'quality' (el ID del formato) además del formato base
    const { url, format, quality, title } = req.query;

    if (!url) {
        return res.status(400).send('Falta la URL del video');
    }

    try {
        const isMp3 = format === 'mp3';
        const ext = isMp3 ? 'mp3' : 'mp4';
        
        // Usamos el título enviado por el frontend o uno genérico por defecto
        const finalFileName = title ? `${title}.${ext}` : `RyoMixed_${Date.now()}.${ext}`;

        // Configuramos encabezados para que el navegador descargue con el nombre real
        res.setHeader('Content-Disposition', `attachment; filename="${finalFileName}"`);
        res.setHeader('Content-Type', isMp3 ? 'audio/mpeg' : 'video/mp4');
        res.setHeader('Transfer-Encoding', 'chunked'); 

        // Determinamos qué enviar al downloadStream:
        // Si es MP3, enviamos 'mp3'. 
        // Si es MP4, enviamos el ID de calidad (quality) o 'best_mp4' si no hay uno.
        const targetFormat = isMp3 ? 'mp3' : (quality as string || 'best_mp4');

        downloadStream(url as string, targetFormat, res);

        console.log(`🚀 Descarga iniciada: ${finalFileName} | Calidad ID: ${targetFormat}`);

    } catch (error: any) {
        console.error("❌ Error crítico en descarga:", error.message);
        if (!res.headersSent) {
            res.status(500).send("Error al procesar el archivo");
        }
    }
});

export default router;