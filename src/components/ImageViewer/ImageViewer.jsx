import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, ExternalLink, ImageOff } from 'lucide-react'

export default function ImageViewer({ src, onClose }) {
  const [loadFailed, setLoadFailed] = useState(false)

  // Cek apakah ini link Google Drive
  const isGoogleDrive = src.includes('drive.google.com')
  let iframeUrl = src

  if (isGoogleDrive) {
    // Jika format uc?export=view, ambil ID-nya dan ubah ke /preview
    const ucMatch = src.match(/id=([a-zA-Z0-9_-]+)/)
    if (ucMatch && ucMatch[1]) {
      iframeUrl = `https://drive.google.com/file/d/${ucMatch[1]}/preview`
    } else {
      iframeUrl = src.replace(/\/view.*$/, '/preview').replace(/\/edit.*$/, '/preview')
    }
  }

  return (
    <motion.div
      className="overlay image-viewer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <button
        className="image-viewer__close"
        onClick={onClose}
        aria-label="Tutup"
      >
        <X size={20} />
      </button>

      {isGoogleDrive ? (
        <motion.iframe
          src={iframeUrl}
          className="image-viewer__iframe"
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.85, opacity: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 250 }}
          onClick={e => e.stopPropagation()}
          allow="autoplay"
          title="Google Drive Preview"
        />
      ) : loadFailed ? (
        /* Error state — image blocked by CORS / hotlink protection */
        <motion.div
          className="image-viewer__error"
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={e => e.stopPropagation()}
        >
          <ImageOff size={40} color="var(--text-muted)" />
          <p className="image-viewer__error-title">Gambar tidak bisa ditampilkan</p>
          <p className="image-viewer__error-desc">
            Sumber gambar memblokir tampilan langsung.<br />
            Buka di tab baru untuk melihat.
          </p>
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="image-viewer__open-btn"
            onClick={e => e.stopPropagation()}
          >
            <ExternalLink size={14} />
            Buka di Browser
          </a>
        </motion.div>
      ) : (
        <motion.img
          src={src}
          alt="Reference"
          className="image-viewer__img"
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.85, opacity: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 250 }}
          onClick={e => e.stopPropagation()}
          onError={() => setLoadFailed(true)}
        />
      )}

      <p className="image-viewer__hint">Tap di luar untuk tutup</p>
    </motion.div>
  )
}
