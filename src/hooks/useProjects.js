import { useLocalStorage } from './useLocalStorage'
import { SAMPLE_PROJECTS } from '../data/sampleData'
import { v4 as uuidv4 } from '../utils/uuid'

export function useProjects() {
  const [projects, setProjects] = useLocalStorage('projects', SAMPLE_PROJECTS)

  const createProject = (projectData) => {
    const newProject = {
      id: uuidv4(),
      ...projectData,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'active',
      shots: []
    }
    setProjects(prev => [newProject, ...prev])
    return newProject
  }

  const updateProject = (projectId, updates) => {
    setProjects(prev =>
      prev.map(p => p.id === projectId ? { ...p, ...updates } : p)
    )
  }

  const deleteProject = (projectId) => {
    setProjects(prev => prev.filter(p => p.id !== projectId))
  }

  const archiveProject = (projectId) => {
    updateProject(projectId, { status: 'archived' })
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
    getProject
  }
}
