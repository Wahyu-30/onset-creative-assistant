import { supabase } from './supabaseClient'

export const shotsService = {
  async getShotsByProject(projectId) {
    const { data, error } = await supabase
      .from('shots')
      .select('*')
      .eq('project_id', projectId)
      .order('scene', { ascending: true })
      .order('shotNumber', { ascending: true })
      .order('id', { ascending: true })
    
    if (error) {
      console.error('Error fetching shots:', error)
      throw error
    }
    return data || []
  },

  async addShot(shotData) {
    const { data, error } = await supabase
      .from('shots')
      .insert([shotData])
      .select()
      .single()
      
    if (error) {
      console.error('Error adding shot:', error)
      throw error
    }
    return data
  },

  async bulkAddShots(shotsArray) {
    const { data, error } = await supabase
      .from('shots')
      .insert(shotsArray)
      .select()
      
    if (error) {
      console.error('Error bulk adding shots:', error)
      throw error
    }
    return data
  },

  async updateShot(id, updates) {
    const { data, error } = await supabase
      .from('shots')
      .update({ ...updates, updatedAt: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
      
    if (error) {
      console.error('Error updating shot:', error)
      throw error
    }
    return data
  },

  async deleteShot(id) {
    const { error } = await supabase
      .from('shots')
      .delete()
      .eq('id', id)
      
    if (error) {
      console.error('Error deleting shot:', error)
      throw error
    }
  },

  // Ambil statistik shot (ringan, tanpa konten penuh) untuk semua proyek
  async getAllShotStats() {
    const { data, error } = await supabase
      .from('shots')
      .select('project_id, status')

    if (error) {
      console.error('Error fetching shot stats:', error)
      return []
    }
    return data || []
  },

  // Reorder: update scene number, shotNumber, and updatedAt to swap perfectly
  async reorderShot(id, newScene, newUpdatedAt, newShotNumber) {
    const { error } = await supabase
      .from('shots')
      .update({ scene: newScene, updatedAt: newUpdatedAt, shotNumber: newShotNumber })
      .eq('id', id)
    if (error) throw error
  },

  // Digunakan untuk migrasi data awal
  async bulkInsertShots(shotsData) {
    const { error } = await supabase
      .from('shots')
      .insert(shotsData)
      
    if (error) {
      console.error('Error bulk inserting shots:', error)
      throw error
    }
  }
}
