import { v4 as uuidv4 } from '../utils/uuid'

export function useShots(projectId, project, updateProject) {
  const shots = project?.shots || []

  const updateShots = (newShots) => {
    updateProject(projectId, { shots: newShots })
  }

  const addShot = (shotData) => {
    const newShot = {
      id: uuidv4(),
      scene: Math.max(0, ...shots.map(shot => shot.scene || 0)) + 1,
      sceneLabel: `Scene ${Math.max(0, ...shots.map(shot => shot.scene || 0)) + 1}`,
      shotType: '',
      angle: '',
      equipment: [],
      briefAction: '',
      dialog: '',
      referenceImages: [],
      referenceLinks: [],
      status: 'PENDING',
      notes: '',
      updatedAt: null,
      ...shotData
    }
    updateShots([...shots, newShot])
    return newShot
  }

  const updateShot = (shotId, updates) => {
    const newShots = shots.map(s =>
      s.id === shotId
        ? { ...s, ...updates, updatedAt: new Date().toISOString() }
        : s
    )
    updateShots(newShots)
  }

  const deleteShot = (shotId) => {
    updateShots(shots.filter(s => s.id !== shotId))
  }

  const setStatus = (shotId, status) => {
    updateShot(shotId, { status })
  }

  const addNote = (shotId, notes) => {
    updateShot(shotId, { notes })
  }

  // Progress calculation
  const totalShots = shots.length
  const doneShots = shots.filter(s => s.status === 'TAKE_DONE').length
  const pendingShots = shots.filter(s => s.status === 'PENDING').length
  const revisiShots = shots.filter(s => s.status === 'REVISI').length
  const progressPercent = totalShots > 0 ? Math.round((doneShots / totalShots) * 100) : 0

  // Get unique scenes
  const scenes = [...new Set(shots.map(s => s.scene))].sort((a, b) => a - b)

  return {
    shots,
    totalShots,
    doneShots,
    pendingShots,
    revisiShots,
    progressPercent,
    scenes,
    addShot,
    updateShot,
    deleteShot,
    setStatus,
    addNote
  }
}
