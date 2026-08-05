import { useState, useEffect } from 'react'
import { projectsService } from '../services/projectsService'
import { shotsService } from '../services/shotsService'

export function useProjects() {
  const [projects, setProjects] = useState([])
  const [shotStats, setShotStats] = useState({}) // { projectId: { total, done } }
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    try {
      setLoading(true)
      const [projectsData, statsData] = await Promise.all([
        projectsService.getAllProjects(),
        shotsService.getAllShotStats()
      ])
      setProjects(projectsData)

      // Hitung statistik per project
      const stats = {}
      statsData.forEach(s => {
        if (!stats[s.project_id]) stats[s.project_id] = { total: 0, done: 0 }
        stats[s.project_id].total++
        if (s.status === 'TAKE_DONE') stats[s.project_id].done++
      })
      setShotStats(stats)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  const createProject = async (projectData) => {
    try {
      const newProject = await projectsService.createProject(projectData)
      setProjects(prev => [newProject, ...prev])
      return newProject
    } catch (err) {
      console.error(err)
    }
  }

  const updateProject = async (projectId, updates) => {
    try {
      const updated = await projectsService.updateProject(projectId, updates)
      setProjects(prev =>
        prev.map(p => p.id === projectId ? { ...p, ...updated } : p)
      )
    } catch (err) {
      console.error(err)
    }
  }

  const deleteProject = async (projectId) => {
    try {
      await projectsService.deleteProject(projectId)
      setProjects(prev => prev.filter(p => p.id !== projectId))
    } catch (err) {
      console.error(err)
    }
  }

  const archiveProject = async (projectId) => {
    await updateProject(projectId, { status: 'archived' })
  }

  const getProject = (projectId) => {
    return projects.find(p => p.id === projectId)
  }

  const getProjectStats = (projectId) => {
    return shotStats[projectId] || { total: 0, done: 0 }
  }

  const activeProjects = projects.filter(p => p.status === 'active')
  const archivedProjects = projects.filter(p => p.status === 'archived')

  return {
    projects,
    activeProjects,
    archivedProjects,
    createProject,
    updateProject,
    deleteProject,
    archiveProject,
    getProject,
    getProjectStats,
    loading,
    error
  }
}
