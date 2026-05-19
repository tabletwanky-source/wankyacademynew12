import { supabase } from '../lib/supabase';

export const uploadImage = async (file: File, path: string): Promise<string> => {
  const { error } = await supabase.storage.from('uploads').upload(path, file, { upsert: true });
  if (error) throw error;

  const { data } = supabase.storage.from('uploads').getPublicUrl(path);
  return data.publicUrl;
};

export const validateImageUrl = (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
};
