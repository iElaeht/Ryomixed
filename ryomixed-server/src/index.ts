import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express'; 
import cors from 'cors';
import downloadRoutes from './routes/download.routes.js';

const app = express();
const PORT = process.env.PORT || 4000;

// --- CONFIGURACIÓN DE MIDDLEWARES ---

// Configuramos CORS de forma explícita para evitar el estado "Pending" en el navegador
app.use(cors({
    origin: '*', // En desarrollo puedes dejarlo así, o poner 'http://localhost:5173'
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

// Aumentamos el límite del body por si acaso envías URLs muy largas o metadatos pesados
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// --- RUTAS ---

// Unimos las rutas de descarga
app.use('/api/download', downloadRoutes);

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

// Aumentamos el timeout del servidor. 
// Las descargas de videos largos pueden tardar más del tiempo por defecto (120s).
server.timeout = 300000; // 5 minutos