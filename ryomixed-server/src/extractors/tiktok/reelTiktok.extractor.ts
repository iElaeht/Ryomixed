import { TikTokMedia } from '../../services/tiktok.service.js';

/**
 * EXTRACTOR DE REELS/VIDEOS (TikTok)
 * Procesa la data recibida de la API para extraer videos individuales.
 */
export const extractTikTokReel = (data: any, sanitizeFn: (text: string) => string): TikTokMedia => {
    const displayTitle = data.title || 'TikTok Video';

    return {
        type: 'video',
        title: displayTitle,
        sanitizedTitle: sanitizeFn(displayTitle),
        author: data.author?.nickname || 'TikTok_Creator',
        thumbnail: data.cover || '',
        // Mapeamos la duración (asegurándonos de que sea un número)
        duration: data.duration ? Number(data.duration) : 0, 
        // Prioridad: Link sin marca de agua (play) > Link con marca (wmplay)
        urls: [data.play || data.wmplay].filter(Boolean), // Filtramos para evitar nulos
        audioUrl: data.music || data.music_info?.play || ''
    };
};