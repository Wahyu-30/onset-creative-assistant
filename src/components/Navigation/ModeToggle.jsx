import { motion } from 'framer-motion'
import { Camera, FileText } from 'lucide-react'
import './ModeToggle.css'

export default function ModeToggle({ mode, onToggle }) {
  return (
    <div className="mode-toggle">
      <div className="mode-toggle__track">
        <motion.div
          className="mode-toggle__thumb"
          layout
          animate={{ x: mode === 'talent' ? '100%' : '0%' }}
          transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        />
        <button
          className={`mode-toggle__btn ${mode === 'tech' ? 'active' : ''}`}
          onClick={() => onToggle('tech')}
        >
          <Camera size={14} />
          Tech
        </button>
        <button
          className={`mode-toggle__btn ${mode === 'talent' ? 'active' : ''}`}
          onClick={() => onToggle('talent')}
        >
          <FileText size={14} />
          Talent
        </button>
      </div>
    </div>
  )
}
