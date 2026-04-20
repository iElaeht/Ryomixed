import axios from 'axios';
import NodeCache from 'node-cache';
import 'dotenv/config';

const cache = new NodeCache({ stdTTL: 86400 });
const RAPID_KEY = process.env.RAPIDAPI_KEY;

const API_CONFIGS = [
    {
        name: 'STABLE',
        host: process.env.SCRAPER_STABLE_HOST,
        endpoint: '/get_media_data_v2.php?media_code=',
        method: 'GET'
    }
];

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
        author: data.owner?.username
    };
};

export const getInstagramFromRapid = async (url: string) => {
    const cleanUrl = url.replace(/\/$/, "").split('?')[0];
    const mediaCode = cleanUrl.split('/').filter(Boolean).pop();
    
    const cachedData = cache.get(cleanUrl);
    if (cachedData) return cachedData;

    for (const api of API_CONFIGS) {
        try {
            console.log(`📡 [RapidAPI]: Intentando con ${api.name}...`);
            
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
                console.log(`✅ [RapidAPI]: ${api.name} respondió con éxito.`);
                cache.set(cleanUrl, cleanedData);
                return cleanedData;
            }
        } catch (error: any) {
            console.warn(`⚠️ [RapidAPI]: ${api.name} falló. Código: ${error.response?.status || 'N/A'}`);
        }
    }
    return null;
};