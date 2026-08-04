import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, ExternalLink, ImageOff } from 'lucide-react'

export default function ImageViewer({ src, onClose }) {
  const [loadFailed, setLoadFailed] = useState(false)

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

      {loadFailed ? (
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
