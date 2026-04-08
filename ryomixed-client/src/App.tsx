import { useState } from 'react'
import './App.css'

// Definimos la interfaz para que TypeScript sepa qué esperar del servidor
interface VideoInfo {
  title: string;
  author: string;
  thumbnail: string;
}

function App() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [videoData, setVideoData] = useState<VideoInfo | null>(null)
  const [message, setMessage] = useState('')

  const handleProcessLink = async () => {
    if (!url) return 
    
    setLoading(true)
    setVideoData(null)
    setMessage('')

    try {
      const response = await fetch('http://localhost:4000/api/download/info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setVideoData(data.video)
      } else {
        setMessage(data.message || "No se pudo encontrar el video")
      }
    } catch (error) {
      console.error("Error de conexión:", error)
      setMessage("El servidor no responde")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-wrapper">
      {/* HEADER: Separado del contenido principal */}
      <nav className="navbar">
        <div className="nav-container">
          <h2 className="nav-logo">Ryo<span>Mixed</span></h2>
          <div className="status-badge">v1.0 Online</div>
        </div>
      </nav>

      <div className="container">
        {/* SECCIÓN HERO: Con distancia del centro */}
        <header className="hero-section">
          <h1 className="main-title">Descargas <span>Sencillas.</span></h1>
          <p className="subtitle">YouTube & TikTok en un solo lugar.</p>
        </header>

        {/* ÁREA CENTRAL */}
        <main className="content-area">
          <div className="input-group">
            <input 
              type="text" 
              placeholder="Pega el link aquí..." 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="url-input"
            />
            <button 
              onClick={handleProcessLink} 
              disabled={loading}
              className="btn-process"
            >
              {loading ? '...' : 'Obtener'}
            </button>
          </div>

          {/* Mensajes de error sutiles */}
          {message && <div className="error-badge">{message}</div>}

          {/* Tarjeta de resultado minimalista */}
          {videoData && (
            <div className="video-result-card">
              <div className="thumbnail-wrapper">
                <img src={videoData.thumbnail} alt="Preview" />
              </div>
              <div className="video-info">
                <h3>{videoData.title}</h3>
                <p className="author">{videoData.author}</p>
                <div className="action-buttons">
                  <button className="btn-dl mp4">Video MP4</button>
                  <button className="btn-dl mp3">Audio MP3</button>
                </div>
              </div>
            </div>
          )}
        </main>

        <footer className="footer">
          <p>RyoMixed Project • 2026</p>
        </footer>
      </div>
    </div>
  )
}

export default App