import { motion } from 'framer-motion'
import './ScriptView.css'

// Parse dialog tags like <EKSPRESI KAGET>
function parseDialogTags(text) {
  if (!text) return null
  const parts = text.split(/(<[^>]+>)/g)
  return parts.map((part, i) => {
    if (part.match(/^<[^>]+>$/)) {
      const inner = part.slice(1, -1).toUpperCase()
      const lower = inner.toLowerCase()
      let cls = 'script-tag script-tag--action'
      if (lower.includes('nada') || lower.includes('cepat') || lower.includes('lambat') || lower.includes('antusias')) {
        cls = 'script-tag script-tag--tone'
      }
      if (lower.includes('senyum') || lower.includes('hangat') || lower.includes('tawa')) {
        cls = 'script-tag script-tag--positive'
      }
      return <span key={i} className={cls}>{inner}</span>
    }
    return <span key={i}>{part}</span>
  })
}

export default function ScriptView({ shots, activeSceneFilter }) {
  const filteredShots = activeSceneFilter
    ? shots.filter(s => s.scene === activeSceneFilter)
    : shots

  return (
    <div className="script-view">
      <div className="script-view__header">
        <span className="script-view__icon">📝</span>
        <div>
          <h2 className="script-view__title">Mode Talent</h2>
          <p className="script-view__subtitle">Tampilan naskah — info teknis disembunyikan</p>
        </div>
      </div>

      <div className="script-view__list">
        {filteredShots.map((shot, i) => (
          <motion.div
            key={shot.id}
            className="script-scene"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <div className="script-scene__label">
              <span className="script-scene__num">{shot.scene}</span>
              <span className="script-scene__name">{shot.sceneLabel}</span>
            </div>

            {shot.briefAction && (
              <p className="script-scene__brief">{shot.briefAction}</p>
            )}

            {shot.dialog ? (
              <div className="script-scene__dialog">
                {parseDialogTags(shot.dialog)}
              </div>
            ) : (
              <p className="script-scene__no-dialog">— tidak ada dialog —</p>
            )}
          </motion.div>
        ))}

        {filteredShots.length === 0 && (
          <div className="empty-state">
            <div className="empty-state__icon">📄</div>
            <p className="empty-state__title">Tidak ada scene</p>
          </div>
        )}
      </div>
    </div>
  )
}
