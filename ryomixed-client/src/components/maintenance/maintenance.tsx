import React, { useEffect } from 'react';

const Maintenance: React.FC = () => {
  useEffect(() => {
    // Bloqueo de scroll ineludible
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  return (
    <div style={styles.overlay}>
      {/* Fondo con movimiento sutil */}
      <div style={styles.background} />
      
      <div style={styles.card}>
        <div style={styles.content}>
          {/* Un indicador de estado minimalista */}
          <div style={styles.statusContainer}>
            <div style={styles.pulseDot} />
            <span style={styles.statusText}>OFFLINE MODE</span>
          </div>

          <h1 style={styles.title}>Mantenimiento de Sistema</h1>
          
          <div style={styles.divider} />
          
          <p style={styles.description}>
            RyoMixed está recibiendo una actualización crítica en sus sistema de servidores. 
            El acceso a la plataforma se encuentra temporalmente pausado. Por favor, Se estara avisando en @elaehtdv para más información sobre el progreso de la actualización. Agradecemos su paciencia y comprensión mientras trabajamos para mejorar su experiencia.
          </p>

          <div style={styles.footer}>
            <span style={styles.footerInfo}>RYOMIXED ENGINE v2.0</span>
            <span style={styles.footerCode}>ERR_SRV_MTN</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes gradientBG {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#050505',
    zIndex: 9999999,
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    padding: '24px',
    userSelect: 'none',
  },
  background: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(-45deg, #050505, #0a0f1a, #050505, #080c14)',
    backgroundSize: '400% 400%',
    animation: 'gradientBG 12s ease infinite',
    zIndex: -1,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '28px',
    padding: '48px 40px',
    width: '100%',
    maxWidth: '440px',
    boxShadow: '0 40px 100px -20px rgba(0, 0, 0, 0.8)',
  },
  content: {
    textAlign: 'center',
  },
  statusContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '24px',
  },
  pulseDot: {
    width: '8px',
    height: '8px',
    backgroundColor: '#ef4444', // Rojo sistema
    borderRadius: '50%',
    boxShadow: '0 0 10px #ef4444',
    animation: 'pulse 2s infinite ease-in-out',
  },
  statusText: {
    fontSize: '11px',
    fontWeight: 800,
    color: '#ef4444',
    letterSpacing: '0.15em',
  },
  title: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#ffffff',
    margin: '0 0 20px 0',
    letterSpacing: '-0.02em',
  },
  divider: {
    height: '1px',
    width: '40px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    margin: '0 auto 24px auto',
  },
  description: {
    fontSize: '15px',
    color: '#888888',
    lineHeight: '1.7',
    margin: '0 0 40px 0',
    fontWeight: 400,
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '24px',
    borderTop: '1px solid rgba(255, 255, 255, 0.03)',
  },
  footerInfo: {
    fontSize: '10px',
    fontWeight: 600,
    color: '#444',
    letterSpacing: '0.05em',
  },
  footerCode: {
    fontSize: '10px',
    fontFamily: 'monospace',
    color: '#333',
  }
};

export default Maintenance;