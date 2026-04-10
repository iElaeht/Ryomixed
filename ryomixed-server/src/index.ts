import 'dotenv/config';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import apiRoutes from './routes/index.js'; 

const app = express();
// Render asigna un puerto automático, normalmente el 10000
const PORT = Number(process.env.PORT) || 4000;

// --- CONFIGURACIÓN DE MIDDLEWARES ---

app.use(cors({
    origin: [
        'http://localhost:5173', 
        'https://ryomixed.vercel.app',
        'https://ryomixed-client.vercel.app',
        /\.vercel\.app$/ // Esto permite cualquier subdominio de Vercel (muy útil)
    ], 
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Disposition'],
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// --- RUTAS ---

app.get('/', (_req: Request, res: Response) => {
    res.send('🚀 Servidor de RyoMixed activo y listo.');
});

app.use('/api', apiRoutes);

app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ 
        status: 'online', 
        project: 'RyoMixed',
        timestamp: new Date().toISOString()
    });
});

// --- MANEJO DE ERRORES ---

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error("🔥 Error crítico:", err.stack);
    res.status(500).json({ 
        message: "Error interno en el servidor RyoMixed",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

app.use((_req: Request, res: Response) => {
    res.status(404).json({ message: "Ruta no encontrada en RyoMixed" });
});

// --- INICIO ---
// IMPORTANTE: '0.0.0.0' permite que Render redirija el tráfico correctamente
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 RyoMixed corriendo en el puerto ${PORT}`);
    console.log(`🌍 Acceso externo habilitado`);
});