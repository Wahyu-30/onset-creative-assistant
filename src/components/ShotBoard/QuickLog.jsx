import { useState } from 'react'
import { motion } from 'framer-motion'
import { Save, X } from 'lucide-react'

export default function QuickLog({ initialNote, onSave, onClose }) {
  const [note, setNote] = useState(initialNote || '')

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{ overflow: 'hidden' }}
    >
      <div className="quick-log">
        <textarea
          className="quick-log__input"
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder='contoh: "Take 3 paling optimal" atau "Lighting berlebih"'
          rows={3}
          autoFocus
        />
        <div className="quick-log__actions">
          <button className="btn-ghost quick-log__cancel" onClick={onClose}>
            <X size={14} /> Batal
          </button>
          <button
            className="quick-log__save"
            onClick={() => onSave(note.trim())}
          >
            <Save size={13} />
            Simpan Catatan
          </button>
        </div>
      </div>
    </motion.div>
  )
}
