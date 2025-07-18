import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from 'uuid';

// Function to compress image before upload
export async function compressImage(file: File, maxSizeInMB = 1): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions while maintaining aspect ratio
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        
        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round(height * (MAX_WIDTH / width));
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round(width * (MAX_HEIGHT / height));
            height = MAX_HEIGHT;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Start with high quality
        let quality = 0.9;
        let compressedFile: File;
        
        // Convert to blob and check size
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }
            
            compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            
            // If still too large, compress more
            if (compressedFile.size > maxSizeInMB * 1024 * 1024 && quality > 0.5) {
              quality -= 0.1;
              canvas.toBlob(
                (blob) => {
                  if (!blob) {
                    reject(new Error('Failed to compress image'));
                    return;
                  }
                  compressedFile = new File([blob], file.name, {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                  });
                  resolve(compressedFile);
                },
                'image/jpeg',
                quality
              );
            } else {
              resolve(compressedFile);
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => {
        reject(new Error('Failed to load image for compression'));
      };
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file for compression'));
    };
  });
}

export async function uploadPetImage(file: File, petId: string) {
  try {
    // Validate inputs
    if (!(file instanceof File)) {
      throw new Error('Invalid file input');
    }
    if (!petId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(petId)) {
      throw new Error('Invalid petId');
    }

    // Compress image before upload
    const compressedFile = await compressImage(file);
    console.log(`Original size: ${(file.size / 1024 / 1024).toFixed(2)}MB, Compressed: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
    
    const fileExt = 'jpg';
    const fileName = `${petId}-${uuidv4()}.${fileExt}`;
    const filePath = `pets/${fileName}`;

    console.log("Starting image upload for pet:", petId, "path:", filePath);

    // Upload the file to storage
    const { error: uploadError } = await supabase.storage
      .from('pet-images')
      .upload(filePath, compressedFile, {
        cacheControl: '3600',
        upsert: false,
        contentType: 'image/jpeg'
      });

    if (uploadError) {
      console.error("Upload error:", uploadError.message);
      toast({
        title: "Upload failed",
        description: `Error: ${uploadError.message}`,
        variant: "destructive"
      });
      throw uploadError;
    }

    console.log("Upload successful, getting public URL");

    // Get the public URL
    const { data } = await supabase.storage
      .from('pet-images')
      .getPublicUrl(filePath);

    if (!data?.publicUrl) {
      console.error("Failed to get public URL");
      toast({
        title: "Image processing failed",
        description: "Could not generate a public URL for your image.",
        variant: "destructive"
      });
      throw new Error('Failed to get public URL for uploaded image');
    }

    console.log("Public URL obtained:", data.publicUrl);

    // Update the pet's profile_image_url in the database
    const { error: updateError } = await supabase
      .from('pets')
      .update({ profile_image_url: data.publicUrl })
      .eq('id', petId);

    if (updateError) {
      console.error("Database update error:", updateError.message);
      // Try to delete the uploaded file
      await supabase.storage
        .from('pet-images')
        .remove([filePath]);
      
      toast({
        title: "Update failed",
        description: "Your image was uploaded but we couldn't update your pet's profile. Please try again.",
        variant: "destructive"
      });
      throw updateError;
    }

    console.log("Successfully uploaded image and updated pet:", data.publicUrl);
    
    toast({
      title: "Image uploaded",
      description: "Your pet's image has been successfully updated."
    });
    
    return data.publicUrl;
  } catch (error: any) {
    console.error('Error uploading image:', error.message);
    toast({
      title: "Upload error",
      description: `Error: ${error.message}`,
      variant: "destructive"
    });
    throw error;
  }
}

export async function uploadLostFoundImage(file: File, postId: string) {
  try {
    // Validate inputs
    if (!(file instanceof File)) {
      throw new Error('Invalid file input');
    }
    if (!postId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(postId)) {
      throw new Error('Invalid postId');
    }

    // Compress image before upload
    const compressedFile = await compressImage(file);
    console.log(`Original size: ${(file.size / 1024 / 1024).toFixed(2)}MB, Compressed: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
    
    const fileExt = 'jpg';
    const fileName = `${postId}-${uuidv4()}.${fileExt}`;
    const filePath = `lost-found/${fileName}`; // Fixed path

    console.log("Starting lost/found image upload for post:", postId, "path:", filePath);

    // Upload the file to storage
    const { error: uploadError } = await supabase.storage
      .from('lost-found')
      .upload(filePath, compressedFile, {
        cacheControl: '3600',
        upsert: false,
        contentType: 'image/jpeg'
      });

    if (uploadError) {
      console.error("Upload error:", uploadError.message);
      toast({
        title: "Upload failed",
        description: `Error: ${uploadError.message}`,
        variant: "destructive"
      });
      throw uploadError;
    }

    // Get the public URL
    const { data } = await supabase.storage
      .from('lost-found')
      .getPublicUrl(filePath);

    if (!data?.publicUrl) {
      console.error("Failed to get public URL");
      toast({
        title: "Image processing failed",
        description: "Could not generate a public URL for your image.",
        variant: "destructive"
      });
      throw new Error('Failed to get public URL for uploaded image');
    }

    // Note: Database update is handled in ReportFormModal.tsx
    toast({
      title: "Image uploaded",
      description: "Your report image has been successfully uploaded."
    });

    return data.publicUrl;
  } catch (error: any) {
    console.error('Error uploading image:', error.message);
    toast({
      title: "Upload error",
      description: `Error: ${error.message}`,
      variant: "destructive"
    });
    throw error;
  }
}

export async function setPetImageAsPrimary(imageId: string, petId: string) {
  try {
    if (!imageId || !petId) {
      throw new Error('Invalid imageId or petId');
    }
    const { error } = await supabase
      .from('pet_images')
      .update({ is_primary: true })
      .eq('id', imageId)
      .eq('pet_id', petId);
    
    if (error) {
      console.error("Supabase error:", error.message);
      throw error;
    }
    
    return true;
  } catch (error: any) {
    console.error('Error setting primary image:', error.message);
    toast({
      title: "Update failed",
      description: `Error: ${error.message}`,
      variant: "destructive"
    });
    throw error;
  }
}

export async function deletePetImage(imageId: string, imageUrl: string) {
  try {
    if (!imageId || !imageUrl) {
      throw new Error('Invalid imageId or imageUrl');
    }

    // Delete from database first
    const { error: deleteError } = await supabase
      .from('pet_images')
      .delete()
      .eq('id', imageId);
    
    if (deleteError) {
      console.error("Supabase delete error:", deleteError.message);
      throw deleteError;
    }
    
    // Try to delete from storage
    try {
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.indexOf('pets') + 1];
      
      await supabase.storage
        .from('pet-images')
        .remove([`pets/${fileName}`]);
    } catch (storageError: any) {
      console.error('Error deleting image from storage:', storageError.message);
      // Continue even if storage deletion fails
    }
    
    toast({
      title: "Image deleted",
      description: "Image has been successfully deleted."
    });
    
    return true;
  } catch (error: any) {
    console.error('Error deleting image:', error.message);
    toast({
      title: "Delete failed",
      description: `Error: ${error.message}`,
      variant: "destructive"
    });
    throw error;
  }
}

// New function to upload multiple pet images
export async function uploadMultiplePetImages(files: File[], petId: string, isFirstImage: boolean) {
  try {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const publicUrl = await uploadPetImage(file, petId);
      // If this is the first image and the first file, set it as primary
      if (isFirstImage && i === 0) {
        // Find the image record by publicUrl and set as primary
        const { data, error } = await supabase
          .from('pet_images')
          .select('id')
          .eq('image_url', publicUrl)
          .single();
        if (error) {
          console.error('Error fetching uploaded image record:', error);
          continue;
        }
        await setPetImageAsPrimary(data.id, petId);
      }
    }
  } catch (error: any) {
    console.error('Error uploading multiple pet images:', error);
    toast({
      title: "Upload error",
      description: `Error: ${error.message}`,
      variant: "destructive"
    });
    throw error;
  }
}
