import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Trash2, Upload, FileDown, CheckCircle, Wand2 } from 'lucide-react'
import { storageService } from '../../services/storageService'
import { shotsService } from '../../services/shotsService'
import imageCompression from 'browser-image-compression'
import ImportModal from '../ShotBoard/ImportModal'
import { parseProjectText } from '../../utils/importUtils'

export default function ProjectForm({ onClose, editProject, onCreate, onUpdate }) {
  const isEdit = !!editProject

  const [form, setForm] = useState({
    name: editProject?.name || '',
    client: editProject?.client || '',
    deadline: editProject?.deadline || '',
    targetAudience: editProject?.targetAudience || '',
    concept: editProject?.concept || '',
    styleGuideNotes: editProject?.styleGuide?.notes || '',
    styleGuideImages: editProject?.styleGuide?.images || [],
    styleGuideLinks: editProject?.styleGuide?.links || [],
    shootDate: editProject?.styleGuide?.shootDate || '',
    shootTime: editProject?.styleGuide?.shootTime || '',
    shootLocation: editProject?.styleGuide?.shootLocation || '',
    formatSpec: editProject?.styleGuide?.formatSpec || ''
  })
  const [newLink, setNewLink] = useState('')
  const [newImage, setNewImage] = useState('')
  const [loading, setLoading] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [importShots, setImportShots] = useState([])
  const [showMagic, setShowMagic] = useState(false)
  const [magicText, setMagicText] = useState('')

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const handleMagicFill = () => {
    if (!magicText.trim()) return;
    const parsed = parseProjectText(magicText);
    setForm(prev => ({
      ...prev,
      name: parsed.name || prev.name,
      client: parsed.client || prev.client,
      deadline: parsed.deadline || prev.deadline,
      targetAudience: parsed.targetAudience || prev.targetAudience,
      concept: parsed.concept || prev.concept,
      styleGuideNotes: parsed.styleGuideNotes || prev.styleGuideNotes,
      styleGuideLinks: [...new Set([...prev.styleGuideLinks, ...parsed.styleGuideLinks])],
      formatSpec: parsed.formatSpec || prev.formatSpec,
    }));
    if (parsed.shots && parsed.shots.length > 0) {
      setImportShots(parsed.shots);
    }
    setShowMagic(false);
    setMagicText('');
  }

  const addLink = () => {
    if (isValidHttpUrl(newLink)) {
      update('styleGuideLinks', [...form.styleGuideLinks, newLink.trim()])
      setNewLink('')
    }
  }

  const addImage = () => {
    if (isValidHttpUrl(newImage)) {
      update('styleGuideImages', [...form.styleGuideImages, newImage.trim()])
      setNewImage('')
    }
  }

  const removeLink = (i) => {
    update('styleGuideLinks', form.styleGuideLinks.filter((_, idx) => idx !== i))
  }

  const handleFileUpload = async (e, isVideo = false) => {
    const file = e.target.files[0]
    if (!file) return
    
    const maxSize = isVideo ? 20 * 1024 * 1024 : 5 * 1024 * 1024
    if (file.size > maxSize) {
      alert(`Ukuran file terlalu besar! Maksimal ${isVideo ? '20MB (Video)' : '5MB (Foto)'}`)
      return
    }

    try {
      setLoading(true)
      let fileToUpload = file;
      
      if (!isVideo) {
        const options = { maxSizeMB: 0.2, maxWidthOrHeight: 1080, useWebWorker: true }
        fileToUpload = await imageCompression(file, options)
      }

      const url = await storageService.uploadFile(fileToUpload, 'projects')
      if (isVideo) {
        update('styleGuideLinks', [...form.styleGuideLinks, url])
      } else {
        update('styleGuideImages', [...form.styleGuideImages, url])
      }
    } catch (err) {
      alert('Gagal mengupload file.')
    } finally {
      setLoading(false)
      e.target.value = null
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.client.trim()) return
    setLoading(true)

    const projectData = {
      name: form.name.trim(),
      client: form.client.trim(),
      deadline: form.deadline,
      targetAudience: form.targetAudience,
      concept: form.concept,
      styleGuide: {
        notes: form.styleGuideNotes,
        images: form.styleGuideImages,
        links: form.styleGuideLinks,
        shootDate: form.shootDate,
        shootTime: form.shootTime,
        shootLocation: form.shootLocation,
        formatSpec: form.formatSpec
      }
    }

    try {
      if (isEdit) {
        await onUpdate(editProject.id, projectData)
      } else {
        const newProject = await onCreate(projectData)
        if (newProject && importShots.length > 0) {
          const sceneCounters = {}
          const newShotsData = importShots.map((shot, idx) => {
            const sceneNum = shot.scene || 1
            if (!sceneCounters[sceneNum]) sceneCounters[sceneNum] = 0
            sceneCounters[sceneNum] += 1
            
            return {
              ...shot,
              scene: sceneNum,
              shotNumber: sceneCounters[sceneNum],
              project_id: newProject.id,
              status: 'PENDING',
              updatedAt: new Date(Date.now() + idx).toISOString()
            }
          })
          await shotsService.bulkAddShots(newShotsData)
        }
      }
      onClose()
    } catch (err) {
      console.error(err)
      alert('Gagal menyimpan detail tambahan proyek (shots). Proyek utama berhasil dibuat.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <motion.div
        className="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="modal"
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          onClick={e => e.stopPropagation()}
        >
          <div className="modal__header">
            <h2 className="modal__title">
              {isEdit ? 'Edit Proyek' : '✨ Proyek Baru'}
            </h2>
            <button className="modal__close" onClick={onClose}>
              <X size={16} />
            </button>
          </div>

          <div className="modal__content">
            <form id="project-form" onSubmit={handleSubmit} className="project-form">

              {/* Magic Auto-Fill */}
              <div className="form-group" style={{ background: 'var(--bg-surface)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showMagic ? '12px' : '0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-primary)', fontWeight: 'bold' }}>
                    <Wand2 size={16} /> Magic Auto-Fill
                  </div>
                  <button type="button" onClick={() => setShowMagic(!showMagic)} style={{ fontSize: '12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-card)', padding: '4px 10px', borderRadius: '4px', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 'bold' }}>
                    {showMagic ? 'Batal' : 'Coba Sekarang'}
                  </button>
                </div>
                <AnimatePresence>
                  {showMagic && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', lineHeight: '1.4' }}>
                        Paste (Ctrl+V) seluruh teks dari dokumen Kertas Kerja Anda di bawah ini. Sistem akan otomatis mengisi formulir dan mengekstrak daftar shot.
                      </p>
                      <textarea
                        value={magicText}
                        onChange={(e) => setMagicText(e.target.value)}
                        placeholder="Paste dokumen di sini..."
                        style={{ width: '100%', height: '140px', background: 'var(--bg-elevated)', border: '1px solid var(--border-card)', borderRadius: '6px', padding: '10px', color: 'var(--text-primary)', fontSize: '13px', resize: 'vertical' }}
                      />
                      <button type="button" onClick={handleMagicFill} className="btn-primary" style={{ width: '100%', marginTop: '10px', padding: '8px' }}>
                        Terapkan Magic Fill
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Nama Proyek *</label>
                  <input
                    type="text"
                    placeholder="Project W — Americano"
                    value={form.name}
                    onChange={e => update('name', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Klien *</label>
                  <input
                    type="text"
                    placeholder="Project W"
                    value={form.client}
                    onChange={e => update('client', e.target.value)}
                    required
                  />
                </div>
              </div>

          <div className="form-group">
            <label className="form-label">Deadline</label>
            <input
              type="date"
              value={form.deadline}
              onChange={e => update('deadline', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tanggal Shooting</label>
            <input
              type="date"
              value={form.shootDate}
              onChange={e => update('shootDate', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Jam Shooting</label>
            <input
              type="time"
              value={form.shootTime}
              onChange={e => update('shootTime', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Lokasi / Alamat Shooting</label>
            <textarea
              rows={2}
              placeholder="Contoh: Studio 1, Jl. Sudirman No. 42"
              value={form.shootLocation}
              onChange={e => update('shootLocation', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Spesifikasi Ukuran/Format</label>
            <input
              type="text"
              placeholder="Contoh: Portrait 9:16 (1080 x 1920) untuk Reels"
              value={form.formatSpec}
              onChange={e => update('formatSpec', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Target Audience / Tujuan</label>
            <textarea
              rows={3}
              placeholder="1. Product familiarity&#10;2. USP produk..."
              value={form.targetAudience}
              onChange={e => update('targetAudience', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Konsep / Ide Konten</label>
            <textarea
              rows={4}
              placeholder="Tema, lokasi, properti, alur video..."
              value={form.concept}
              onChange={e => update('concept', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Panduan Gaya (Catatan)</label>
            <textarea
              rows={2}
              placeholder="untuk referensi angle ajaa"
              value={form.styleGuideNotes}
              onChange={e => update('styleGuideNotes', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Foto Referensi (URL / Upload)</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input
                type="url"
                placeholder="https://contoh.com/moodboard.jpg"
                value={newImage}
                onChange={e => setNewImage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addImage())}
              />
              <button type="button" className="btn-secondary" style={{ width: 'auto', padding: '10px 14px', flexShrink: 0 }} onClick={addImage}>
                <Plus size={16} />
              </button>
              <label className="btn-secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 'auto', padding: '10px 14px', flexShrink: 0, cursor: 'pointer', margin: 0 }}>
                <Upload size={16} />
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, false)} />
              </label>
            </div>
            {form.styleGuideImages.map((image, i) => (
              <div key={image} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--accent-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {image}
                </span>
                <button type="button" className="btn-ghost" style={{ padding: '4px 6px' }} onClick={() => update('styleGuideImages', form.styleGuideImages.filter((_, idx) => idx !== i))}>
                  <Trash2 size={13} color="var(--status-revisi)" />
                </button>
              </div>
            ))}
          </div>

          <div className="form-group">
            <label className="form-label">Link Referensi / Upload Video</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input
                type="url"
                placeholder="https://tiktok.com/..."
                value={newLink}
                onChange={e => setNewLink(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addLink())}
              />
              <button type="button" className="btn-secondary" style={{ width: 'auto', padding: '10px 14px', flexShrink: 0 }} onClick={addLink}>
                <Plus size={16} />
              </button>
              <label className="btn-secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 'auto', padding: '10px 14px', flexShrink: 0, cursor: 'pointer', margin: 0 }}>
                <Upload size={16} />
                <input type="file" accept="video/*" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, true)} />
              </label>
            </div>
            {form.styleGuideLinks.map((link, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--accent-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {link}
                </span>
                <button type="button" className="btn-ghost" style={{ padding: '4px 6px' }} onClick={() => removeLink(i)}>
                  <Trash2 size={13} color="var(--status-revisi)" />
                </button>
              </div>
            ))}
          </div>

          <div className="divider" />

          {!isEdit && (
            <div className="form-group" style={{ background: 'var(--bg-elevated)', padding: '16px', borderRadius: '12px', border: '1px dashed var(--border-subtle)' }}>
              <label className="form-label">Import Shot List (Opsional)</label>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                Anda bisa meng-import dokumen Google Docs (.docx) / Excel (.xlsx) atau melakukan Copy-Paste secara langsung, sehingga saat Proyek dibuat, daftar *Shot* akan otomatis terisi!
              </p>
              
              {importShots.length > 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'rgba(63, 207, 142, 0.1)', border: '1px solid var(--status-done)', borderRadius: '8px', color: 'var(--status-done)', fontSize: '14px', fontWeight: 'bold' }}>
                  <CheckCircle size={18} />
                  {importShots.length} Shot siap di-import!
                  <button type="button" className="btn-ghost" style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} onClick={() => setImportShots([])}>Batal</button>
                </div>
              ) : (
                <button type="button" className="btn-secondary" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }} onClick={() => setShowImportModal(true)}>
                  <FileDown size={16} /> Import File / Copy Paste
                </button>
              )}
            </div>
          )}

          <div className="divider" />

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <div className="spinner" /> : (isEdit ? '💾 Simpan Perubahan' : '🚀 Buat Proyek')}
          </button>
        </form>
        </div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {showImportModal && (
          <ImportModal
            onClose={() => setShowImportModal(false)}
            onImport={async (shots) => {
              setImportShots(shots)
            }}
          />
        )}
      </AnimatePresence>
    </>
  )
}

function isValidHttpUrl(value) {
  try {
    const url = new URL(value.trim())
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}
