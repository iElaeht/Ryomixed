import 'dotenv/config';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import compression from 'compression';
import axios from 'axios'; 
import apiRoutes from './routes/index.js'; 
// Importamos la función de limpieza desde tu controlador de YouTube
import { cleanTempFiles } from './controllers/youtube.controller.js'; 

const app = express();
const PORT = Number(process.env.PORT) || 4000;
const IS_DEV = process.env.NODE_ENV === 'development';

/**
 * CONFIGURACIÓN DE MIDDLEWARES
 */

// Compresión: Mejora la velocidad de respuesta, excluyendo archivos grandes (videos)
app.use(compression({
    filter: (req, res) => {
        const contentType = res.getHeader('Content-Type') as string;
        // No comprimimos descargas ni contenido multimedia para no saturar la CPU
        if (
            req.originalUrl.includes('/download') || 
            (contentType && (contentType.includes('video') || contentType.includes('audio')))
        ) {
            return false;
        }
        return compression.filter(req, res);
    }
}));

// CORS Dinámico: Seguridad para permitir solo tus dominios conocidos
app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = [
            'http://localhost:5173', 
            'http://localhost:3000',
            'https://ryomixed.vercel.app',
            'https://ryomixed-client.vercel.app'
        ];
        // Permitimos peticiones sin origen (como Postman) o de dominios autorizados
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS (RyoMixed Security)'));
        }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true
}));

app.use(express.json({ limit: '1mb' })); 
app.use(express.urlencoded({ extended: true }));

/**
 * SERVICIOS ESPECIALES
 */

/**
 * PROXY DE IMÁGENES: Bypass para bloqueos de Instagram (403 Forbidden)
 * Centralizado aquí para que todas las plataformas lo usen.
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
                // User-Agent real para simular navegación humana
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
                'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
                'Referer': 'https://www.instagram.com/'
            },
            timeout: 10000 
        });

        const contentType = response.headers['content-type'] || 'image/jpeg';
        res.set('Content-Type', contentType);
        res.set('Cache-Control', 'public, max-age=86400'); // Cache persistente por 24h
        
        return res.send(Buffer.from(response.data));
    } catch (error: any) {
        console.error(`❌ [Proxy Error]: ${error.message}`);
        return res.status(404).send('Error al cargar miniatura');
    }
});

/**
 * RUTAS Y MONITOREO
 */

// Health Check: Útil para que Railway sepa que el servicio está vivo
app.get('/api/health', (_req, res) => {
    res.status(200).json({ 
        status: 'online', 
        project: 'RyoMixed',
        environment: process.env.NODE_ENV 
    });
});

// Rutas principales del sistema
app.use('/api', apiRoutes);

app.get('/', (_req, res) => res.send('🚀 RyoMixed API Running'));

/**
 * MANEJO DE ERRORES GLOBAL
 */

// Error 404: Ruta no encontrada
app.use((_req, res) => {
    res.status(404).json({ success: false, message: "Ruta no encontrada en RyoMixed" });
});

// Manejador de errores interno (500)
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || 500;
    console.error(`🔥 [Server Error ${status}]:`, err.message);
    
    if (res.headersSent) return _next(err);
    
    res.status(status).json({ 
        success: false, 
        message: "Error interno del servidor",
        error: IS_DEV ? err.message : undefined 
    });
});

/**
 * INICIO DEL SERVIDOR
 */
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`--- RyoMixed Backend ---`);
    console.log(`🚀 Puerto: ${PORT}`);
    console.log(`🌍 Modo: ${process.env.NODE_ENV || 'production'}`);
    
    // 🧹 Tarea de mantenimiento: Limpieza de archivos temporales al arrancar
    try {
        cleanTempFiles();
        // Programamos la limpieza para que se ejecute cada 30 minutos automáticamente
        setInterval(cleanTempFiles, 30 * 60 * 1000);
        console.log(`🧹 Sistema de limpieza automática ryo_tmp: Activo`);
    } catch (e) {
        console.error("⚠️ No se pudo iniciar el limpiador de archivos:", e);
    }
    
    console.log(`-------------------------`);
});

// Aumentamos el timeout a 10 minutos para descargas de videos pesados
server.timeout = 600000;