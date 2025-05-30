
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  
  const uploadImage = async (file: File, bucket: string = 'product-images', folder: string = ''): Promise<string | null> => {
    if (!file) return null;
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder ? `${folder}/` : ''}${Math.random().toString(36).substring(2, 15)}-${Date.now()}.${fileExt}`;
    
    try {
      setUploading(true);
      
      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);
      
      return data.publicUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Could not upload image",
        variant: "destructive"
      });
      return null;
    } finally {
      setUploading(false);
    }
  };
  
  const uploadMultipleImages = async (files: FileList | File[], bucket: string = 'product-images', folder: string = ''): Promise<string[]> => {
    if (!files || files.length === 0) return [];
    
    setUploading(true);
    const urls: string[] = [];
    
    try {
      for (let i = 0; i < files.length; i++) {
        const url = await uploadImage(files[i], bucket, folder);
        if (url) urls.push(url);
      }
      
      return urls;
    } catch (error) {
      console.error('Error uploading multiple images:', error);
      return urls; // Return any successful uploads
    } finally {
      setUploading(false);
    }
  };
  
  const deleteImage = async (url: string, bucket: string = 'product-images'): Promise<boolean> => {
    try {
      // Extract file path from URL
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const fileName = pathParts[pathParts.length - 1];
      
      const { error } = await supabase.storage
        .from(bucket)
        .remove([fileName]);
      
      if (error) throw error;
      
      return true;
    } catch (error: any) {
      console.error('Error deleting image:', error);
      toast({
        title: "Delete Failed",
        description: error.message || "Could not delete image",
        variant: "destructive"
      });
      return false;
    }
  };
  
  return {
    uploading,
    uploadImage,
    uploadMultipleImages,
    deleteImage
  };
}
