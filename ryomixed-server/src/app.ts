import 'dotenv/config';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import compression from 'compression';
import axios from 'axios'; 
import apiRoutes from './routes/index.js'; 
import { cleanTempFiles } from './controllers/youtube.controller.js'; 

const app = express();
const PORT = Number(process.env.PORT) || 4000;
const IS_DEV = process.env.NODE_ENV === 'development';

/**
 * MIDDLEWARES DE OPTIMIZACIÓN
 * Se configura la compresión Gzip, exceptuando descargas de medios para no saturar el CPU.
 */
app.use(compression({
    filter: (req, res) => {
        const contentType = res.getHeader('Content-Type') as string;
        if (
            req.originalUrl.includes('/download') || 
            (contentType && (contentType.includes('video') || contentType.includes('audio')))
        ) return false;
        return compression.filter(req, res);
    }
}));

/**
 * CONFIGURACIÓN DE CORS
 * Control estricto de dominios permitidos para proteger la API de RyoMixed.
 */
app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = [
            'http://localhost:5173', 
            'http://localhost:3000',
            'https://ryomixed.vercel.app',
            'https://ryomixed-client.vercel.app'
        ];
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
            callback(null, true);
        } else {
            callback(new Error('CORS Blocked by RyoMixed'));
        }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true
}));

app.use(express.json({ limit: '1mb' })); 
app.use(express.urlencoded({ extended: true }));

/**
 * LOGS DE PETICIONES (Filtro Anti-Sopa de Letras v2)
 * Ocultamos queries de descarga y de proxy de imágenes para mantener la terminal legible.
 */
app.use((req, _res, next) => {
    if (req.url !== '/api/health') { 
        
        // Verificamos si la ruta es una de las "ruidosas"
        const isDownloadReq = req.url.includes('/download');
        const isProxyReq = req.url.includes('/api/proxy/image');

        // Si es descarga o proxy, cortamos el log. Si no, mostramos la URL normal.
        const displayUrl = (isDownloadReq || isProxyReq)
            ? `${req.url.split('?')[0]} [Query Hidden]` 
            : req.url;

        console.log(`[${req.method}] ➡️ ${displayUrl}`);
    }
    next();
});

/**
 * PROXY DE IMÁGENES
 * Túnel para bypass de políticas de seguridad (CORS/Referer) en thumbnails de redes sociales.
 */
app.get('/api/proxy/image', async (req: Request, res: Response) => {
    const imageUrl = req.query.url as string;
    if (!imageUrl) return res.status(400).send('URL requerida');

    try {
        const response = await axios({
            url: imageUrl,
            method: 'GET',
            responseType: 'arraybuffer',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://www.instagram.com/'
            },
            timeout: 10000 
        });

        const contentType = String(response.headers['content-type'] || 'image/jpeg');
        res.set('Content-Type', contentType);
        res.set('Cache-Control', 'public, max-age=86400');
        return res.send(Buffer.from(response.data));
    } catch (error: any) {
        return res.status(404).send('Error Proxy');
    }
});

/**
 * RUTAS DEL SISTEMA
 */
app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'online', project: 'RyoMixed' });
});

app.use('/api', apiRoutes);
app.get('/', (_req, res) => res.send('🚀 RyoMixed API Running'));

/**
 * MANEJO DE ERRORES GLOBAL
 * Captura excepciones y evita que el servidor se caiga, devolviendo un JSON limpio.
 */
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || 500;
    console.error(`\n🔥 [Error ${status}]:`, err.message, '\n');
    if (res.headersSent) return _next(err);
    res.status(status).json({ success: false, message: "Internal Server Error" });
});

/**
 * INICIO Y MANTENIMIENTO PROGRAMADO
 * Configuración del ciclo de vida del servidor y tareas de limpieza de archivos.
 */
const server = app.listen(PORT, '0.0.0.0', () => {
    if (IS_DEV) console.clear(); // Limpia consola solo en desarrollo para facilitar lectura
    
    console.log(`
    =========================================
        🚀 RYOMIXED BACKEND IS ONLINE
    =========================================
    📍 Puerto: ${PORT}
    🌍 Modo:   ${process.env.NODE_ENV || 'production'}
    🧹 Limpieza: Cada 6 horas (Smart Clean)
    =========================================
    `);
    
    // Inicialización del motor de limpieza de temporales
    try {
        // Limpieza de seguridad al arrancar
        cleanTempFiles();
        
        // Intervalo de mantenimiento (Cada 6 horas)
        const SIX_HOURS = 6 * 60 * 60 * 1000;
        setInterval(() => {
            console.log(`\n🧹 [Mantenimiento]: Ejecutando limpieza programada...`);
            cleanTempFiles();
        }, SIX_HOURS);

    } catch (e) {
        console.error("⚠️ Error en el módulo de limpieza:", e);
    }
});

// Aumentamos el timeout para descargas pesadas (10 minutos)
server.timeout = 600000;