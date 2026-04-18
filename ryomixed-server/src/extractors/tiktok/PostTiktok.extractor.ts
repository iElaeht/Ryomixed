import { TikTokMedia } from '../../services/tiktok.service.js';

/**
 * EXTRACTOR DE POSTS/GALERÍAS (TikTok)
 * Maneja la lógica de carruseles de fotos, GIFs y metadatos asociados.
 */
export const extractTikTokPost = (data, sanitizeFn) => {
    // 1. Definimos un título por defecto si viene vacío
    const displayTitle = data.title || 'TikTok Gallery';

    // 2. Priorizamos la primera imagen del carrusel como miniatura principal
    const mainThumbnail = (data.images && data.images.length > 0) 
        ? data.images[0] 
        : (data.cover || '');

    return {
        type: 'photos',
        title: displayTitle,
        sanitizedTitle: sanitizeFn(displayTitle),
        author: data.author?.nickname || 'TikTok_Creator',
        thumbnail: mainThumbnail,
        
        /** * Mapeamos todas las imágenes. 
         * Si la API devuelve URLs directas en el array 'images', las usamos.
         */
        urls: Array.isArray(data.images) ? data.images : [],
        
        /** * El audio es vital en los carruseles de TikTok.
         * Intentamos obtenerlo de varias fuentes posibles de la respuesta.
         */
        audioUrl: data.music || data.music_info?.play || '',

        /**
         * Aunque sea un carrusel de fotos, TikTok suele asignar una duración 
         * basada en la música de fondo. La incluimos para que el front no muestre error.
         */
        duration: data.duration ? Number(data.duration) : 0
    };
};