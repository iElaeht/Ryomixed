import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express'; 
import cors from 'cors';
// Importamos el router central que unifica YouTube y TikTok
import apiRoutes from './routes/index.js'; 

const app = express();
const PORT = process.env.PORT || 4000;

// --- CONFIGURACIÓN DE MIDDLEWARES ---

app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// --- RUTAS MODULARES ---

/** * Ahora usamos /api como base. 
 * Tus endpoints serán:
 * - POST /api/youtube/info
 * - POST /api/tiktok/info
 */
app.use('/api', apiRoutes);

// Ruta de salud del sistema
app.get('/api/health', (req: Request, res: Response) => {
    res.json({ 
        status: 'online', 
        message: 'Servidor RyoMixed listo para descargar',
        timestamp: new Date().toISOString()
    });
});

// Manejo de rutas no encontradas (404)
app.use((req: Request, res: Response) => {
    res.status(404).json({ message: "Ruta no encontrada en RyoMixed" });
});

// --- INICIO DEL SERVIDOR ---

const server = app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

// Timeout de 5 minutos para descargas pesadas
server.timeout = 300000;