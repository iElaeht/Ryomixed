const isLocal = window.location.hostname === 'localhost';

// Vite requiere que las variables empiecen con VITE_ para que sean visibles en el navegador
const PROD_URL = import.meta.env.VITE_API_URL || 'https://ryomixed-production.up.railway.app';
const LOCAL_URL = 'http://localhost:4000';

const FINAL_URL = isLocal ? LOCAL_URL : PROD_URL;

export const API_CONFIG = {
  BASE_URL: FINAL_URL,
  
  endpoints: {
    tiktok: (path: string) => `${FINAL_URL}/api/tiktok${path}`,
    instagram: (path: string) => `${FINAL_URL}/api/instagram${path}`,
    youtube: (path: string) => `${FINAL_URL}/api/youtube${path}`,
  }
};