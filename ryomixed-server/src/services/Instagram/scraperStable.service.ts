import axios from 'axios';
import NodeCache from 'node-cache';
import 'dotenv/config';
import { StatsService } from '../stats/stats.service.js'; 

/**
 * Configuración de Cache: 72 horas (259200 segundos)
 * checkperiod: Borra datos expirados cada hora para liberar memoria RAM.
 */
const cache = new NodeCache({ 
    stdTTL: 259200, 
    checkperiod: 3600 
});

const RAPID_KEY = process.env.RAPIDAPI_KEY;

/**
 * Listado de configuraciones para motores de RapidAPI.
 */
const API_CONFIGS = [
    {
        name: 'STABLE',
        host: process.env.SCRAPER_STABLE_HOST,
        endpoint: '/get_media_data_v2.php?media_code=',
        method: 'GET'
    }
];

/**
 * @function mapInstagramData
 * @description Transforma el JSON crudo del motor STABLE al formato estándar.
 */
const mapInstagramData = (data: any) => {
    if (!data) return null;
    
    const sidecar = data.edge_sidecar_to_children?.edges;
    
    const mediaList = sidecar 
        ? sidecar.map((edge: any) => ({
            url: edge.node.is_video ? edge.node.video_url : edge.node.display_url,
            type: edge.node.is_video ? 'video' : 'photo',
            thumbnail: edge.node.display_url
        }))
        : [{
            url: data.is_video ? data.video_url : data.display_url,
            type: data.is_video ? 'video' : 'photo',
            thumbnail: data.display_url
        }];

    return {
        id: data.id,
        shortcode: data.shortcode,
        description: data.edge_media_to_caption?.edges[0]?.node?.text || "",
        media: mediaList,
        author: data.owner?.username || "Instagram_User"
    };
};

/**
 * @function getInstagramFromRapid
 * @description Obtiene datos de Instagram. Implementa registro de Stats solo en gasto real.
 */
export const getInstagramFromRapid = async (url: string) => {
    const cleanUrl = url.replace(/\/$/, "").split('?')[0];
    const mediaCode = cleanUrl.split('/').filter(Boolean).pop();
    
    // 1. Verificación en Cache (No genera gasto, no cuenta en Stats)
    const cachedData = cache.get(cleanUrl);
    if (cachedData) {
        console.log(`📦 [Cache]: Retornando datos guardados para ${mediaCode}`);
        return cachedData;
    }

    for (const api of API_CONFIGS) {
        try {
            console.log(`📡 [RapidAPI]: Consultando motor ${api.name}...`);
            
            const options = {
                method: api.method,
                url: `https://${api.host}${api.endpoint}${mediaCode}`,
                headers: {
                    'x-rapidapi-key': RAPID_KEY,
                    'x-rapidapi-host': api.host,
                    'Content-Type': 'application/json'
                },
                timeout: 10000 
            };

            const response = await axios(options);

            if (response.data) {
                const cleanedData = mapInstagramData(response.data);
                
                // --- REGISTRO DE ACTIVIDAD REAL ---
                // Solo llegamos aquí si la API respondió (hubo gasto de crédito)
                await StatsService.registerActivity(api.name, true);
                
                console.log(`✅ [RapidAPI]: ${api.name} procesado con éxito.`);
                console.log(`📦 [Resultado]: Se extrajeron ${cleanedData?.media.length} archivos.`);
                
                cache.set(cleanUrl, cleanedData);
                return cleanedData;
            }
        } catch (error: any) {
            // Registramos el fallo para saber que este motor está teniendo problemas
            await StatsService.registerActivity(api.name, false);
            console.warn(`⚠️ [RapidAPI]: Motor ${api.name} falló (Status: ${error.response?.status || 'Timeout'})`);
        }
    }

    return null;
};