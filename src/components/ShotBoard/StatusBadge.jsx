import { motion } from 'framer-motion'
import { STATUS_CONFIG } from '../../data/sampleData'

export default function StatusBadge({ status, size = 'md' }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING
  const isSmall = size === 'sm'

  return (
    <motion.span
      layout
      className="status-badge"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: isSmall ? 3 : 5,
        padding: isSmall ? '2px 7px' : '4px 10px',
        borderRadius: '999px',
        background: config.bg,
        border: `1px solid ${config.border}`,
        fontSize: isSmall ? 10 : 11,
        fontWeight: 700,
        color: config.color,
        letterSpacing: '0.04em',
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: isSmall ? 10 : 12 }}>{config.emoji}</span>
      {config.label}
    </motion.span>
  )
}
