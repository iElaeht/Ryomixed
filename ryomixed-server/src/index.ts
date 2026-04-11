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
 * Filtro inteligente para no procesar archivos multimedia ya comprimidos (MP4/MP3).
 */
app.use(compression({
    filter: (req, res) => {
        const contentType = res.getHeader('Content-Type') as string;
        if (contentType && (contentType.includes('video') || contentType.includes('audio'))) {
            return false;
        }
        return compression.filter(req, res);
    }
}));

/**
 * CONFIGURACIÓN DE CORS:
 * Incluye tus dominios de Vercel y permite que el cliente lea 'Content-Disposition' 
 * para descargar los archivos con sus nombres limpios (sanitize).
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

// Seguridad básica: Límite de carga para evitar saturación de memoria (32GB RAM protegidos)
app.use(express.json({ limit: '1mb' })); 
app.use(express.urlencoded({ extended: true }));

/**
 * RUTAS PRINCIPALES
 */

// Health Check: Vital para el monitoreo en Render
app.get('/api/health', (_req: Request, res: Response) => {
    res.status(200).json({ 
        status: 'online', 
        project: 'RyoMixed',
        environment: process.env.NODE_ENV || 'production',
        uptime: process.uptime().toFixed(2) + 's',
        timestamp: new Date().toISOString()
    });
});

/**
 * CONEXIÓN CON EL ENRUTADOR CENTRAL
 * Aquí es donde se dividen los caminos hacia /youtube y /tiktok
 */
app.use('/api', apiRoutes);

app.get('/', (_req: Request, res: Response) => {
    res.send('🚀 Servidor de RyoMixed activo y listo.');
});

/**
 * MANEJO GLOBAL DE ERRORES
 */

app.use((_req: Request, res: Response) => {
    res.status(404).json({ success: false, message: "Ruta no encontrada en RyoMixed" });
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || 500;
    
    // Logueo de errores para depuración técnica
    console.error(`🔥 [Error ${status}]:`, err.message);
    
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
 * INICIO SEGURO
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

// Graceful Shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM recibido. Cerrando servidor de forma limpia...');
    server.close(() => {
        console.log('Servidor RyoMixed cerrado.');
        process.exit(0);
    });
});