import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package, AlignLeft, Quote, Link2, ChevronDown, ChevronUp, CheckCircle2,
  RotateCcw, StickyNote, Image, Video, Edit3, Trash2, ExternalLink, Plus, X, Check, Volume2
} from 'lucide-react'
import StatusBadge from './StatusBadge'
import ImageViewer from '../ImageViewer/ImageViewer'
import QuickLog from './QuickLog'
import { shotsService } from '../../services/shotsService'

function getDirectImageUrl(url) {
  if (!url) return url;
  
  // Google Drive format: https://drive.google.com/file/d/FILE_ID/view
  const driveRegex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
  const match = url.match(driveRegex);
  if (match && match[1]) {
    return `https://drive.google.com/uc?export=view&id=${match[1]}`;
  }
  
  // Alternative Google Drive format: https://drive.google.com/open?id=FILE_ID
  const driveOpenRegex = /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/;
  const matchOpen = url.match(driveOpenRegex);
  if (matchOpen && matchOpen[1]) {
    return `https://drive.google.com/uc?export=view&id=${matchOpen[1]}`;
  }
  
  return url;
}

function RefImage({ img, index, onClick }) {
  const [error, setError] = useState(false)

  const directUrl = getDirectImageUrl(img)

  if (error) {
    return (
      <button
        className="shot-card__ref-error"
        onClick={(e) => {
          e.stopPropagation();
          onClick(img); // Pass the original URL to open in iframe
        }}
      >
        <ExternalLink size={12} />
        Preview di Web
      </button>
    )
  }

  return (
    <motion.img
      src={directUrl}
      alt={`Ref ${index + 1}`}
      className="shot-card__ref-img"
      onClick={() => onClick(directUrl)}
      whileTap={{ scale: 0.96 }}
      onError={() => setError(true)}
    />
  )
}

// Inline editable textarea — klik langsung bisa ketik, blur auto-save
function InlineTextarea({ value, placeholder, onSave, rows = 3, renderValue }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value || '')

  const handleSave = useCallback(() => {
    setEditing(false)
    if (draft !== (value || '')) onSave(draft)
  }, [draft, value, onSave])

  if (editing) {
    return (
      <div style={{ position: 'relative' }}>
        <textarea
          autoFocus
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={handleSave}
          onKeyDown={e => {
            if (e.key === 'Escape') { setDraft(value || ''); setEditing(false) }
            if (e.key === 'Enter' && e.ctrlKey) { e.preventDefault(); handleSave() }
          }}
          rows={rows}
          style={{
            width: '100%', background: 'var(--bg-elevated)', border: '1.5px solid var(--accent-primary)',
            borderRadius: '8px', padding: '10px 48px 10px 12px', color: 'var(--text-primary)',
            fontSize: '13px', lineHeight: '1.6', resize: 'vertical', outline: 'none', fontFamily: 'inherit'
          }}
        />
        <div style={{ position: 'absolute', top: 6, right: 6, display: 'flex', gap: 4 }}>
          <button type="button" onMouseDown={e => { e.preventDefault(); handleSave() }}
            style={{ background: 'var(--accent-primary)', border: 'none', borderRadius: '4px', padding: '3px 7px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <Check size={12} />
          </button>
          <button type="button" onMouseDown={e => { e.preventDefault(); setDraft(value || ''); setEditing(false) }}
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-card)', borderRadius: '4px', padding: '3px 7px', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <X size={12} />
          </button>
        </div>
        <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: 4 }}>Ctrl+Enter simpan · Esc batal</p>
      </div>
    )
  }

  return (
    <div
      onClick={e => { e.stopPropagation(); setDraft(value || ''); setEditing(true) }}
      title="Klik untuk edit"
      style={{ cursor: 'text', padding: '8px 10px', borderRadius: '8px', border: '1.5px dashed transparent', transition: 'border-color 0.15s, background 0.15s', minHeight: '36px' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.background = 'var(--bg-elevated)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = 'transparent' }}
    >
      {value
        ? <span style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>{renderValue ? renderValue(value) : value}</span>
        : <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>{placeholder}</span>
      }
    </div>
  )
}

// Inline URL list — tambah/hapus referensi langsung dari kartu
function InlineUrlList({ urls = [], onSave, placeholder, icon: Icon }) {
  const [newUrl, setNewUrl] = useState('')
  const [showInput, setShowInput] = useState(false)

  const handleAdd = () => {
    if (!newUrl.trim()) return
    onSave([...urls, newUrl.trim()])
    setNewUrl(''); setShowInput(false)
  }

  return (
    <div onClick={e => e.stopPropagation()}>
      {urls.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
          {urls.map((url, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-elevated)', borderRadius: '6px', padding: '6px 8px', border: '1px solid var(--border-card)' }}>
              <Icon size={11} color="var(--accent-secondary)" style={{ flexShrink: 0 }} />
              <a href={url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: 'var(--accent-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: 'none' }} onClick={e => e.stopPropagation()}>
                {url.length > 45 ? url.slice(0, 45) + '...' : url}
              </a>
              <button type="button" onClick={() => onSave(urls.filter((_, idx) => idx !== i))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--status-revisi)', padding: '2px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
      {showInput ? (
        <div style={{ display: 'flex', gap: 6 }}>
          <input autoFocus type="url" value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder={placeholder}
            onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setShowInput(false) }}
            style={{ flex: 1, background: 'var(--bg-elevated)', border: '1.5px solid var(--accent-primary)', borderRadius: '6px', padding: '7px 10px', color: 'var(--text-primary)', fontSize: '12px', outline: 'none', fontFamily: 'inherit' }} />
          <button type="button" onClick={handleAdd}
            style={{ background: 'var(--accent-primary)', border: 'none', borderRadius: '6px', padding: '7px 10px', color: 'white', cursor: 'pointer', display: 'flex', flexShrink: 0 }}>
            <Check size={13} />
          </button>
          <button type="button" onClick={() => { setShowInput(false); setNewUrl('') }}
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-card)', borderRadius: '6px', padding: '7px 10px', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', flexShrink: 0 }}>
            <X size={13} />
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => setShowInput(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '12px', color: 'var(--accent-primary)', background: 'transparent', border: '1px dashed var(--accent-primary-border)', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', width: '100%', justifyContent: 'center', fontFamily: 'inherit' }}>
          <Plus size={13} />
          {urls.length > 0 ? 'Tambah lagi' : placeholder}
        </button>
      )}
    </div>
  )
}

// helper
function isDriveLink(url) {
  return url && url.includes('drive.google.com')
}

// Video Ref List — tap buka, bukan edit
function VideoRefList({ urls = [], onSave, onOpenViewer }) {
  const [newUrl, setNewUrl] = useState('')
  const [showInput, setShowInput] = useState(false)

  const handleAdd = () => {
    if (!newUrl.trim()) return
    onSave([...urls, newUrl.trim()])
    setNewUrl(''); setShowInput(false)
  }

  const handleOpen = (url) => {
    if (isDriveLink(url)) {
      // buka di iframe viewer in-app
      onOpenViewer(url)
    } else {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div onClick={e => e.stopPropagation()}>
      {urls.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
          {urls.map((url, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-elevated)', borderRadius: '6px', padding: '6px 8px', border: '1px solid var(--border-card)' }}>
              {/* Tombol buka */}
              <button
                type="button"
                onClick={() => handleOpen(url)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0, minWidth: 0 }}
              >
                {isDriveLink(url)
                  ? <Video size={11} color="#4285F4" style={{ flexShrink: 0 }} />
                  : <ExternalLink size={11} color="var(--accent-secondary)" style={{ flexShrink: 0 }} />
                }
                <span style={{ fontSize: '12px', color: 'var(--accent-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {url.length > 45 ? url.slice(0, 45) + '...' : url}
                </span>
              </button>
              {/* Tombol hapus */}
              <button type="button" onClick={() => onSave(urls.filter((_, idx) => idx !== i))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--status-revisi)', padding: '2px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
      {showInput ? (
        <div style={{ display: 'flex', gap: 6 }}>
          <input autoFocus type="url" value={newUrl} onChange={e => setNewUrl(e.target.value)}
            placeholder="https://drive.google.com/... atau https://tiktok.com/..."
            onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setShowInput(false) }}
            style={{ flex: 1, background: 'var(--bg-elevated)', border: '1.5px solid var(--accent-primary)', borderRadius: '6px', padding: '7px 10px', color: 'var(--text-primary)', fontSize: '12px', outline: 'none', fontFamily: 'inherit' }} />
          <button type="button" onClick={handleAdd}
            style={{ background: 'var(--accent-primary)', border: 'none', borderRadius: '6px', padding: '7px 10px', color: 'white', cursor: 'pointer', display: 'flex', flexShrink: 0 }}>
            <Check size={13} />
          </button>
          <button type="button" onClick={() => { setShowInput(false); setNewUrl('') }}
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-card)', borderRadius: '6px', padding: '7px 10px', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', flexShrink: 0 }}>
            <X size={13} />
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => setShowInput(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '12px', color: 'var(--accent-primary)', background: 'transparent', border: '1px dashed var(--accent-primary-border)', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', width: '100%', justifyContent: 'center', fontFamily: 'inherit' }}>
          <Plus size={13} />
          {urls.length > 0 ? 'Tambah lagi' : 'Tambah URL video referensi'}
        </button>
      )}
    </div>
  )
}

export default function ShotCard({ shot, onStatusChange, onNoteChange, onEdit, onDelete, onMoveUp, onMoveDown, isFirst, isLast, index, isMultiShot, onShotUpdate }) {
  const [expanded, setExpanded] = useState(false)
  const [viewerImg, setViewerImg] = useState(null)
  const [showLog, setShowLog] = useState(false)
  const [expandOverflow, setExpandOverflow] = useState('hidden')
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleInlineSave = useCallback(async (field, value) => {
    setSaving(true)
    try {
      const updated = await shotsService.updateShot(shot.id, { [field]: value })
      if (onShotUpdate) onShotUpdate(updated)
    } catch (err) {
      console.error('Inline save error:', err)
      alert('Gagal menyimpan perubahan.')
    } finally {
      setSaving(false)
    }
  }, [shot.id, onShotUpdate])


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
  const imageCount = shot.referenceImages?.length || 0
  const videoCount = shot.referenceLinks?.length || 0
  const hasReferences = imageCount + videoCount > 0
  const equipmentSummary = shot.equipment?.length > 0
    ? `${shot.equipment[0]}${shot.equipment.length > 1 ? ` +${shot.equipment.length - 1}` : ''}`
    : ''
  const compactMeta = [shot.shotType, equipmentSummary].filter(Boolean).join(' · ')
  const referenceLabel = [
    imageCount > 0 && `${imageCount} foto`,
    videoCount > 0 && `${videoCount} video`
  ].filter(Boolean).join(' · ')

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04, duration: 0.3 }}
        className={`shot-card ${isDone ? 'shot-card--done' : ''} ${isRevisi ? 'shot-card--revisi' : ''} ${isMultiShot ? 'shot-card--multi' : ''}`}
      >
        {/* Card Header */}
        <div className="shot-card__header" onClick={() => setExpanded(!expanded)}>
          <div className="shot-card__header-left">
            <div className="shot-card__scene-badge">
              <span className="shot-card__scene-num">{isMultiShot ? `#${index + 1}` : shot.scene}</span>
            </div>
            <div className="shot-card__title-group">
              <h3 className="shot-card__scene-label">{shot.sceneLabel}</h3>
              <p className="shot-card__shot-type">{compactMeta || shot.angle || 'Detail shot belum diisi'}</p>
            </div>
          </div>
          <div className="shot-card__header-right">
            {/* Reorder buttons */}
            <div className="shot-card__reorder" onClick={e => e.stopPropagation()}>
              <button
                className="shot-card__reorder-btn"
                onClick={onMoveUp}
                disabled={isFirst}
                aria-label="Geser ke atas"
                title="Geser ke atas"
              >
                <ChevronUp size={13} />
              </button>
              <button
                className="shot-card__reorder-btn"
                onClick={onMoveDown}
                disabled={isLast}
                aria-label="Geser ke bawah"
                title="Geser ke bawah"
              >
                <ChevronDown size={13} />
              </button>
            </div>
            {hasReferences && (
              <div className="shot-card__reference-indicator" title={`Referensi: ${referenceLabel}`}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Ada Referensi {imageCount > 0 && `(📷 ${imageCount})`} {videoCount > 0 && `(🎬 ${videoCount})`}
                </span>
              </div>
            )}
            <StatusBadge status={shot.status} size="sm" />
            <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={16} color="var(--text-muted)" />
            </motion.div>
          </div>
        </div>

        {/* Brief Action — selalu tampil, inline editable */}
        <div className="shot-card__brief" style={{ alignItems: 'flex-start' }} onClick={e => e.stopPropagation()}>
          <AlignLeft size={12} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: 10 }} />
          <div style={{ flex: 1 }}>
            <InlineTextarea
              value={shot.briefAction}
              placeholder="Ketuk untuk mengisi brief action..."
              rows={3}
              onSave={(val) => handleInlineSave('briefAction', val)}
            />
          </div>
        </div>

        {/* Dialog — selalu tampil, inline editable */}
        <div className="shot-card__brief" style={{ alignItems: 'flex-start', borderTop: 'none', paddingTop: 0 }} onClick={e => e.stopPropagation()}>
          <Quote size={12} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: 10 }} />
          <div style={{ flex: 1 }}>
            <InlineTextarea
              value={shot.dialog}
              placeholder="Ketuk untuk mengisi dialog atau naskah Talent..."
              rows={4}
              renderValue={parseDialog}
              onSave={(val) => handleInlineSave('dialog', val)}
            />
          </div>
        </div>

        {/* SFX — selalu tampil, inline editable */}
        <div className="shot-card__brief" style={{ alignItems: 'flex-start', borderTop: 'none', paddingTop: 0 }} onClick={e => e.stopPropagation()}>
          <Volume2 size={12} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: 10 }} />
          <div style={{ flex: 1 }}>
            <InlineTextarea
              value={shot.sfx}
              placeholder="Ketuk untuk mengisi keterangan SFX..."
              rows={2}
              onSave={(val) => handleInlineSave('sfx', val)}
            />
          </div>
        </div>

        {/* Expanded Details */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              style={{ overflow: expandOverflow }}
              onAnimationStart={(def) => {
                if (def === 'exit') setExpandOverflow('hidden')
              }}
              onAnimationComplete={(def) => {
                if (def === 'animate') setExpandOverflow('visible')
              }}
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

                {/* Foto Referensi — inline add/remove */}
                <div className="shot-card__detail-row">
                  <div className="shot-card__detail-label"><Image size={12} /> Foto Referensi Framing</div>
                  {shot.referenceImages?.length > 0 && (
                    <div className="shot-card__images" style={{ marginBottom: 8 }}>
                      {shot.referenceImages.map((img, i) => (
                        <RefImage key={i} img={img} index={i} onClick={(u) => setViewerImg(u)} />
                      ))}
                    </div>
                  )}
                  <InlineUrlList
                    urls={shot.referenceImages || []}
                    onSave={(val) => handleInlineSave('referenceImages', val)}
                    placeholder="Tambah URL foto referensi"
                    icon={Image}
                  />
                </div>

                {/* Video Referensi — smart open: Drive = iframe, lainnya = tab baru */}
                <div className="shot-card__detail-row">
                  <div className="shot-card__detail-label"><Video size={12} /> Video Referensi (TikTok / Reels)</div>
                  <VideoRefList
                    urls={shot.referenceLinks || []}
                    onSave={(val) => handleInlineSave('referenceLinks', val)}
                    onOpenViewer={(url) => setViewerImg(url)}
                  />
                </div>

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
          <div className="shot-card__left-actions">
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
              aria-label={`Edit lanjutan ${shot.sceneLabel}`}
              title="Edit teknis: Scene, Shot Type, Angle, Equipment"
            >
              <Edit3 size={13} />
              Edit Lanjutan
            </button>
          </div>

          <div className="shot-card__right-actions">
            {/* Delete with 2-tap confirmation */}
            {deleteConfirm ? (
              <motion.button
                className="shot-card__btn shot-card__btn--delete-confirm"
                onClick={(e) => { e.stopPropagation(); onDelete(shot.id) }}
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Trash2 size={13} />
                Yakin hapus?
              </motion.button>
            ) : (
              <motion.button
                className="shot-card__btn shot-card__btn--delete"
                onClick={(e) => { e.stopPropagation(); setDeleteConfirm(true); setTimeout(() => setDeleteConfirm(false), 3000) }}
                whileTap={{ scale: 0.9 }}
              >
                <Trash2 size={13} />
              </motion.button>
            )}

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
