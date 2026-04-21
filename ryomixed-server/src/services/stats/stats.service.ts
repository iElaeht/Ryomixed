import fs from 'fs';
import path from 'path';

/**
 * Interfaz para definir la estructura de las estadísticas.
 * Incluye contadores históricos y mensuales para control de cuotas API.
 */
interface GlobalStats {
    total_lifetime_requests: number; // Historial total desde el primer día
    monthly_requests: number;        // Contador que se reinicia cada mes
    failed_extractions: number;      // Total de errores acumulados
    engine_usage: { [key: string]: number }; // Uso por motor en el mes actual
    current_month: number;           // Mes registrado actualmente (0-11)
    last_reset_date: string;         // Fecha de la última vez que se reinició el mes
}

/**
 * Ruta de persistencia. El archivo JSON actuará como nuestra "Base de Datos" local.
 */
const STATS_FILE = path.join(process.cwd(), 'data', 'global_stats.json');

/**
 * @class StatsService
 * @description Gestiona el monitoreo de rendimiento y control de cuotas mensuales de las APIs.
 */
export class StatsService {

    /**
     * @method registerActivity
     * @description Registra cada intento de descarga, gestionando el reinicio de cuotas si cambia el mes.
     * @param engine Nombre del motor que se utilizó (ej: 'STABLE', 'DOWNLOADER').
     * @param success Indica si la extracción final fue exitosa.
     */
    static async registerActivity(engine: string, success: boolean) {
        try {
            const stats = this.loadStats();
            const now = new Date();
            const monthNow = now.getMonth();

            // 1. VERIFICACIÓN DE CAMBIO DE MES
            // Si el mes actual es distinto al guardado, reseteamos contadores mensuales
            if (stats.current_month !== monthNow) {
                console.log(`📅 [Stats]: Detectado cambio de mes. Reiniciando contadores de cuotas...`);
                stats.monthly_requests = 0;
                stats.engine_usage = {}; // Limpiamos el uso de motores para el nuevo mes
                stats.current_month = monthNow;
                stats.last_reset_date = now.toISOString();
            }

            // 2. ACTUALIZACIÓN DE DATOS
            stats.total_lifetime_requests++; 
            
            if (success) {
                stats.monthly_requests++;
                // Incrementamos el uso específico de este motor en el mes actual
                stats.engine_usage[engine] = (stats.engine_usage[engine] || 0) + 1;
            } else {
                stats.failed_extractions++;
            }

            // 3. PERSISTENCIA
            this.saveStats(stats);

            // 4. LOG DETALLADO PARA MONITOREO
            console.log(`📊 [Stats]: --- Registro de Actividad ---`);
            console.log(`📊 [Stats]: Motor: ${engine} | Resultado: ${success ? '✅' : '❌'}`);
            console.log(`📊 [Stats]: Uso Mensual de ${engine}: ${stats.engine_usage[engine] || 0}`);
            console.log(`📊 [Stats]: Total Mensual Global: ${stats.monthly_requests}`);
            console.log(`📊 [Stats]: Récord Histórico Total: ${stats.total_lifetime_requests}`);
            console.log(`📊 [Stats]: -------------------------------`);

        } catch (error) {
            console.error(`⚠️ [Stats Error]: Fallo al registrar actividad:`, error);
        }
    }

    /**
     * @method loadStats
     * @private Carga los datos del disco o inicializa la estructura si no existe el archivo.
     */
    private static loadStats(): GlobalStats {
        if (!fs.existsSync(STATS_FILE)) {
            const initialStats: GlobalStats = {
                total_lifetime_requests: 0,
                monthly_requests: 0,
                failed_extractions: 0,
                engine_usage: {},
                current_month: new Date().getMonth(),
                last_reset_date: new Date().toISOString()
            };
            
            const dir = path.dirname(STATS_FILE);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            
            return initialStats;
        }

        const rawData = fs.readFileSync(STATS_FILE, 'utf-8');
        return JSON.parse(rawData);
    }

    /**
     * @method saveStats
     * @private Guarda el estado actual en el archivo físico.
     */
    private static saveStats(stats: GlobalStats) {
        fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2), 'utf-8');
    }
}