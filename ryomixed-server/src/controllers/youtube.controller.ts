import type { Request, Response } from 'express';
import { getVideoInfo, downloadStream } from '../services/youtube.service.js';

export const getInfo = async (req: Request, res: Response) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ message: "La URL es obligatoria" });

    try {
        const info = await getVideoInfo(url);
        // Enviamos el objeto 'info' directamente
        return res.json(info); 
    } catch (error: any) {
        return res.status(400).json({ message: error.message });
    }
};

export const download = async (req: Request, res: Response) => {
    const { url, format, quality, title } = req.query;
    if (!url) return res.status(400).send('Falta la URL');

    try {
        const isMp3 = format === 'mp3';
        const fileName = title ? `${title}.${isMp3 ? 'mp3' : 'mp4'}` : `video.${isMp3 ? 'mp3' : 'mp4'}`;

        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
        res.setHeader('Content-Type', isMp3 ? 'audio/mpeg' : 'video/mp4');

        downloadStream(url as string, isMp3 ? 'mp3' : (quality as string), res);
    } catch (error: any) {
        if (!res.headersSent) res.status(500).send("Error en la descarga");
    }
};