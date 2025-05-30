import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";

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
    // Compress image before upload
    const compressedFile = await compressImage(file);
    console.log(`Original size: ${(file.size / 1024 / 1024).toFixed(2)}MB, Compressed: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
    
    const fileExt = 'jpg'; // Always use jpg for compressed images
    const fileName = `${petId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `pets/${fileName}`;

    console.log("Starting image upload for pet:", petId, "path:", filePath);

    // Upload the file to storage
    const { error: uploadError, data: uploadData } = await supabase.storage
      .from('pet-images')
      .upload(filePath, compressedFile, {
        cacheControl: '3600',
        upsert: false,
        contentType: 'image/jpeg'
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      toast({
        title: "Upload failed",
        description: "There was a problem uploading your image. Please try again.",
        variant: "destructive"
      });
      throw uploadError;
    }

    console.log("Upload successful, getting public URL");

    // Get the public URL using the proper method
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
      console.error("Database update error:", updateError);
      // If update fails, try to delete the uploaded file
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
      description: "Your pet's image has been successfully updated.",
    });
    
    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    toast({
      title: "Upload error",
      description: "An unexpected error occurred while uploading your image.",
      variant: "destructive"
    });
    throw error;
  }
}

// New function to upload multiple pet images
export async function uploadMultiplePetImages(files: File[], petId: string, setPrimaryImage: boolean = false) {
  try {
    const uploadedImages = [];
    let primaryImageUrl = null;
    
    // Get current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
      
    if (userError) throw userError;
    if (!userData || !userData.user) {
      throw new Error('User authentication required');
    }

    const userId = userData.user.id;
    
    // Process each file
    for (const file of files) {
      // Compress image before upload
      const compressedFile = await compressImage(file);
      
      const fileExt = 'jpg'; // Always use jpg for compressed images
      const fileName = `${petId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `pets/${fileName}`;
      
      // Upload the file to storage
      const { error: uploadError } = await supabase.storage
        .from('pet-images')
        .upload(filePath, compressedFile, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'image/jpeg'
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        continue;
      }
      
      // Get the public URL
      const { data } = await supabase.storage
        .from('pet-images')
        .getPublicUrl(filePath);

      if (!data?.publicUrl) {
        console.error("Failed to get public URL");
        continue;
      }
      
      // Determine if this should be the primary image
      const isPrimary = setPrimaryImage && uploadedImages.length === 0;
      
      // Store image in pet_images table
      const { data: imageData, error: insertError } = await supabase
        .from('pet_images')
        .insert({
          pet_id: petId,
          image_url: data.publicUrl,
          is_primary: isPrimary,
          user_id: userId,
          caption: file.name.split('.')[0] // Use filename as default caption
        })
        .select()
        .single();
      
      if (insertError) {
        console.error("Database insert error:", insertError);
        // If insert fails, try to delete the uploaded file
        await supabase.storage
          .from('pet-images')
          .remove([filePath]);
        continue;
      }
      
      uploadedImages.push(imageData);
      
      // If this is the primary image, save the URL
      if (isPrimary) {
        primaryImageUrl = data.publicUrl;
      }
    }
    
    // Show success message
    if (uploadedImages.length > 0) {
      toast({
        title: "Images uploaded",
        description: `Successfully uploaded ${uploadedImages.length} image${uploadedImages.length > 1 ? 's' : ''}.`,
      });
    } else {
      toast({
        title: "Upload failed",
        description: "No images were uploaded successfully.",
        variant: "destructive"
      });
    }
    
    return {
      images: uploadedImages,
      primaryImageUrl
    };
  } catch (error) {
    console.error('Error uploading images:', error);
    toast({
      title: "Upload error",
      description: "An unexpected error occurred while uploading your images.",
      variant: "destructive"
    });
    throw error;
  }
}

export async function uploadLostFoundImage(file: File, postId: string) {
  try {
    // Compress image before upload
    const compressedFile = await compressImage(file);
    console.log(`Original size: ${(file.size / 1024 / 1024).toFixed(2)}MB, Compressed: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
    
    const fileExt = 'jpg'; // Always use jpg for compressed images
    const fileName = `${postId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `lost-found/${fileName}`;

    console.log("Starting lost/found image upload for post:", postId, "path:", filePath);

    // Upload the file to storage
    const { error: uploadError } = await supabase.storage
      .from('pet-images')
      .upload(filePath, compressedFile, {
        cacheControl: '3600',
        upsert: false,
        contentType: 'image/jpeg'
      });

    if (uploadError) {
      // If error is because folder doesn't exist, create it and retry
      if (uploadError.message.includes('not found') || uploadError.message.toLowerCase().includes('does not exist')) {
        // Create folder by uploading a placeholder file
        await supabase.storage
          .from('pet-images')
          .upload('lost-found/.keep', new Blob([]));
        
        // Retry the original upload
        const { error: retryError } = await supabase.storage
          .from('pet-images')
          .upload(filePath, compressedFile, {
            cacheControl: '3600',
            upsert: false,
            contentType: 'image/jpeg'
          });
          
        if (retryError) {
          console.error("Upload retry error:", retryError);
          toast({
            title: "Upload failed",
            description: "There was a problem uploading your image. Please try again.",
            variant: "destructive"
          });
          throw retryError;
        }
      } else {
        console.error("Upload error:", uploadError);
        toast({
          title: "Upload failed",
          description: "There was a problem uploading your image. Please try again.",
          variant: "destructive"
        });
        throw uploadError;
      }
    }

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

    // Update the post's image_url in the database
    const { error: updateError } = await supabase
      .from('lost_found_posts')
      .update({ image_url: data.publicUrl })
      .eq('id', postId);

    if (updateError) {
      console.error("Database update error:", updateError);
      // If update fails, try to delete the uploaded file
      await supabase.storage
        .from('pet-images')
        .remove([filePath]);
      
      toast({
        title: "Update failed",
        description: "Your image was uploaded but we couldn't update your report. Please try again.",
        variant: "destructive"
      });
      throw updateError;
    }

    toast({
      title: "Image uploaded",
      description: "Your report image has been successfully added.",
    });

    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    toast({
      title: "Upload error",
      description: "An unexpected error occurred while uploading your image.",
      variant: "destructive"
    });
    throw error;
  }
}

// Function to set a pet image as primary
export async function setPetImageAsPrimary(imageId: string, petId: string) {
  try {
    const { error } = await supabase
      .from('pet_images')
      .update({ is_primary: true })
      .eq('id', imageId)
      .eq('pet_id', petId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error setting primary image:', error);
    toast({
      title: "Update failed",
      description: "Failed to set image as primary. Please try again.",
      variant: "destructive"
    });
    throw error;
  }
}

// Function to delete a pet image
export async function deletePetImage(imageId: string, imageUrl: string) {
  try {
    // Delete from database first
    const { error: deleteError } = await supabase
      .from('pet_images')
      .delete()
      .eq('id', imageId);
    
    if (deleteError) throw deleteError;
    
    // Try to delete from storage
    try {
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.indexOf('pets') + 1];
      
      await supabase.storage
        .from('pet-images')
        .remove([`pets/${fileName}`]);
    } catch (storageError) {
      console.error('Error deleting image from storage:', storageError);
      // Continue even if storage deletion fails
    }
    
    toast({
      title: "Image deleted",
      description: "Image has been successfully deleted.",
    });
    
    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    toast({
      title: "Delete failed",
      description: "Failed to delete image. Please try again.",
      variant: "destructive"
    });
    throw error;
  }
}
