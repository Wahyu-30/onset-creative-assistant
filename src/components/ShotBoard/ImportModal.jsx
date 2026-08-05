import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, FileDown, UploadCloud, Copy } from 'lucide-react'
import { parseDocxTable, parseExcelTable, parseTSVTable } from '../../utils/importUtils'

export default function ImportModal({ onClose, onImport }) {
  const [activeTab, setActiveTab] = useState('paste') // 'paste' | 'file'
  const [pasteData, setPasteData] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleImport = async () => {
    setLoading(true)
    try {
      let parsedShots = []
      
      if (activeTab === 'paste') {
        if (!pasteData.trim()) throw new Error("Data paste kosong.")
        parsedShots = parseTSVTable(pasteData)
      } else {
        if (!selectedFile) throw new Error("Pilih file terlebih dahulu.")
        
        const buffer = await selectedFile.arrayBuffer()
        const ext = selectedFile.name.split('.').pop().toLowerCase()
        
        if (ext === 'docx') {
          parsedShots = await parseDocxTable(buffer)
        } else if (ext === 'xlsx' || ext === 'csv') {
          parsedShots = await parseExcelTable(buffer)
        } else {
          throw new Error("Format file tidak didukung.")
        }
      }

      if (parsedShots.length === 0) throw new Error("Tidak ada data valid yang ditemukan.")

      await onImport(parsedShots)
      onClose()
    } catch (err) {
      console.error(err)
      alert(`Gagal mengimport data: ${err.message}`)
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
          <h2 className="shot-form__title">Import Shot List</h2>
          <button className="shot-form__close" onClick={onClose} disabled={loading}>
            <X size={20} />
          </button>
        </div>

        <div className="shot-form__content" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Tabs */}
          <div style={{ display: 'flex', background: 'var(--bg-elevated)', borderRadius: '8px', padding: '4px' }}>
            <button 
              onClick={() => setActiveTab('paste')}
              style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', background: activeTab === 'paste' ? 'var(--bg-surface)' : 'transparent', color: activeTab === 'paste' ? 'var(--text-primary)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontWeight: 'bold' }}
            >
              <Copy size={16} /> Copy-Paste
            </button>
            <button 
              onClick={() => setActiveTab('file')}
              style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', background: activeTab === 'file' ? 'var(--bg-surface)' : 'transparent', color: activeTab === 'file' ? 'var(--text-primary)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontWeight: 'bold' }}
            >
              <UploadCloud size={16} /> Upload File
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'paste' ? (
              <motion.div key="paste" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Block isi tabel di <strong>Google Docs / Excel</strong>, <strong>Copy (Ctrl+C)</strong>, lalu <strong>Paste (Ctrl+V)</strong> di bawah:
                </p>
                <textarea
                  style={{ width: '100%', height: '200px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', padding: '12px', borderRadius: '8px', fontSize: '14px', whiteSpace: 'pre' }}
                  placeholder="Paste tabel di sini (baris pertama harus berisi judul kolom seperti Scene, Shot, Dialog...)"
                  value={pasteData}
                  onChange={(e) => setPasteData(e.target.value)}
                />
              </motion.div>
            ) : (
              <motion.div key="file" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Upload dokumen <strong>.docx</strong> (Word/Google Docs) atau <strong>.xlsx / .csv</strong> (Excel). Kami akan mencari tabel di dalamnya secara otomatis.
                </p>
                <label style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  width: '100%', height: '160px', border: '2px dashed var(--border-subtle)', borderRadius: '12px',
                  background: 'var(--bg-elevated)', cursor: 'pointer', color: 'var(--text-secondary)', gap: '10px'
                }}>
                  <UploadCloud size={32} />
                  <span>{selectedFile ? selectedFile.name : 'Pilih file .docx / .xlsx / .csv'}</span>
                  <input type="file" accept=".docx,.xlsx,.csv" style={{ display: 'none' }} onChange={(e) => setSelectedFile(e.target.files[0])} />
                </label>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            className="btn-primary" 
            style={{ width: '100%', display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center', marginTop: '8px' }}
            onClick={handleImport}
            disabled={loading || (activeTab === 'paste' ? !pasteData.trim() : !selectedFile)}
          >
            <FileDown size={18} />
            {loading ? 'Membaca Data...' : 'Import Sekarang'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
