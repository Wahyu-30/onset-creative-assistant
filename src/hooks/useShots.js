import { useState, useEffect } from 'react'
import { shotsService } from '../services/shotsService'
import { supabase } from '../services/supabaseClient'

export function useShots(projectId) {
  const [shots, setShots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!projectId) return

    fetchShots()

    const channel = supabase
      .channel(`public:shots:project_id=eq.${projectId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'shots', filter: `project_id=eq.${projectId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setShots(prev => {
              // avoid duplicate if we inserted it locally
              if (prev.find(s => s.id === payload.new.id)) return prev;
              return [...prev, payload.new].sort((a, b) => a.scene - b.scene)
            })
          } else if (payload.eventType === 'UPDATE') {
            setShots(prev => prev.map(s => s.id === payload.new.id ? payload.new : s))
          } else if (payload.eventType === 'DELETE') {
            setShots(prev => prev.filter(s => s.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [projectId])

  const fetchShots = async () => {
    try {
      setLoading(true)
      const data = await shotsService.getShotsByProject(projectId)
      setShots(data)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  const addShot = async (shotData) => {
    try {
      const nextScene = Math.max(0, ...shots.map(shot => shot.scene || 0)) + 1
      const newShotData = {
        project_id: projectId,
        scene: nextScene,
        sceneLabel: `Scene ${nextScene}`,
        shotType: '',
        angle: '',
        equipment: [],
        briefAction: '',
        dialog: '',
        referenceImages: [],
        referenceLinks: [],
        status: 'PENDING',
        notes: '',
        updatedAt: new Date().toISOString(),
        ...shotData
      }
      
      const newShot = await shotsService.addShot(newShotData)
      setShots(prev => {
        if (prev.find(s => s.id === newShot.id)) return prev;
        return [...prev, newShot]
      })
      return newShot
    } catch (err) {
      console.error(err)
    }
  }

  const updateShot = async (shotId, updates) => {
    try {
      // Optimistic update for UI feel
      setShots(prev => prev.map(s => s.id === shotId ? { ...s, ...updates } : s))
      await shotsService.updateShot(shotId, updates)
    } catch (err) {
      console.error(err)
      fetchShots() // rollback on error
    }
  }

  const deleteShot = async (shotId) => {
    try {
      setShots(prev => prev.filter(s => s.id !== shotId))
      await shotsService.deleteShot(shotId)
    } catch (err) {
      console.error(err)
      fetchShots() // rollback on error
    }
  }

  const setStatus = (shotId, status) => {
    updateShot(shotId, { status })
  }

  const addNote = (shotId, notes) => {
    updateShot(shotId, { notes })
  }

  // Geser shot ke atas atau bawah (swap scene number)
  const moveShot = async (shotId, direction) => {
    const sorted = [...shots].sort((a, b) => a.scene - b.scene)
    const idx = sorted.findIndex(s => s.id === shotId)
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= sorted.length) return

    const a = sorted[idx]
    const b = sorted[swapIdx]
    const tempScene = a.scene

    // Optimistic update
    setShots(prev => prev.map(s => {
      if (s.id === a.id) return { ...s, scene: b.scene }
      if (s.id === b.id) return { ...s, scene: tempScene }
      return s
    }))

    try {
      await Promise.all([
        shotsService.reorderShot(a.id, b.scene),
        shotsService.reorderShot(b.id, tempScene)
      ])
    } catch (err) {
      console.error(err)
      fetchShots()
    }
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
    moveShot,
    setStatus,
    addNote,
    loading,
    error
  }
}
