import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package, AlignLeft, Quote, Link2, ChevronDown, CheckCircle2,
  RotateCcw, StickyNote, Image, Edit3
} from 'lucide-react'
import StatusBadge from './StatusBadge'
import ImageViewer from '../ImageViewer/ImageViewer'
import QuickLog from './QuickLog'

export default function ShotCard({ shot, onStatusChange, onNoteChange, onEdit, index }) {
  const [expanded, setExpanded] = useState(false)
  const [viewerImg, setViewerImg] = useState(null)
  const [showLog, setShowLog] = useState(false)

  const handleTakeDone = (e) => {
    e.stopPropagation()
    const next = shot.status === 'TAKE_DONE' ? 'PENDING' : 'TAKE_DONE'
    onStatusChange(shot.id, next)
  }

  const handleRevisi = (e) => {
    e.stopPropagation()
    const next = shot.status === 'REVISI' ? 'PENDING' : 'REVISI'
    onStatusChange(shot.id, next)
  }

  // Parse dialog for talent instructions like <EKSPRESI KAGET>
  const parseDialog = (text) => {
    if (!text) return null
    const parts = text.split(/(<[^>]+>)/g)
    return parts.map((part, i) => {
      if (part.match(/^<[^>]+>$/)) {
        const inner = part.slice(1, -1)
        const type = inner.toLowerCase()
        let style = { background: 'var(--talent-action-bg)', color: 'var(--talent-action)', border: '1px solid var(--talent-action-border)' }
        if (type.includes('nada') || type.includes('cepat') || type.includes('lambat')) {
          style = { background: 'var(--talent-emotion-bg)', color: 'var(--talent-emotion)', border: '1px solid var(--talent-emotion-border)' }
        }
        if (type.includes('senyum') || type.includes('tawa') || type.includes('hangat')) {
          style = { background: 'var(--talent-tone-bg)', color: 'var(--talent-tone)', border: '1px solid var(--talent-tone-border)' }
        }
        return (
          <span key={i} style={{
            ...style,
            display: 'inline-block',
            borderRadius: '4px',
            padding: '1px 6px',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.03em',
            margin: '0 3px',
            verticalAlign: 'middle',
            lineHeight: 1.6
          }}>
            {inner}
          </span>
        )
      }
      return <span key={i}>{part}</span>
    })
  }

  const isDone = shot.status === 'TAKE_DONE'
  const isRevisi = shot.status === 'REVISI'

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04, duration: 0.3 }}
        className={`shot-card ${isDone ? 'shot-card--done' : ''} ${isRevisi ? 'shot-card--revisi' : ''}`}
      >
        {/* Card Header */}
        <div className="shot-card__header" onClick={() => setExpanded(!expanded)}>
          <div className="shot-card__header-left">
            <div className="shot-card__scene-badge">
              <span className="shot-card__scene-num">{shot.scene}</span>
            </div>
            <div className="shot-card__title-group">
              <h3 className="shot-card__scene-label">{shot.sceneLabel}</h3>
              <p className="shot-card__shot-type">{shot.shotType}{shot.angle ? ` · ${shot.angle}` : ''}</p>
            </div>
          </div>
          <div className="shot-card__header-right">
            <StatusBadge status={shot.status} size="sm" />
            <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={16} color="var(--text-muted)" />
            </motion.div>
          </div>
        </div>

        {/* Brief Action — always visible */}
        {shot.briefAction && (
          <div className="shot-card__brief">
            <AlignLeft size={12} color="var(--text-muted)" />
            <p className="shot-card__brief-text">{shot.briefAction}</p>
          </div>
        )}

        {/* Expanded Details */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              style={{ overflow: 'hidden' }}
            >
              <div className="shot-card__details">

                {/* Equipment */}
                {shot.equipment?.length > 0 && (
                  <div className="shot-card__detail-row">
                    <div className="shot-card__detail-label">
                      <Package size={12} />
                      Equipment
                    </div>
                    <div className="shot-card__chips">
                      {shot.equipment.map((eq, i) => (
                        <span key={i} className="chip" style={{ background: 'var(--accent-primary-soft)', color: 'var(--accent-secondary)', border: '1px solid var(--accent-primary-border)' }}>
                          {eq}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dialog / Script */}
                {shot.dialog && (
                  <div className="shot-card__detail-row">
                    <div className="shot-card__detail-label">
                      <Quote size={12} />
                      Dialog / Naskah
                    </div>
                    <div className="shot-card__dialog">
                      {parseDialog(shot.dialog)}
                    </div>
                  </div>
                )}

                {/* Reference Images */}
                {shot.referenceImages?.length > 0 && (
                  <div className="shot-card__detail-row">
                    <div className="shot-card__detail-label">
                      <Image size={12} />
                      Referensi Visual
                    </div>
                    <div className="shot-card__images">
                      {shot.referenceImages.map((img, i) => (
                        <motion.img
                          key={i}
                          src={img}
                          alt={`Ref ${i + 1}`}
                          className="shot-card__ref-img"
                          onClick={() => setViewerImg(img)}
                          whileTap={{ scale: 0.96 }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Reference Links */}
                {shot.referenceLinks?.length > 0 && (
                  <div className="shot-card__detail-row">
                    <div className="shot-card__detail-label">
                      <Link2 size={12} />
                      Link Referensi
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {shot.referenceLinks.map((link, i) => (
                        <a
                          key={i}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shot-card__ref-link"
                          onClick={e => e.stopPropagation()}
                        >
                          <Link2 size={11} />
                          {link.length > 40 ? link.slice(0, 40) + '...' : link}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {shot.notes && (
                  <div className="shot-card__notes">
                    <StickyNote size={11} />
                    <span>{shot.notes}</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Bar */}
        <div className="shot-card__actions">
          <button
            className={`shot-card__log-btn ${showLog ? 'shot-card__log-btn--active' : ''}`}
            onClick={(e) => { e.stopPropagation(); setShowLog(!showLog) }}
          >
            <Edit3 size={13} />
            {shot.notes ? 'Edit Catatan' : 'Catatan'}
          </button>
          <button
            className="shot-card__log-btn"
            onClick={() => onEdit(shot)}
            aria-label={`Edit ${shot.sceneLabel}`}
          >
            <Edit3 size={13} />
            Edit
          </button>

          <div className="shot-card__status-btns">
            <motion.button
              className={`shot-card__btn shot-card__btn--revisi ${isRevisi ? 'active' : ''}`}
              onClick={handleRevisi}
              whileTap={{ scale: 0.9 }}
            >
              <RotateCcw size={14} />
              Revisi
            </motion.button>
            <motion.button
              className={`shot-card__btn shot-card__btn--done ${isDone ? 'active' : ''}`}
              onClick={handleTakeDone}
              whileTap={{ scale: 0.9 }}
            >
              <CheckCircle2 size={14} />
              {isDone ? 'Done ✓' : 'Take Done'}
            </motion.button>
          </div>
        </div>

        {/* Quick Log */}
        <AnimatePresence>
          {showLog && (
            <QuickLog
              initialNote={shot.notes}
              onSave={(note) => { onNoteChange(shot.id, note); setShowLog(false) }}
              onClose={() => setShowLog(false)}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Image Viewer */}
      <AnimatePresence>
        {viewerImg && (
          <ImageViewer src={viewerImg} onClose={() => setViewerImg(null)} />
        )}
      </AnimatePresence>
    </>
  )
}
