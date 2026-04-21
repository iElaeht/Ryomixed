import axios from 'axios';
import NodeCache from 'node-cache';
import 'dotenv/config';
import { StatsService } from '../stats/stats.service.js';

/**
 * Configuración de Cache: 72 horas (259200 segundos)
 * checkperiod: Borra datos expirados cada hora para optimizar el uso de RAM.
 */
const cache = new NodeCache({ 
    stdTTL: 259200, 
    checkperiod: 3600 
});

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const HOST = 'instagram-downloader-scraper-reels-igtv-posts-stories.p.rapidapi.com';

/**
 * @function mapDownloaderToStandard
 * @description Normaliza la respuesta del motor Downloader al formato de RyoMixed.
 */
const mapDownloaderToStandard = (apiResponse: any) => {
    if (!apiResponse || !apiResponse.data) return null;

    const items = Array.isArray(apiResponse.data) ? apiResponse.data : [];

    return {
        title: "Instagram Content",
        author: "Instagram_User",
        media: items.map((item: any) => ({
            url: item.media, 
            type: item.isVideo ? 'video' : 'photo',
            thumbnail: item.thumb || item.media
        })),
        duration: 0 
    };
};

/**
 * @function getInstagramFromDownloader
 * @description Solicita información de Instagram. Implementa Cache y Registro de Stats real.
 * @param url URL limpia del contenido.
 */
export const getInstagramFromDownloader = async (url: string) => {
    // 1. Limpieza de URL para la llave de la cache
    const cleanUrl = url.replace(/\/$/, "").split('?')[0];

    // 2. Verificación en Cache (Gasto $0, no cuenta en Stats)
    const cachedData = cache.get(cleanUrl);
    if (cachedData) {
        console.log(`📦 [Cache]: Retornando datos guardados para ${cleanUrl}`);
        return cachedData;
    }

    try {
        console.log(`📡 [RapidAPI]: Consultando motor DOWNLOADER...`);

        const options = {
            method: 'GET',
            url: `https://${HOST}/scraper`,
            params: { url: cleanUrl },
            headers: {
                'x-rapidapi-key': RAPIDAPI_KEY,
                'x-rapidapi-host': HOST,
                'Content-Type': 'application/json'
            },
            timeout: 15000 
        };

        const response = await axios.request(options);

        if (response.data && response.data.data) {
            const standardizedData = mapDownloaderToStandard(response.data);

            // --- REGISTRO DE ACTIVIDAD REAL ---
            // Solo contamos si la API respondió (consumo de crédito confirmado)
            await StatsService.registerActivity('DOWNLOADER', true);

            console.log(`✅ [RapidAPI]: DOWNLOADER procesado con éxito.`);
            console.log(`📦 [Resultado]: Se extrajeron ${standardizedData?.media.length} archivos.`);

            // Guardamos en cache por 3 días
            cache.set(cleanUrl, standardizedData);
            
            return standardizedData;
        }

        return null;
    } catch (error: any) {
        // Registramos el fallo para control de salud del motor
        await StatsService.registerActivity('DOWNLOADER', false);
        console.error(`❌ [RapidAPI Downloader]: Falló la conexión (${error.message})`);
        return null;
    }
};