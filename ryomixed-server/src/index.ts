import 'dotenv/config';
import express from 'express';
import type { Request, Response, NextFunction } from 'express'; // Añadimos NextFunction
import cors from 'cors';
import apiRoutes from './routes/index.js'; 

const app = express();
const PORT = process.env.PORT || 4000;

// --- CONFIGURACIÓN DE MIDDLEWARES ---

app.use(cors({
    // Permitimos localhost para tus pruebas y tu URL de Vercel para producción
    origin: [
        'http://localhost:5173', 
        'https://ryomixed.vercel.app',
        'https://ryomixed-client.vercel.app' // Por si Vercel le puso este nombre
    ], 
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Disposition'],
    credentials: true // Recomendado para evitar bloqueos de navegador
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// --- RUTAS ---

// Agregamos una respuesta simple en la raíz para saber que el server vive
app.get('/', (_req: Request, res: Response) => {
    res.send('🚀 Servidor de RyoMixed activo y listo.');
});

// Rutas modulares
app.use('/api', apiRoutes);

// Ruta de salud
app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ 
        status: 'online', 
        project: 'RyoMixed',
        timestamp: new Date().toISOString()
    });
});

// --- MANEJO DE ERRORES ---

// Cambiamos 'any' por 'Error' para que TypeScript esté feliz en Render
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error("🔥 Error crítico:", err.stack);
    res.status(500).json({ 
        message: "Error interno en el servidor RyoMixed",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Manejo de 404
app.use((_req: Request, res: Response) => {
    res.status(404).json({ message: "Ruta no encontrada en RyoMixed" });
});

// --- INICIO ---
const server = app.listen(PORT, () => {
    console.log(`🚀 RyoMixed corriendo en el puerto ${PORT}`);
});

server.timeout = 300000;
server.keepAliveTimeout = 60000;