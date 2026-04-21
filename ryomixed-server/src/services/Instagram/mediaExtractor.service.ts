import axios from 'axios';
import NodeCache from 'node-cache';
import 'dotenv/config';
import { StatsService } from '../stats/stats.service.js';

const cache = new NodeCache({ stdTTL: 259200, checkperiod: 3600 });
const RAPID_KEY = process.env.RAPIDAPI_KEY;
const HOST = 'instagram-media-extractor.p.rapidapi.com';

const mapExtractorToStandard = (data: any) => {
    const root = data.data || data;
    if (!root) return null;

    // Buscamos medios en todas las llaves posibles que usan estas APIs
    const mediaItems = root.medias || root.media || root.links || (Array.isArray(root) ? root : [root]);

    const mappedMedia = mediaItems.map((m: any) => {
        // Lógica de extracción de URL ultra-flexible
        const videoUrl = m.video_url || m.download_url || (m.type === 'video' ? m.url : null);
        const imageUrl = m.image_url || m.thumbnail_url || m.url;
        
        const finalUrl = videoUrl || imageUrl;
        if (!finalUrl) return null;

        // Determinamos el tipo con más precisión
        const isVideo = !!videoUrl || m.type === 'video' || m.isVideo || finalUrl.includes('.mp4');

        return {
            url: finalUrl,
            type: isVideo ? 'video' : 'photo',
            thumbnail: m.thumbnail || m.preview || imageUrl || finalUrl
        };
    }).filter((m: any) => m !== null && m.url);

    if (mappedMedia.length === 0) return null;

    return {
        title: root.title || root.caption || "Instagram Post",
        author: root.author?.username || root.username || "Instagram_User",
        media: mappedMedia,
        duration: root.duration || 0,
        thumbnail: root.thumbnail || mappedMedia[0]?.thumbnail
    };
};

export const getInstagramFromMediaExtractor = async (url: string) => {
    // 1. Limpiamos la URL de parámetros de rastreo (?igsh=..., etc)
    const cleanUrl = url.split('?')[0];
    
    // 2. Normalización: Aseguramos que termine en / para evitar el Error 400 en algunos motores
    const formattedUrl = cleanUrl.endsWith('/') ? cleanUrl : `${cleanUrl}/`;

    const cachedData = cache.get(formattedUrl);
    if (cachedData) return cachedData;

    try {
        console.log(`📡 [RapidAPI]: Consultando Media Extractor...`);

        const options = {
            method: 'GET',
            url: `https://${HOST}/api/download/instagram`,
            params: { url: formattedUrl },
            headers: {
                'x-rapidapi-key': RAPID_KEY,
                'x-rapidapi-host': HOST
            },
            timeout: 15000 // Añadimos un timeout para no bloquear la cascada si la API tarda
        };

        const response = await axios.request(options);

        // Verificamos que la API responda con éxito (algunas mandan status: 'success' o success: true)
        if (response.data && (response.data.success || response.data.data || Array.isArray(response.data))) {
            const standardizedData = mapExtractorToStandard(response.data);

            if (standardizedData && standardizedData.media.length > 0) {
                await StatsService.registerActivity('MEDIA_EXTRACTOR', true);
                console.log(`✅ [RapidAPI]: Media Extractor procesado con éxito.`);
                
                cache.set(formattedUrl, standardizedData);
                return standardizedData;
            }
        }
        
        // Si llegamos aquí sin datos válidos, lanzamos un aviso interno para que pase al Paso 2
        console.warn(`⚠️ [MediaExtractor]: No se encontraron medios en la respuesta.`);
        return null;

    } catch (error: any) {
        await StatsService.registerActivity('MEDIA_EXTRACTOR', false);
        
        // Log específico para debuguear el 400/500
        const status = error.response?.status || 'N/A';
        console.error(`❌ [MediaExtractor Error]: Status ${status} - ${error.message}`);
        
        return null;
    }
};