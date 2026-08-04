import { motion } from 'framer-motion'
import { X } from 'lucide-react'

export default function ImageViewer({ src, onClose }) {
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
      <motion.img
        src={src}
        alt="Reference"
        className="image-viewer__img"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: 'spring', damping: 22, stiffness: 250 }}
        onClick={e => e.stopPropagation()}
      />
      <p className="image-viewer__hint">Tap di luar untuk tutup</p>
    </motion.div>
  )
}
