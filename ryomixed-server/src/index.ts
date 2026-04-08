import express from 'express';
import type { Request, Response } from 'express'; 
import cors from 'cors';
import downloadRoutes from './routes/download.routes.js'; // Importamos la ruta

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// Unimos las rutas
app.use('/api/download', downloadRoutes);

app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'online', message: 'Servidor RyoMixed listo' });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});