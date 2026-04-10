import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express'; 
import cors from 'cors';
import apiRoutes from './routes/index.js'; 

const app = express();
const PORT = process.env.PORT || 4000;

// --- CONFIGURACIÓN DE MIDDLEWARES ---

app.use(cors({
    origin: '*', // En producción puedes cambiarlo a tu URL de Vercel
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Disposition'] // IMPORTANTE: Para que el navegador vea el nombre del archivo
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// --- RUTAS MODULARES ---
app.use('/api', apiRoutes);

// Ruta de salud del sistema
app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ 
        status: 'online', 
        project: 'RyoMixed',
        message: 'Servidor listo para descargar',
        timestamp: new Date().toISOString()
    });
});

// Manejo de errores global (Para evitar que el servidor se caiga)
app.use((err: any, _req: Request, res: Response, _next: any) => {
    console.error("🔥 Error crítico:", err.stack);
    res.status(500).json({ message: "Error interno en el servidor RyoMixed" });
});

// Manejo de rutas no encontradas (404)
app.use((_req: Request, res: Response) => {
    res.status(404).json({ message: "Ruta no encontrada en RyoMixed" });
});

// --- INICIO DEL SERVIDOR ---
const server = app.listen(PORT, () => {
    console.log(`🚀 RyoMixed corriendo en http://localhost:${PORT}`);
});

// Timeout aumentado para descargas pesadas de YouTube (5 minutos)
server.timeout = 300000;
server.keepAliveTimeout = 60000; // Evita cierres de conexión prematuros