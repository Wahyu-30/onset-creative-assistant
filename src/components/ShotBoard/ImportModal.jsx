import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { X, FileDown } from 'lucide-react'

export default function ImportModal({ onClose, onImport }) {
  const [pasteData, setPasteData] = useState('')
  const [loading, setLoading] = useState(false)

  const handleImport = async () => {
    if (!pasteData.trim()) return

    setLoading(true)
    try {
      // Parse tab-separated values (TSV) from Google Docs / Excel
      const rows = pasteData.split('\n').filter(row => row.trim() !== '')
      
      const parsedShots = rows.map((row, idx) => {
        const cols = row.split('\t').map(c => c.trim())
        
        // Asumsi format kolom standar yang bisa di-paste:
        // Scene | Jenis Shot | Angle | Dialog | Brief Action | Equipment (Opsional)
        return {
          sceneLabel: cols[0] || `Scene ${idx+1}`,
          shotType: cols[1] || '',
          angle: cols[2] || '',
          dialog: cols[3] || '',
          briefAction: cols[4] || '',
          equipment: cols[5] ? cols[5].split(',').map(e => e.trim()) : []
        }
      })

      await onImport(parsedShots)
      onClose()
    } catch (err) {
      console.error(err)
      alert("Gagal mengimport data. Pastikan format tabel sesuai.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      className="overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="shot-form glass"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        <div className="shot-form__header">
          <h2 className="shot-form__title">Import dari Google Docs</h2>
          <button className="shot-form__close" onClick={onClose} disabled={loading}>
            <X size={20} />
          </button>
        </div>

        <div className="shot-form__content" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            <strong>Cara Import:</strong> Buka Google Docs / Excel, block isi tabel Shot List Anda, lalu tekan <strong>Copy (Ctrl+C)</strong>, dan <strong>Paste (Ctrl+V)</strong> di kotak bawah ini.
          </p>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px' }}>
            <strong>Urutan Kolom yang Disarankan:</strong><br/>
            Scene | Jenis Shot | Sudut Kamera | Dialog | Brief Action | Peralatan
          </div>

          <textarea
            style={{ 
              width: '100%', 
              height: '250px', 
              background: 'var(--bg-elevated)', 
              border: '1px solid var(--border-subtle)', 
              color: 'var(--text-primary)',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '14px',
              whiteSpace: 'pre'
            }}
            placeholder="Paste tabel di sini..."
            value={pasteData}
            onChange={(e) => setPasteData(e.target.value)}
          />

          <button 
            className="btn-primary" 
            style={{ width: '100%', display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}
            onClick={handleImport}
            disabled={loading || !pasteData.trim()}
          >
            <FileDown size={18} />
            {loading ? 'Mengimport...' : 'Import Sekarang'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
