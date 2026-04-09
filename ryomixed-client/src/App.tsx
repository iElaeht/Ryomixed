import { useState, useEffect } from 'react'
import './App.css'

interface Format {
  id: string;
  label: string;
  ext: string;
}

interface VideoInfo {
  title: string;
  sanitizedTitle: string;
  author: string;
  thumbnail: string;
  formats: Format[];
  isTikTok: boolean;
}

function App() {
  const [url, setUrl] = useState('')
  const [processedUrl, setProcessedUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [videoData, setVideoData] = useState<VideoInfo | null>(null)
  
  // Lógica de pasos para la tarjeta
  const [downloadStep, setDownloadStep] = useState<1 | 2 | 3>(1)
  const [selectedType, setSelectedType] = useState<'mp4' | 'mp3' | null>(null)
  const [selectedQuality, setSelectedQuality] = useState<string>('')
  
  const [message, setMessage] = useState('')
  const [showAbout, setShowAbout] = useState(false)
  const [downloading, setDownloading] = useState(false)

  // Bloqueo de inspección (Seguridad)
  useEffect(() => {
    const disableDevTools = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof MouseEvent && e.button === 2) e.preventDefault();
      if (e instanceof KeyboardEvent) {
        if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) || (e.ctrlKey && e.key === 'u')) {
          e.preventDefault();
        }
      }
    };
    document.addEventListener('contextmenu', (e) => e.preventDefault());
    document.addEventListener('keydown', disableDevTools);
    return () => {
      document.removeEventListener('contextmenu', (e) => e.preventDefault());
      document.removeEventListener('keydown', disableDevTools);
    };
  }, []);

  const handleProcessLink = async () => {
    const rawUrl = url.trim();
    if (!rawUrl) {
      setMessage("Pega una URL válida");
      return;
    }
    setLoading(true);
    setVideoData(null);
    setDownloadStep(1); // Reset al primer paso
    setSelectedType(null);
    setMessage('');
    
    try {
      const response = await fetch('http://localhost:4000/api/download/info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: rawUrl })
      });
      const data = await response.json();
      if (response.ok && data.video) {
        setVideoData(data.video);
        setProcessedUrl(rawUrl);
        if (data.video.formats.length > 0) {
          setSelectedQuality(data.video.formats[0].id);
        }
      } else {
        setMessage(data.message || "No se pudo procesar este video.");
      }
    } catch {
      setMessage("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const startDownload = () => {
    if (!videoData || !selectedType) return;
    setDownloading(true);
    
    const qualityParam = selectedType === 'mp4' ? `&quality=${selectedQuality}` : '';
    const titleParam = `&title=${encodeURIComponent(videoData.sanitizedTitle)}`;
    const downloadUrl = `http://localhost:4000/api/download?url=${encodeURIComponent(processedUrl)}&format=${selectedType}${qualityParam}${titleParam}`;
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', ''); 
    document.body.appendChild(link);
    link.click();
    
    setTimeout(() => {
      document.body.removeChild(link);
      setDownloading(false);
      setDownloadStep(1); // Reiniciar flujo tras descargar
    }, 2000);
  };

  return (
    <div className="app-wrapper">
      <nav className="navbar">
        <div className="nav-container">
          <h2 className="nav-logo">Ryo<span>Mixed</span></h2>
          <button className="btn-about" onClick={() => setShowAbout(true)}>¿Quiénes Somos?</button>
        </div>
      </nav>

      <div className="container">
        <header className="hero-section">
          <h1 className="main-title">Descargas <span>Sencillas.</span></h1>
          <p className="subtitle">YouTube & TikTok sin complicaciones.</p>
        </header>

        <main className="content-area">
          <div className="input-group">
            <div className="input-wrapper">
              <input 
                type="text" 
                placeholder="Pega el link aquí..." 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleProcessLink()}
                className="url-input"
              />
            </div>
            <button onClick={handleProcessLink} disabled={loading} className="btn-process">
              {loading ? '...' : 'Obtener'}
            </button>
          </div>

          {message && <div className="error-badge">{message}</div>}

          {videoData && (
            <div className="video-result-card animate-fade-in">
              <div className="thumbnail-wrapper">
                <img src={videoData.thumbnail} alt="Preview" />
              </div>
              <div className="video-info">
                <h3>{videoData.title}</h3>
                <p className="author">{videoData.author}</p>
                
                <div className="stepper-content">
                  {/* PASO 1: Selección de Tipo */}
                  {downloadStep === 1 && (
                    <div className="step-box animate-slide-up">
                      <label className="step-label">Paso 1: Elige el formato</label>
                      <div className="action-buttons">
                        <button className="btn-dl mp4" onClick={() => { setSelectedType('mp4'); setDownloadStep(2); }}>Video (MP4)</button>
                        <button className="btn-dl mp3" onClick={() => { setSelectedType('mp3'); setDownloadStep(2); }}>Audio (MP3)</button>
                      </div>
                    </div>
                  )}

                  {/* PASO 2: Selección de Calidad */}
                  {downloadStep === 2 && (
                    <div className="step-box animate-slide-up">
                      <label className="step-label">
                        Paso 2: Calidad de {selectedType === 'mp4' ? 'Video' : 'Audio'}
                      </label>
                      <select 
                        value={selectedQuality} 
                        onChange={(e) => setSelectedQuality(e.target.value)}
                        className="select-style"
                      >
                        {selectedType === 'mp4' ? (
                          videoData.formats.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)
                        ) : (
                          <>
                            <option value="320">Alta Calidad (320kbps)</option>
                            <option value="192">Estándar (192kbps)</option>
                            <option value="128">Baja (128kbps)</option>
                          </>
                        )}
                      </select>
                      <button className="btn-next" onClick={() => setDownloadStep(3)}>Continuar →</button>
                      <button className="btn-back" onClick={() => setDownloadStep(1)}>← Volver</button>
                    </div>
                  )}

                  {/* PASO 3: Confirmar Descarga */}
                  {downloadStep === 3 && (
                    <div className="step-box animate-slide-up">
                      <label className="step-label">Paso 3: ¡Todo listo!</label>
                      <button 
                        className={`btn-final-download ${downloading ? 'loading' : ''}`}
                        onClick={startDownload}
                        disabled={downloading}
                      >
                        {downloading ? 'Iniciando...' : `Descargar ${selectedType?.toUpperCase()}`}
                      </button>
                      {!downloading && <button className="btn-back" onClick={() => setDownloadStep(2)}>← Cambiar calidad</button>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <footer className="footer">
        <div className="footer-content">
          <p>© 2026 <strong>RyoMixed</strong> - Media Downloader</p>
          <span className="footer-tag">Seguro • Rápido • Sin Anuncios</span>
        </div>
      </footer>

      {showAbout && (
        <div className="modal-overlay" onClick={() => setShowAbout(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowAbout(false)}>×</button>
            <div className="modal-header"><h2 className="nav-logo">Ryo<span>Mixed</span></h2></div>
            <div className="modal-body">
              <p className="highlight-text">"RyoMixed no es solo un convertidor, es la herramienta definitiva..."</p>
              <div className="divider"></div>
              <p className="description">Nuestro sistema es personal, seguro y funciona sin necesidad de recolectar datos innecesarios...</p>
            </div>
            <button className="btn-process modal-btn-fix" onClick={() => setShowAbout(false)}>Entendido</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App