import { useState, useEffect } from 'react'
import { projectsService } from '../services/projectsService'

export function useProjects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const data = await projectsService.getAllProjects()
      setProjects(data)
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
    loading,
    error
  }
}
