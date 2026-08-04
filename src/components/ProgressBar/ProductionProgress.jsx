import { motion } from 'framer-motion'
import './ProductionProgress.css'

export default function ProductionProgress({ total, done, pending, revisi, percent }) {
  const progressColor = percent === 100
    ? 'var(--status-done)'
    : percent >= 60
    ? 'var(--talent-emotion)'
    : percent >= 30
    ? 'var(--accent-primary)'
    : 'var(--accent-primary)'

  return (
    <div className="prod-progress">
      <div className="prod-progress__top">
        <div className="prod-progress__label">
          <span className="prod-progress__fraction">
            {done}<span className="prod-progress__sep">/{total}</span>
          </span>
          <span className="prod-progress__text">Shot Selesai</span>
        </div>
        <span className="prod-progress__percent" style={{ color: progressColor }}>
          {percent}%
        </span>
      </div>

      {/* Bar */}
      <div className="prod-progress__bar-track">
        <motion.div
          className="prod-progress__bar-fill"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          style={{
            background: percent === 100
              ? 'var(--status-done)'
              : `linear-gradient(90deg, var(--accent-primary), ${percent >= 60 ? 'var(--talent-emotion)' : 'var(--accent-secondary)'})`
          }}
        />
        {percent === 100 && (
          <motion.div
            className="prod-progress__shimmer"
            animate={{ x: ['0%', '100%'] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
          />
        )}
      </div>

      {/* Stats chips */}
      <div className="prod-progress__stats">
        <span className="prod-progress__stat prod-progress__stat--pending">
          ⏳ {pending} Pending
        </span>
        <span className="prod-progress__stat prod-progress__stat--done">
          ✅ {done} Done
        </span>
        {revisi > 0 && (
          <span className="prod-progress__stat prod-progress__stat--revisi">
            🔄 {revisi} Revisi
          </span>
        )}
      </div>
    </div>
  )
}
