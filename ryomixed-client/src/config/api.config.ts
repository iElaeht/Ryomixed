const isLocal = window.location.hostname === 'localhost';

export const API_CONFIG = {
  BASE_URL: isLocal 
    ? 'http://localhost:4000' 
    : 'https://ryomixed-production.up.railway.app',
  
  // Helpers para obtener las rutas limpias
  endpoints: {
    tiktok: (path: string) => `${isLocal ? 'http://localhost:4000' : 'https://ryomixed-production.up.railway.app'}/api/tiktok${path}`,
    instagram: (path: string) => `${isLocal ? 'http://localhost:4000' : 'https://ryomixed-production.up.railway.app'}/api/instagram${path}`,
    youtube: (path: string) => `${isLocal ? 'http://localhost:4000' : 'https://ryomixed-production.up.railway.app'}/api/youtube${path}`,
  }
};