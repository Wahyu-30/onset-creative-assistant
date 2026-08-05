import { supabase } from './supabaseClient'

export const storageService = {
  // Upload file to Supabase Storage
  // Returns public URL if successful
  async uploadFile(file, folderPath) {
    if (!file) return null;

    // Generate unique filename using timestamp
    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
    const filePath = `${folderPath}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('references')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading file:', error);
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('references')
      .getPublicUrl(filePath);

    return publicUrl;
  }
}
