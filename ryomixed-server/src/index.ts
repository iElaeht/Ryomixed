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
 * OPTIMIZACIÓN DE COMPRESIÓN
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
 * CONFIGURACIÓN DE CORS REFORZADA
 * Esto solucionará el error de "Access-Control-Allow-Origin" que viste en consola.
 */
app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = [
            'http://localhost:5173', 
            'http://localhost:3000',
            'https://ryomixed.vercel.app',
            'https://ryomixed-client.vercel.app'
        ];
        
        // Permitir peticiones sin origen (como apps móviles o curl) 
        // y cualquier subdominio de vercel.app
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS (RyoMixed Security)'));
        }
    },
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Content-Disposition', 'Content-Length', 'X-Content-Duration'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
}));

// Seguridad básica
app.use(express.json({ limit: '1mb' })); 
app.use(express.urlencoded({ extended: true }));

/**
 * RUTAS PRINCIPALES
 */

// Health Check: Vital para Railway
app.get('/api/health', (_req: Request, res: Response) => {
    res.status(200).json({ 
        status: 'online', 
        project: 'RyoMixed',
        environment: process.env.NODE_ENV || 'production',
        uptime: process.uptime().toFixed(2) + 's'
    });
});

app.use('/api', apiRoutes);

app.get('/', (_req: Request, res: Response) => {
    res.send('🚀 Servidor de RyoMixed activo y listo en Railway.');
});

/**
 * MANEJO GLOBAL DE ERRORES
 */
app.use((_req: Request, res: Response) => {
    res.status(404).json({ success: false, message: "Ruta no encontrada en RyoMixed" });
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || 500;
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
    🚀 RyoMixed Backend Corriendo (Railway Mode)
    -----------------------------
    Port: ${PORT}
    URL: http://0.0.0.0:${PORT}
    -----------------------------
    `);
});

process.on('SIGTERM', () => {
    server.close(() => {
        console.log('Servidor RyoMixed cerrado.');
        process.exit(0);
    });
});