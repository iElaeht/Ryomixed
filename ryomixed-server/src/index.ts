import 'dotenv/config';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import compression from 'compression';
import apiRoutes from './routes/index.js'; 

const app = express();
const PORT = Number(process.env.PORT) || 4000;
const IS_DEV = process.env.NODE_ENV === 'development';

/**
 * OPTIMIZACIÓN DE COMPRESIÓN:
 * No comprimimos archivos de video o audio (mp4/mp3) porque ya están 
 * comprimidos nativamente. Comprimirlos de nuevo solo gastaría CPU inútilmente.
 */
app.use(compression({
    filter: (req, res) => {
        // Si la respuesta es un video o audio, saltamos la compresión
        const contentType = res.getHeader('Content-Type') as string;
        if (contentType && (contentType.includes('video') || contentType.includes('audio'))) {
            return false;
        }
        return compression.filter(req, res);
    }
}));

/**
 * CONFIGURACIÓN DE CORS:
 * Hemos añadido 'Content-Disposition' a los headers expuestos para que el 
 * navegador del usuario pueda leer el nombre del archivo descargado.
 */
app.use(cors({
    origin: [
        'http://localhost:5173', 
        'https://ryomixed.vercel.app',
        'https://ryomixed-client.vercel.app',
        /\.vercel\.app$/ 
    ], 
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Disposition', 'Content-Length', 'X-Content-Duration'],
    credentials: true
}));

// Limitamos el JSON a 1mb para evitar ataques de denegación de servicio (DoS)
app.use(express.json({ limit: '1mb' })); 
app.use(express.urlencoded({ extended: true }));

/**
 * RUTAS PRINCIPALES
 */

// Health Check: Útil para que Render sepa que el servidor está vivo
app.get('/api/health', (_req: Request, res: Response) => {
    res.status(200).json({ 
        status: 'online', 
        project: 'RyoMixed',
        environment: process.env.NODE_ENV || 'production',
        uptime: process.uptime().toFixed(2) + 's',
        timestamp: new Date().toISOString()
    });
});

// Conexión con el archivo central de rutas (donde está youtube.routes.ts)
app.use('/api', apiRoutes);

app.get('/', (_req: Request, res: Response) => {
    res.send('🚀 Servidor de RyoMixed activo y listo.');
});

/**
 * MANEJO GLOBAL DE ERRORES
 */

// Manejador para rutas no existentes
app.use((_req: Request, res: Response) => {
    res.status(404).json({ success: false, message: "Ruta no encontrada" });
});

// Manejador de errores del sistema: Evita que el servidor se caiga ante un error inesperado
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || 500;
    
    // Solo logueamos errores graves en producción
    console.error(`🔥 [Error ${status}]:`, err.message);
    
    // Si ya enviamos cabeceras (por ejemplo, en mitad de una descarga), no podemos enviar JSON
    if (res.headersSent) {
        return _next(err);
    }

    res.status(status).json({ 
        success: false,
        message: "Error interno en el servidor RyoMixed",
        error: IS_DEV ? err.message : undefined
    });
});

/**
 * INICIO Y CIERRE SEGURO DEL SERVIDOR
 */

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`
    🚀 RyoMixed Backend Corriendo
    -----------------------------
    Port: ${PORT}
    Mode: ${process.env.NODE_ENV || 'production'}
    URL: http://localhost:${PORT}
    -----------------------------
    `);
});

// Graceful Shutdown: Cerramos el servidor limpiamente para no dejar descargas colgadas
process.on('SIGTERM', () => {
    console.log('SIGTERM recibido. Cerrando servidor...');
    server.close(() => {
        console.log('Servidor cerrado correctamente.');
        process.exit(0);
    });
});