import { supabase } from './supabaseClient'

export const projectsService = {
  async getAllProjects() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('createdAt', { ascending: false })
    
    if (error) {
      console.error('Error fetching projects:', error)
      throw error
    }
    return data || []
  },

  async createProject(projectData) {
    const newProject = {
      ...projectData,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'active'
    }
    
    const { data, error } = await supabase
      .from('projects')
      .insert([newProject])
      .select()
      .single()
      
    if (error) {
      console.error('Error creating project:', error)
      throw error
    }
    return data
  },

  async updateProject(id, updates) {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
      
    if (error) {
      console.error('Error updating project:', error)
      throw error
    }
    return data
  },

  async deleteProject(id) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
      
    if (error) {
      console.error('Error deleting project:', error)
      throw error
    }
  }
}
