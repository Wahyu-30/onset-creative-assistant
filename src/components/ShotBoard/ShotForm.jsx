import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Plus, Trash2, Upload } from 'lucide-react'
import { storageService } from '../../services/storageService'
import imageCompression from 'browser-image-compression'

const SHOT_TYPES = ['Wide Shot', 'Medium Shot', 'Medium Close Up', 'Close Up', 'Extreme Close Up', 'Half Body', 'Full Body', 'Flatlay / Product Shot', 'Over The Shoulder']
const ANGLES = ['Eye Level', 'Low Angle', 'High Angle', 'Top Down', 'Top Down / Flatlay', 'Side Angle', 'Dutch Angle', 'Panning Orbit']
const EQUIPMENT_OPTIONS = ['Gimbal', 'Tripod', 'Lighting A', 'Lighting B', 'Lighting C', 'Mic Wireless (Clip-on)', 'Macro Lens', 'Reflector', 'Diffuser', 'Slider']

export default function ShotForm({ shots, editShot, onAddShot, onUpdateShot, onClose }) {
  const isEdit = !!editShot
  const nextScene = Math.max(0, ...shots.map(shot => shot.scene || 0)) + 1

  const [form, setForm] = useState({
    scene: editShot?.scene || nextScene,
    sceneLabel: editShot?.sceneLabel || `Scene ${nextScene}`,
    shotType: editShot?.shotType || '',
    angle: editShot?.angle || '',
    equipment: editShot?.equipment || [],
    briefAction: editShot?.briefAction || '',
    dialog: editShot?.dialog || '',
    referenceImages: editShot?.referenceImages || [],
    referenceLinks: editShot?.referenceLinks || [],
  })
  const [newLink, setNewLink] = useState('')
  const [newImage, setNewImage] = useState('')
  const [newEquip, setNewEquip] = useState('')
  const [loading, setLoading] = useState(false)

  const update = (field, val) => setForm(p => ({ ...p, [field]: val }))

  const toggleEquip = (eq) => {
    const exists = form.equipment.includes(eq)
    update('equipment', exists ? form.equipment.filter(e => e !== eq) : [...form.equipment, eq])
  }

  const addLink = () => {
    if (isValidHttpUrl(newLink)) {
      update('referenceLinks', [...form.referenceLinks, newLink.trim()])
      setNewLink('')
    }
  }

  const addImage = () => {
    if (isValidHttpUrl(newImage)) {
      update('referenceImages', [...form.referenceImages, newImage.trim()])
      setNewImage('')
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    // Check if video (for size limit)
    const isVideo = file.type.startsWith('video/')
    const maxSize = isVideo ? 20 * 1024 * 1024 : 5 * 1024 * 1024
    
    if (file.size > maxSize) {
      alert(`Ukuran file terlalu besar! Maksimal ${isVideo ? '20MB (Video)' : '5MB (Foto)'}`)
      return
    }

    try {
      setLoading(true)
      let fileToUpload = file;
      
      if (!isVideo) {
        // Compress image to save Supabase quota (~200KB)
        const options = {
          maxSizeMB: 0.2,
          maxWidthOrHeight: 1080,
          useWebWorker: true
        }
        fileToUpload = await imageCompression(file, options)
      }

      const url = await storageService.uploadFile(fileToUpload, 'shots')
      if (isVideo) {
        update('referenceLinks', [...form.referenceLinks, url])
      } else {
        update('referenceImages', [...form.referenceImages, url])
      }
    } catch (err) {
      alert('Gagal mengupload file. Pastikan setelan Supabase Storage sudah benar.')
    } finally {
      setLoading(false)
      e.target.value = null // reset input
    }
  }

  const addCustomEquip = () => {
    if (newEquip.trim() && !form.equipment.includes(newEquip.trim())) {
      update('equipment', [...form.equipment, newEquip.trim()])
      setNewEquip('')
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.sceneLabel.trim()) return
    setLoading(true)
    setTimeout(() => {
      if (isEdit) {
        onUpdateShot(editShot.id, { ...form, scene: Number(form.scene) })
      } else {
        onAddShot({ ...form, scene: Number(form.scene) })
      }
      setLoading(false)
      onClose()
    }, 200)
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
        exit={{ opacity: 0, y: 40 }}
        onClick={e => e.stopPropagation()}
        style={{ maxHeight: '90vh' }}
      >
        <div className="modal__header">
          <h2 className="modal__title">{isEdit ? '✏️ Edit Shot' : '🎬 Shot Baru'}</h2>
          <button className="modal__close" onClick={onClose}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nomor Scene *</label>
            <input
              type="number"
              min="1"
              step="1"
              value={form.scene}
              onChange={e => update('scene', e.target.value)}
              required
            />
          </div>

          {/* Scene Label */}
          <div className="form-group">
            <label className="form-label">Label Scene *</label>
            <input
              type="text"
              value={form.sceneLabel}
              onChange={e => update('sceneLabel', e.target.value)}
              placeholder="Scene 1 / Hook / Punchline"
              required
            />
          </div>

          {/* Shot Type */}
          <div className="form-group">
            <label className="form-label">Jenis Shot</label>
            <div className="shot-form__chips">
              {SHOT_TYPES.map(t => (
                <button
                  key={t} type="button"
                  className={`shot-form__chip ${form.shotType === t ? 'active' : ''}`}
                  onClick={() => update('shotType', form.shotType === t ? '' : t)}
                >{t}</button>
              ))}
            </div>
          </div>

          {/* Angle */}
          <div className="form-group">
            <label className="form-label">Sudut Kamera</label>
            <div className="shot-form__chips">
              {ANGLES.map(a => (
                <button
                  key={a} type="button"
                  className={`shot-form__chip ${form.angle === a ? 'active' : ''}`}
                  onClick={() => update('angle', form.angle === a ? '' : a)}
                >{a}</button>
              ))}
            </div>
          </div>

          {/* Equipment */}
          <div className="form-group">
            <label className="form-label">Equipment</label>
            <div className="shot-form__chips" style={{ marginBottom: 8 }}>
              {EQUIPMENT_OPTIONS.map(eq => (
                <button
                  key={eq} type="button"
                  className={`shot-form__chip ${form.equipment.includes(eq) ? 'active' : ''}`}
                  onClick={() => toggleEquip(eq)}
                >{eq}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                placeholder="Tambah equipment lain..."
                value={newEquip}
                onChange={e => setNewEquip(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomEquip())}
              />
              <button type="button" className="btn-secondary" style={{ width: 'auto', padding: '10px 14px', flexShrink: 0 }} onClick={addCustomEquip}>
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Brief Action */}
          <div className="form-group">
            <label className="form-label">Brief Action</label>
            <textarea
              rows={2}
              placeholder="Deskripsi singkat gerakan kamera atau talent..."
              value={form.briefAction}
              onChange={e => update('briefAction', e.target.value)}
            />
          </div>

          {/* Dialog */}
          <div className="form-group">
            <label className="form-label">Dialog / Naskah</label>
            <p className="shot-form__hint">Gunakan {'<EKSPRESI KAGET>'} untuk instruksi aksi</p>
            <textarea
              rows={4}
              placeholder="come make your coffee with us!"
              value={form.dialog}
              onChange={e => update('dialog', e.target.value)}
            />
          </div>

          {/* Framing Reference Images */}
          <div className="form-group">
            <label className="form-label">Foto Referensi Framing (URL / Upload)</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input
                type="url"
                placeholder="https://contoh.com/framing.jpg"
                value={newImage}
                onChange={e => setNewImage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addImage())}
              />
              <button type="button" className="btn-secondary" style={{ width: 'auto', padding: '10px 14px', flexShrink: 0 }} onClick={addImage}>
                <Plus size={16} />
              </button>
              <label className="btn-secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 'auto', padding: '10px 14px', flexShrink: 0, cursor: 'pointer', margin: 0 }}>
                <Upload size={16} />
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} />
              </label>
            </div>
            {form.referenceImages.map((image, i) => (
              <div key={image} className="shot-form__link-row">
                <span className="shot-form__link-text">{image}</span>
                <button type="button" className="btn-ghost" style={{ padding: '4px 6px' }}
                  onClick={() => update('referenceImages', form.referenceImages.filter((_, idx) => idx !== i))}>
                  <Trash2 size={13} color="var(--status-revisi)" />
                </button>
              </div>
            ))}
          </div>

          {/* Reference Video Links */}
          <div className="form-group">
            <label className="form-label">Video Referensi (URL / Upload)</label>
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
                <input type="file" accept="video/*" style={{ display: 'none' }} onChange={handleFileUpload} />
              </label>
            </div>
            {form.referenceLinks.map((link, i) => (
              <div key={i} className="shot-form__link-row">
                <span className="shot-form__link-text">{link}</span>
                <button type="button" className="btn-ghost" style={{ padding: '4px 6px' }}
                  onClick={() => update('referenceLinks', form.referenceLinks.filter((_, idx) => idx !== i))}>
                  <Trash2 size={13} color="var(--status-revisi)" />
                </button>
              </div>
            ))}
          </div>

          <div className="divider" />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <div className="spinner" /> : (isEdit ? '💾 Simpan' : '➕ Tambah Shot')}
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
