// Detectamos si estamos en desarrollo (localhost o IP privada de red)
const isDevelopment = 
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1' || 
  window.location.hostname.startsWith('192.168.') || 
  window.location.hostname.startsWith('10.') ||
  window.location.hostname.endsWith('.local');

const PROD_URL = import.meta.env.VITE_API_URL || 'https://ryomixed-production.up.railway.app';

// DINÁMICO: Si estás en el celular, usará la IP de tu PC automáticamente
const LOCAL_URL = `http://${window.location.hostname}:4000`;

const FINAL_URL = isDevelopment ? LOCAL_URL : PROD_URL;

export const API_CONFIG = {
  BASE_URL: FINAL_URL,
  
  endpoints: {
    tiktok: (path: string) => `${FINAL_URL}/api/tiktok${path}`,
    instagram: (path: string) => `${FINAL_URL}/api/instagram${path}`,
    youtube: (path: string) => `${FINAL_URL}/api/youtube${path}`,
  }
};