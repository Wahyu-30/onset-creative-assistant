import { supabase } from './supabaseClient'

export const shotsService = {
  async getShotsByProject(projectId) {
    const { data, error } = await supabase
      .from('shots')
      .select('*')
      .eq('project_id', projectId)
      .order('scene', { ascending: true })
    
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
