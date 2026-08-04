import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Archive, ChevronRight, Film, Calendar, Trash2 } from 'lucide-react'
import { useProjects } from '../hooks/useProjects'
import ProjectForm from '../components/ProjectManager/ProjectForm'
import './HomePage.css'

export default function HomePage() {
  const navigate = useNavigate()
  const { activeProjects, archivedProjects, createProject, deleteProject, archiveProject, loading: projectsLoading } = useProjects()
  const [showForm, setShowForm] = useState(false)
  const [showArchived, setShowArchived] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const handleOpen = (projectId) => {
    navigate(`/production/${projectId}`)
  }

  const handleDelete = (e, projectId) => {
    e.stopPropagation()
    if (deletingId === projectId) {
      deleteProject(projectId)
      setDeletingId(null)
    } else {
      setDeletingId(projectId)
      setTimeout(() => setDeletingId(null), 3000)
    }
  }

  const handleArchive = (e, projectId) => {
    e.stopPropagation()
    archiveProject(projectId)
  }

  return (
    <div className="page-wrapper home-page">
      {/* Header */}
      <header className="home-header">
        <div className="home-header__logo">
          <div className="home-header__icon">🎬</div>
          <div>
            <h1 className="home-header__title">On-Set</h1>
            <p className="home-header__subtitle">Creative Assistant</p>
          </div>
        </div>
        <motion.button
          className="home-header__add-btn"
          onClick={() => setShowForm(true)}
          whileTap={{ scale: 0.92 }}
        >
          <Plus size={20} />
        </motion.button>
      </header>

      <div className="home-content">
        {/* Active Projects */}
        <section className="home-section">
          <div className="home-section__header">
            <h2 className="home-section__title">Proyek Aktif</h2>
            <span className="home-section__count">{activeProjects.length}</span>
          </div>

          {projectsLoading ? (
            <div className="empty-state">
              <p className="empty-state__title">Memuat Proyek...</p>
            </div>
          ) : activeProjects.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon">📋</div>
              <p className="empty-state__title">Belum ada proyek</p>
              <p className="empty-state__desc">Tap tombol + untuk membuat proyek baru</p>
              <button 
                className="btn-primary" 
                style={{ marginTop: 16 }}
                onClick={async () => {
                  const { SAMPLE_PROJECTS } = await import('../data/sampleData')
                  const { shotsService } = await import('../services/shotsService')
                  const { supabase } = await import('../services/supabaseClient')
                  for (const proj of SAMPLE_PROJECTS) {
                    const { shots, ...projData } = proj
                    const newProj = await createProject(projData)
                    if (shots && shots.length > 0) {
                      const shotsToInsert = shots.map(s => ({
                        ...s,
                        project_id: newProj.id,
                        updatedAt: new Date().toISOString()
                      }))
                      await shotsService.bulkInsertShots(shotsToInsert)
                    }
                  }
                  window.location.reload()
                }}
              >
                Isi Data Sample
              </button>
            </div>
          ) : (
            <div className="project-list">
              <AnimatePresence>
                {activeProjects.map((project, i) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    index={i}
                    onOpen={handleOpen}
                    onDelete={handleDelete}
                    onArchive={handleArchive}
                    isDeleting={deletingId === project.id}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>

        {/* Archived Projects */}
        {archivedProjects.length > 0 && (
          <section className="home-section">
            <button
              className="home-section__header home-section__header--toggle"
              onClick={() => setShowArchived(!showArchived)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Archive size={14} color="var(--text-muted)" />
                <h2 className="home-section__title" style={{ color: 'var(--text-muted)' }}>Arsip</h2>
                <span className="home-section__count">{archivedProjects.length}</span>
              </div>
              <motion.div animate={{ rotate: showArchived ? 90 : 0 }}>
                <ChevronRight size={16} color="var(--text-muted)" />
              </motion.div>
            </button>

            <AnimatePresence>
              {showArchived && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="project-list"
                  style={{ overflow: 'hidden' }}
                >
                  {archivedProjects.map((project, i) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      index={i}
                      onOpen={handleOpen}
                      onDelete={handleDelete}
                      onArchive={handleArchive}
                      isDeleting={deletingId === project.id}
                      isArchived
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        )}
      </div>

      {/* New Project Form Modal */}
      <AnimatePresence>
        {showForm && (
          <ProjectForm onCreate={createProject} onClose={() => setShowForm(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}

function ProjectCard({ project, index, onOpen, onDelete, onArchive, isDeleting, isArchived }) {
  const shots = project.shots || []
  const doneCount = shots.filter(s => s.status === 'TAKE_DONE').length
  const totalCount = shots.length
  const progress = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ delay: index * 0.05 }}
      className={`project-card ${isArchived ? 'project-card--archived' : ''}`}
      onClick={() => onOpen(project.id)}
    >
      <div className="project-card__main">
        <div className="project-card__icon">
          <Film size={20} color="var(--accent-secondary)" />
        </div>
        <div className="project-card__info">
          <h3 className="project-card__name">{project.name}</h3>
          <p className="project-card__client">{project.client}</p>
          <div className="project-card__meta">
            <span className="project-card__date">
              <Calendar size={11} />
              {project.deadline}
            </span>
            <span className="project-card__shots">
              {doneCount}/{totalCount} shot
            </span>
          </div>
          {totalCount > 0 && (
            <div className="project-card__progress-bar">
              <motion.div
                className="project-card__progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                style={{
                  background: progress === 100
                    ? 'var(--status-done)'
                    : 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))'
                }}
              />
            </div>
          )}
        </div>
        <ChevronRight size={18} color="var(--text-muted)" className="project-card__arrow" />
      </div>

      {/* Actions */}
      <div className="project-card__actions" onClick={e => e.stopPropagation()}>
        {!isArchived && (
          <button
            className="project-card__action-btn"
            onClick={(e) => onArchive(e, project.id)}
            title="Arsipkan"
          >
            <Archive size={13} />
          </button>
        )}
        <button
          className={`project-card__action-btn project-card__action-btn--delete ${isDeleting ? 'project-card__action-btn--confirm' : ''}`}
          onClick={(e) => onDelete(e, project.id)}
          title={isDeleting ? 'Tap sekali lagi untuk konfirmasi hapus' : 'Hapus'}
        >
          <Trash2 size={13} />
          {isDeleting && <span>Konfirmasi?</span>}
        </button>
      </div>
    </motion.div>
  )
}
