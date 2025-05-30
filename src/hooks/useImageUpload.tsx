
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  // Upload a single image
  const uploadImage = async (file: File, folder = "product-images") => {
    if (!file) return null;
    
    try {
      setUploading(true);
      
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}-${Date.now()}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;
      
      // Upload the file to Supabase Storage
      const { data, error } = await supabase.storage
        .from(folder)
        .upload(fileName, file);
      
      if (error) {
        throw error;
      }
      
      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from(folder)
        .getPublicUrl(fileName);
      
      return publicUrlData.publicUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Error',
        description: `Failed to upload image: ${error.message}`,
        variant: "destructive"
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  // Upload multiple images and return array of URLs
  const uploadMultipleImages = async (files: FileList, folder = "product-images") => {
    if (files.length === 0) return [];
    
    try {
      setUploading(true);
      const uploadPromises = Array.from(files).map(file => uploadImage(file, folder));
      const results = await Promise.all(uploadPromises);
      
      // Filter out any null results (failed uploads)
      return results.filter(url => url !== null) as string[];
    } catch (error: any) {
      console.error('Error uploading multiple images:', error);
      toast({
        title: 'Error',
        description: `Failed to upload images: ${error.message}`,
        variant: "destructive"
      });
      return [];
    } finally {
      setUploading(false);
    }
  };

  // Delete an image
  const deleteImage = async (url: string, folder = "product-images") => {
    try {
      // Extract the file name from the URL
      const fileName = url.split('/').pop();
      if (!fileName) return false;
      
      const { error } = await supabase.storage
        .from(folder)
        .remove([fileName]);
      
      if (error) {
        throw error;
      }
      
      return true;
    } catch (error: any) {
      console.error('Error deleting image:', error);
      toast({
        title: 'Error',
        description: `Failed to delete image: ${error.message}`,
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    uploading,
    uploadImage,
    uploadMultipleImages,
    deleteImage,
  };
}
