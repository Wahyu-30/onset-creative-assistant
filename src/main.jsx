import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { ThemeProvider } from './context/ThemeContext'
import './index.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#0a0a0f',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          gap: '16px',
          fontFamily: 'Inter, sans-serif',
          color: '#e0e0e0',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px' }}>⚠️</div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>
            Ada yang tidak beres
          </h2>
          <p style={{ fontSize: '13px', color: '#888', maxWidth: '280px', lineHeight: 1.6 }}>
            Coba tekan <strong>Cmd+Shift+R</strong> (Mac) atau <strong>Ctrl+Shift+R</strong> (Windows) untuk hard refresh.
          </p>
          <button
            onClick={() => { window.localStorage.clear(); window.location.href = '/' }}
            style={{
              marginTop: '8px',
              padding: '10px 20px',
              background: 'rgba(108,99,255,0.15)',
              border: '1px solid rgba(108,99,255,0.4)',
              borderRadius: '999px',
              color: '#a78bfa',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Reset & Kembali ke Home
          </button>
          <p style={{ fontSize: '11px', color: '#555', marginTop: '4px' }}>
            Error: {this.state.error?.message}
          </p>
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
)
