import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Plus, Edit2, X, Printer, FileDown, FileText } from 'lucide-react'
import { useProjects } from '../hooks/useProjects'
import { useShots } from '../hooks/useShots'
import ProductionProgress from '../components/ProgressBar/ProductionProgress'
import ModeToggle from '../components/Navigation/ModeToggle'
import FilterBar from '../components/Navigation/FilterBar'
import ShotCard from '../components/ShotBoard/ShotCard'
import ScriptView from '../components/TalentView/ScriptView'
import ShotForm from '../components/ShotBoard/ShotForm'
import ProjectForm from '../components/ProjectManager/ProjectForm'
import KertasKerja from '../components/ProjectManager/KertasKerja'
import ImportModal from '../components/ShotBoard/ImportModal'
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
  const { shots, totalShots, doneShots, pendingShots, revisiShots, progressPercent, scenes, addShot, bulkAddShots, updateShot, deleteShot, moveShot, setStatus, addNote, loading: shotsLoading } = useShots(projectId)

  const [mode, setMode] = useState('tech') // 'tech' | 'talent'
  const [activeScene, setActiveScene] = useState(null)
  const [activeStatus, setActiveStatus] = useState('ALL')
  const [showShotForm, setShowShotForm] = useState(false)
  const [editingShot, setEditingShot] = useState(null)
  const [showEditProject, setShowEditProject] = useState(false)
  const [showProjectInfo, setShowProjectInfo] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [viewerImg, setViewerImg] = useState(null)

  const openNewShotForm = () => {
    setEditingShot(null)
    setShowShotForm(true)
  }

  const openEditShotForm = (shot) => {
    setEditingShot(shot)
    setShowShotForm(true)
  }

  const handleDownloadPDF = async () => {
    const html2pdf = (await import('html2pdf.js')).default;
    const element = document.querySelector('.prod-content');
    
    // Create a temporary wrapper to force print styles for PDF
    const opt = {
      margin:       10,
      filename:     `CallSheet_${project.name.replace(/\s+/g, '_')}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, windowWidth: 800 },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    // Temporarily add a class to body to simulate print styles
    document.body.classList.add('pdf-export-mode');
    
    try {
      await html2pdf().set(opt).from(element).save();
    } finally {
      document.body.classList.remove('pdf-export-mode');
      setShowExportMenu(false);
    }
  }

  const handleExportDocx = () => {
    document.body.classList.add('pdf-export-mode');
    
    setTimeout(() => {
      const element = document.querySelector('.prod-content');
      if (!element) return;
      
      const htmlContent = element.innerHTML;
      const docHtml = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'><title>Export to Docx</title></head>
        <body>${htmlContent}</body>
        </html>
      `;
      
      const blob = new Blob(['\ufeff', docHtml], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `KertasKerja_${project.name.replace(/\s+/g, '_')}.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      document.body.classList.remove('pdf-export-mode');
      setShowExportMenu(false);
    }, 100);
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
        <div className="prod-header-inner">
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
          <div style={{ position: 'relative' }}>
            <button className="prod-header__icon-btn" onClick={() => setShowExportMenu(!showExportMenu)} aria-label="Export Menu" title="Export">
              <Printer size={16} />
            </button>
            <AnimatePresence>
              {showExportMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '8px',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-card)',
                    borderRadius: '8px',
                    padding: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    zIndex: 100
                  }}
                >
                  <button onClick={handleDownloadPDF} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'transparent', color: 'var(--text-primary)', border: 'none', textAlign: 'left', borderRadius: '4px', cursor: 'pointer', whiteSpace: 'nowrap' }} className="hover-bg">
                    <FileText size={14} color="#E53935" /> Export PDF
                  </button>
                  <button onClick={handleExportDocx} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'transparent', color: 'var(--text-primary)', border: 'none', textAlign: 'left', borderRadius: '4px', cursor: 'pointer', whiteSpace: 'nowrap' }} className="hover-bg">
                    <FileText size={14} color="#2b579a" /> Export Word (.doc)
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button className="prod-header__icon-btn" onClick={() => setShowEditProject(true)} aria-label="Edit proyek">
            <Edit2 size={16} />
          </button>
          <button className="prod-header__icon-btn" onClick={openNewShotForm} aria-label="Tambah shot">
            <Plus size={18} />
          </button>
        </div>
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
        <div className="prod-mode-toggle-bar-inner">
          <ModeToggle mode={mode} onToggle={setMode} />
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="prod-content">
        <KertasKerja project={project} />
        
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
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <motion.button
                      className="prod-add-shot-btn"
                      onClick={openNewShotForm}
                      whileTap={{ scale: 0.96 }}
                      style={{ flex: 1, margin: 0 }}
                    >
                      <Plus size={16} />
                      Tambah Shot
                    </motion.button>
                    <motion.button
                      className="prod-add-shot-btn"
                      onClick={() => setShowImportModal(true)}
                      whileTap={{ scale: 0.96 }}
                      style={{ flex: 1, margin: 0, borderColor: 'var(--accent-secondary)', color: 'var(--accent-secondary)' }}
                    >
                      <FileDown size={16} />
                      Import dari Docs
                    </motion.button>
                  </div>
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
                <div className="prod-talent-filter-inner">
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
        {showEditProject && (
          <ProjectForm
            editProject={project}
            onUpdate={updateProject}
            onClose={() => setShowEditProject(false)}
          />
        )}
        {showImportModal && (
          <ImportModal
            onClose={() => setShowImportModal(false)}
            onImport={bulkAddShots}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewerImg && <ImageViewer src={viewerImg} onClose={() => setViewerImg(null)} />}
      </AnimatePresence>
    </div>
  )
}
