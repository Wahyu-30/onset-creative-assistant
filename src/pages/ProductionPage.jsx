import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Plus, Edit2, X, Printer } from 'lucide-react'
import { useProjects } from '../hooks/useProjects'
import { useShots } from '../hooks/useShots'
import ProductionProgress from '../components/ProgressBar/ProductionProgress'
import ModeToggle from '../components/Navigation/ModeToggle'
import FilterBar from '../components/Navigation/FilterBar'
import ShotCard from '../components/ShotBoard/ShotCard'
import ScriptView from '../components/TalentView/ScriptView'
import ShotForm from '../components/ShotBoard/ShotForm'
import ProjectForm from '../components/ProjectManager/ProjectForm'
import ImageViewer from '../components/ImageViewer/ImageViewer'
import '../components/ShotBoard/ShotCard.css'
import '../components/ShotBoard/QuickLog.css'
import '../components/ShotBoard/ShotForm.css'
import '../components/Navigation/ModeToggle.css'
import '../components/ImageViewer/ImageViewer.css'
import './ProductionPage.css'

export default function ProductionPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { getProject, updateProject, loading: projectsLoading } = useProjects()
  const project = getProject(projectId)
  const { shots, totalShots, doneShots, pendingShots, revisiShots, progressPercent, scenes, addShot, updateShot, deleteShot, moveShot, setStatus, addNote, loading: shotsLoading } = useShots(projectId)

  const [mode, setMode] = useState('tech') // 'tech' | 'talent'
  const [activeScene, setActiveScene] = useState(null)
  const [activeStatus, setActiveStatus] = useState('ALL')
  const [showShotForm, setShowShotForm] = useState(false)
  const [editingShot, setEditingShot] = useState(null)
  const [showEditProject, setShowEditProject] = useState(false)
  const [showProjectInfo, setShowProjectInfo] = useState(false)
  const [viewerImg, setViewerImg] = useState(null)

  const openNewShotForm = () => {
    setEditingShot(null)
    setShowShotForm(true)
  }

  const openEditShotForm = (shot) => {
    setEditingShot(shot)
    setShowShotForm(true)
  }

  // Filtered shots
  const filteredShots = useMemo(() => {
    let result = shots
    if (activeScene !== null) result = result.filter(s => s.scene === activeScene)
    if (activeStatus !== 'ALL') result = result.filter(s => s.status === activeStatus)
    return result
  }, [shots, activeScene, activeStatus])

  if (projectsLoading || shotsLoading) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Memuat data proyek...</div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="empty-state">
          <div className="empty-state__icon">❌</div>
          <p className="empty-state__title">Proyek tidak ditemukan</p>
          <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/')}>Kembali</button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-wrapper prod-page">
      {/* ── Header ── */}
      <header className="prod-header glass">
        <div className="prod-header__left">
          <button className="prod-header__back" onClick={() => navigate('/')} aria-label="Kembali">
            <ArrowLeft size={20} />
          </button>
          <div className="prod-header__title-group" onClick={() => setShowProjectInfo(!showProjectInfo)}>
            <h1 className="prod-header__project-name">{project.name}</h1>
            <p className="prod-header__client">{project.client} · {project.deadline || '—'}</p>
          </div>
        </div>
        <div className="prod-header__right">
          <button className="prod-header__icon-btn" onClick={() => window.print()} aria-label="Print call sheet" title="Print Call Sheet">
            <Printer size={16} />
          </button>
          <button className="prod-header__icon-btn" onClick={() => setShowEditProject(true)} aria-label="Edit proyek">
            <Edit2 size={16} />
          </button>
          <button className="prod-header__icon-btn" onClick={openNewShotForm} aria-label="Tambah shot">
            <Plus size={18} />
          </button>
        </div>
      </header>

      {/* ── Project Info Dropdown ── */}
      <AnimatePresence>
        {showProjectInfo && (
          <motion.div
            className="prod-info-panel glass"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="prod-info-panel__inner">
              <button className="prod-info-panel__close" onClick={() => setShowProjectInfo(false)}>
                <X size={14} />
              </button>
              {project.targetAudience && (
                <div className="prod-info-section">
                  <p className="prod-info-label">🎯 Target Audience</p>
                  <p className="prod-info-text">{project.targetAudience}</p>
                </div>
              )}
              {project.concept && (
                <div className="prod-info-section">
                  <p className="prod-info-label">💡 Konsep</p>
                  <p className="prod-info-text">{project.concept}</p>
                </div>
              )}
              {project.styleGuide?.notes && (
                <div className="prod-info-section">
                  <p className="prod-info-label">🎨 Panduan Gaya</p>
                  <p className="prod-info-text">{project.styleGuide.notes}</p>
                </div>
              )}
              {project.styleGuide?.links?.length > 0 && (
                <div className="prod-info-section">
                  <p className="prod-info-label">🔗 Link Referensi</p>
                  {project.styleGuide.links.map((link, i) => (
                    <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="prod-info-link">
                      {link.length > 45 ? link.slice(0, 45) + '...' : link}
                    </a>
                  ))}
                </div>
              )}
              {project.styleGuide?.images?.length > 0 && (
                <div className="prod-info-section">
                  <p className="prod-info-label">🖼️ Foto Referensi</p>
                  <div className="prod-info-images">
                    {project.styleGuide.images.map((image, i) => (
                      <button key={image} className="prod-info-image" onClick={() => setViewerImg(image)}>
                        <img src={image} alt={`Referensi proyek ${i + 1}`} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Progress Bar ── */}
      <ProductionProgress
        total={totalShots}
        done={doneShots}
        pending={pendingShots}
        revisi={revisiShots}
        percent={progressPercent}
      />

      {/* ── Mode Toggle ── */}
      <div className="prod-mode-toggle-bar">
        <ModeToggle mode={mode} onToggle={setMode} />
      </div>

      {/* ── Main Content ── */}
      <div className="prod-content">
        <AnimatePresence mode="wait">
          {mode === 'tech' ? (
            <motion.div
              key="tech"
              className="prod-tech-view"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Filter Bar */}
              <FilterBar
                scenes={scenes}
                activeScene={activeScene}
                activeStatus={activeStatus}
                onSceneChange={setActiveScene}
                onStatusChange={setActiveStatus}
              />

              {/* Shot Cards */}
              <div className="prod-shot-list">
                <AnimatePresence>
                  {filteredShots.length === 0 ? (
                    <motion.div
                      className="empty-state"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className="empty-state__icon">🎬</div>
                      <p className="empty-state__title">
                        {shots.length === 0 ? 'Belum ada shot' : 'Tidak ada shot yang cocok'}
                      </p>
                      <p className="empty-state__desc">
                        {shots.length === 0
                          ? 'Tap tombol + untuk menambahkan shot pertama'
                          : 'Coba ubah filter scene atau status'}
                      </p>
                    </motion.div>
                  ) : (
                    filteredShots.map((shot, i) => (
                      <ShotCard
                        key={shot.id}
                        shot={shot}
                        index={i}
                        totalShots={filteredShots.length}
                        onStatusChange={setStatus}
                        onNoteChange={addNote}
                        onEdit={openEditShotForm}
                        onDelete={deleteShot}
                        onMoveUp={() => moveShot(shot.id, 'up')}
                        onMoveDown={() => moveShot(shot.id, 'down')}
                        isFirst={i === 0}
                        isLast={i === filteredShots.length - 1}
                      />
                    ))
                  )}
                </AnimatePresence>

                {/* Add Shot Button (bottom) */}
                {shots.length > 0 && (
                  <motion.button
                    className="prod-add-shot-btn"
                    onClick={openNewShotForm}
                    whileTap={{ scale: 0.96 }}
                  >
                    <Plus size={16} />
                    Tambah Shot Baru
                  </motion.button>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="talent"
              className="prod-talent-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Scene filter for talent too */}
              <div className="prod-talent-filter">
                <div className="filter-bar__scroll" style={{ padding: '8px 16px' }}>
                  <button
                    className={`filter-bar__scene-btn ${activeScene === null ? 'active' : ''}`}
                    onClick={() => setActiveScene(null)}
                  >All</button>
                  {scenes.map(sc => (
                    <button
                      key={sc}
                      className={`filter-bar__scene-btn ${activeScene === sc ? 'active' : ''}`}
                      onClick={() => setActiveScene(sc)}
                    >S{sc}</button>
                  ))}
                </div>
              </div>
              <ScriptView shots={shots} activeSceneFilter={activeScene} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {showShotForm && (
          <ShotForm
            shots={shots}
            editShot={editingShot}
            onAddShot={addShot}
            onUpdateShot={updateShot}
            onClose={() => { setShowShotForm(false); setEditingShot(null) }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEditProject && (
          <ProjectForm
            editProject={project}
            onUpdate={updateProject}
            onClose={() => setShowEditProject(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewerImg && <ImageViewer src={viewerImg} onClose={() => setViewerImg(null)} />}
      </AnimatePresence>
    </div>
  )
}
