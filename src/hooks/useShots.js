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
              const newArr = [...prev, payload.new]
              return newArr.sort((a, b) => {
                if (a.scene !== b.scene) return a.scene - b.scene
                if ((a.shotNumber || 1) !== (b.shotNumber || 1)) return (a.shotNumber || 1) - (b.shotNumber || 1)
                return new Date(a.updatedAt || 0) - new Date(b.updatedAt || 0)
              })
            })
          } else if (payload.eventType === 'UPDATE') {
            setShots(prev => {
              const mapped = prev.map(s => s.id === payload.new.id ? payload.new : s)
              return mapped.sort((a, b) => {
                if (a.scene !== b.scene) return a.scene - b.scene
                if ((a.shotNumber || 1) !== (b.shotNumber || 1)) return (a.shotNumber || 1) - (b.shotNumber || 1)
                return a.id > b.id ? 1 : -1
              })
            })
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
      // Jika shotData.scene ada, berarti user menambahkan shot ke scene yang sudah ada
      const targetScene = shotData.scene || (Math.max(0, ...shots.map(shot => shot.scene || 0)) + 1)
      const existingShotsInScene = shots.filter(s => s.scene === targetScene)
      const nextShotNumber = Math.max(0, ...existingShotsInScene.map(s => s.shotNumber || 1)) + (existingShotsInScene.length > 0 ? 1 : 0) || 1

      const newShotData = {
        project_id: projectId,
        scene: targetScene,
        shotNumber: nextShotNumber,
        sceneLabel: shotData.sceneLabel || `Scene ${targetScene}`,
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
        const newArr = [...prev, newShot]
        return newArr.sort((a, b) => {
          if (a.scene !== b.scene) return a.scene - b.scene
          if ((a.shotNumber || 1) !== (b.shotNumber || 1)) return (a.shotNumber || 1) - (b.shotNumber || 1)
          return a.id > b.id ? 1 : -1
        })
      })
      return newShot
    } catch (err) {
      console.error(err)
    }
  }

  const bulkAddShots = async (shotsArray) => {
    try {
      const nextScene = Math.max(0, ...shots.map(shot => shot.scene || 0)) + 1
      let currentScene = nextScene
      
      const sceneCounters = {}

      const newShotsData = shotsArray.map((shot, index) => {
        const sceneNum = shot.scene ? Number(shot.scene) : (currentScene + index)
        if (!sceneCounters[sceneNum]) {
          // Find max existing shotNumber for this scene if any
          const existingInScene = shots.filter(s => s.scene === sceneNum)
          sceneCounters[sceneNum] = Math.max(0, ...existingInScene.map(s => s.shotNumber || 1))
        }
        sceneCounters[sceneNum] += 1

        return {
          project_id: projectId,
          scene: sceneNum,
          shotNumber: sceneCounters[sceneNum],
          sceneLabel: shot.sceneLabel || `Scene ${sceneNum}`,
          shotType: shot.shotType || '',
          angle: shot.angle || '',
          equipment: shot.equipment || [],
          briefAction: shot.briefAction || '',
          dialog: shot.dialog || '',
          referenceImages: [],
          referenceLinks: [],
          status: 'PENDING',
          notes: '',
          updatedAt: new Date(Date.now() + index).toISOString(), // Ensure order
          ...shot
        }
      })
      
      await shotsService.bulkAddShots(newShotsData)
      await fetchShots() // Refresh to get DB IDs and real order
    } catch (err) {
      console.error(err)
    }
  }

  const updateShot = async (shotId, updates) => {
    try {
      // Optimistic update for UI feel
      setShots(prev => {
        const mapped = prev.map(s => s.id === shotId ? { ...s, ...updates } : s)
        return mapped.sort((a, b) => {
          if (a.scene !== b.scene) return a.scene - b.scene
          if ((a.shotNumber || 1) !== (b.shotNumber || 1)) return (a.shotNumber || 1) - (b.shotNumber || 1)
          return a.id > b.id ? 1 : -1
        })
      })
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

  const moveShot = async (shotId, direction) => {
    const sorted = [...shots].sort((a, b) => {
      if (a.scene !== b.scene) return a.scene - b.scene
      if ((a.shotNumber || 1) !== (b.shotNumber || 1)) return (a.shotNumber || 1) - (b.shotNumber || 1)
      return a.id > b.id ? 1 : -1
    })
    const idx = sorted.findIndex(s => s.id === shotId)
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= sorted.length) return

    const a = sorted[idx]
    const b = sorted[swapIdx]
    const tempScene = a.scene
    
    // Fix: If shotNumbers are the same (or missing), assign them explicit sequential numbers so swap actually works
    let aShotNum = a.shotNumber || 1
    let bShotNum = b.shotNumber || 1
    if (aShotNum === bShotNum) {
      aShotNum = idx + 1
      bShotNum = swapIdx + 1
    }

    const tempShotNumber = aShotNum

    // Optimistic update
    setShots(prev => {
      return prev.map(s => {
        if (s.id === a.id) return { ...s, scene: b.scene, shotNumber: bShotNum }
        if (s.id === b.id) return { ...s, scene: tempScene, shotNumber: tempShotNumber }
        return s
      }).sort((x, y) => {
        if (x.scene !== y.scene) return x.scene - y.scene
        if ((x.shotNumber || 1) !== (y.shotNumber || 1)) return (x.shotNumber || 1) - (y.shotNumber || 1)
        return x.id > y.id ? 1 : -1
      })
    })

    try {
      // Update A
      await shotsService.updateShot(a.id, { 
        scene: b.scene, 
        shotNumber: bShotNum
      })
      // Update B
      await shotsService.updateShot(b.id, { 
        scene: tempScene, 
        shotNumber: tempShotNumber
      })
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
    bulkAddShots,
    updateShot,
    deleteShot,
    moveShot,
    setStatus,
    addNote,
    loading,
    error
  }
}
