import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Plus, Trash2 } from 'lucide-react'

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
    styleGuideLinks: editProject?.styleGuide?.links || []
  })
  const [newLink, setNewLink] = useState('')
  const [newImage, setNewImage] = useState('')
  const [loading, setLoading] = useState(false)

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

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

  const handleSubmit = (e) => {
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
        links: form.styleGuideLinks
      }
    }

    setTimeout(() => {
      if (isEdit) {
        onUpdate(editProject.id, projectData)
      } else {
        onCreate(projectData)
      }
      setLoading(false)
      onClose()
    }, 300)
  }

  return (
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

        <form onSubmit={handleSubmit}>
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
            <label className="form-label">Foto Referensi (URL)</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input
                type="url"
                placeholder="https://contoh.com/moodboard.jpg"
                value={newImage}
                onChange={e => setNewImage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addImage())}
              />
              <button type="button" className="btn-secondary" style={{ width: 'auto', padding: '10px 14px' }} onClick={addImage}>
                <Plus size={16} />
              </button>
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
            <label className="form-label">Link Referensi</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input
                type="url"
                placeholder="https://tiktok.com/..."
                value={newLink}
                onChange={e => setNewLink(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addLink())}
              />
              <button type="button" className="btn-secondary" style={{ width: 'auto', padding: '10px 14px' }} onClick={addLink}>
                <Plus size={16} />
              </button>
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

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <div className="spinner" /> : (isEdit ? '💾 Simpan Perubahan' : '🚀 Buat Proyek')}
          </button>
        </form>
      </motion.div>
    </motion.div>
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
