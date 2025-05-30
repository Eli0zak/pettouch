import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import { Button } from './button';
import { LoadingSpinner } from './loading-spinner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './dialog';
import { Label } from './label';
import { Input } from './input';
import { Textarea } from './textarea';
import { Badge } from './badge';
import { uploadMultiplePetImages, setPetImageAsPrimary, deletePetImage } from '@/lib/upload-helper';
import { Trash2, Check, Star, ImagePlus, X, Edit } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface PetImage {
  id: string;
  pet_id: string;
  image_url: string;
  is_primary: boolean;
  caption: string | null;
  created_at: string;
}

interface PetImageGalleryProps {
  petId: string;
  onImageChange?: () => void;
  editable?: boolean;
}

export function PetImageGallery({ petId, onImageChange, editable = true }: PetImageGalleryProps) {
  const [images, setImages] = useState<PetImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<PetImage | null>(null);
  const [caption, setCaption] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    fetchImages();
  }, [petId]);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pet_images')
        .select('*')
        .eq('pet_id', petId)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setImages(data || []);
      
      // Set active image to primary image if available
      const primaryIndex = data?.findIndex(img => img.is_primary) || 0;
      setActiveImageIndex(primaryIndex >= 0 ? primaryIndex : 0);
    } catch (error: any) {
      console.error('Error fetching pet images:', error);
      toast({
        title: "Error",
        description: "Failed to load pet images",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(filesArray);
      
      // Create preview URLs
      const newPreviewUrls = filesArray.map(file => URL.createObjectURL(file));
      setPreviewUrls(newPreviewUrls);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    setUploading(true);
    try {
      await uploadMultiplePetImages(selectedFiles, petId, images.length === 0);
      setIsAddDialogOpen(false);
      setSelectedFiles([]);
      setPreviewUrls([]);
      fetchImages();
      if (onImageChange) onImageChange();
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleSetPrimary = async (image: PetImage) => {
    if (image.is_primary) return;
    
    try {
      await setPetImageAsPrimary(image.id, petId);
      fetchImages();
      if (onImageChange) onImageChange();
    } catch (error) {
      console.error('Error setting primary image:', error);
    }
  };

  const handleDeleteImage = async () => {
    if (!selectedImage) return;
    
    try {
      await deletePetImage(selectedImage.id, selectedImage.image_url);
      setIsDeleteDialogOpen(false);
      fetchImages();
      if (onImageChange) onImageChange();
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const handleEditImage = async () => {
    if (!selectedImage) return;
    
    try {
      const { error } = await supabase
        .from('pet_images')
        .update({ caption })
        .eq('id', selectedImage.id);
      
      if (error) throw error;
      
      setIsEditDialogOpen(false);
      fetchImages();
      toast({
        title: "Success",
        description: "Image caption updated successfully",
      });
    } catch (error: any) {
      console.error('Error updating caption:', error);
      toast({
        title: "Error",
        description: "Failed to update image caption",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (image: PetImage) => {
    setSelectedImage(image);
    setCaption(image.caption || '');
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (image: PetImage) => {
    setSelectedImage(image);
    setIsDeleteDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <LoadingSpinner size="md" text={t("petImageGallery.loading")} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main display area */}
      <div className="relative rounded-lg overflow-hidden bg-muted/20">
        {images.length > 0 ? (
          <>
            <div className="relative aspect-square w-full">
              <img 
                src={images[activeImageIndex]?.image_url} 
                alt={images[activeImageIndex]?.caption || "Pet image"} 
                className="w-full h-full object-cover"
              />
              {images[activeImageIndex]?.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-sm">
                  {images[activeImageIndex]?.caption}
                </div>
              )}
            </div>
            
            {/* Image thumbnails */}
            {images.length > 1 && (
              <div className="flex overflow-x-auto gap-2 p-2 bg-muted/10">
                {images.map((image, index) => (
                  <div 
                    key={image.id}
                    className={`relative cursor-pointer flex-shrink-0 ${index === activeImageIndex ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setActiveImageIndex(index)}
                  >
                    <img 
                      src={image.image_url} 
                      alt={image.caption || "Thumbnail"} 
                      className="w-16 h-16 object-cover rounded"
                    />
                    {image.is_primary && (
                      <Badge className="absolute top-0 right-0 bg-amber-500 text-white">
                        <Star className="h-3 w-3" />
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 bg-muted/20 rounded-lg">
            <ImagePlus className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">{t("petImageGallery.noImages")}</p>
          </div>
        )}
      </div>

      {/* Action buttons */}
      {editable && (
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <ImagePlus className="h-4 w-4 mr-2" /> {t("petImageGallery.addImages")}
          </Button>
          
          {images.length > 0 && activeImageIndex !== -1 && (
            <>
              {!images[activeImageIndex].is_primary && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleSetPrimary(images[activeImageIndex])}
                >
                  <Star className="h-4 w-4 mr-2" /> {t("petImageGallery.setPrimary")}
                </Button>
              )}
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => openEditDialog(images[activeImageIndex])}
              >
                <Edit className="h-4 w-4 mr-2" /> {t("petImageGallery.editCaption")}
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                className="text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={() => openDeleteDialog(images[activeImageIndex])}
              >
                <Trash2 className="h-4 w-4 mr-2" /> {t("petImageGallery.delete")}
              </Button>
            </>
          )}
        </div>
      )}

      {/* Add Images Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("petImageGallery.addDialog.title")}</DialogTitle>
            <DialogDescription>
              {t("petImageGallery.addDialog.description")}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="pet-images">{t("petImageGallery.addDialog.selectImages")}</Label>
              <Input 
                id="pet-images" 
                type="file" 
                accept="image/*" 
                multiple 
                onChange={handleFileChange} 
                className="mt-2"
              />
            </div>
            
            {previewUrls.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <img 
                      src={url} 
                      alt={`Preview ${index + 1}`} 
                      className="w-full h-24 object-cover rounded"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={() => {
                        setPreviewUrls(prev => prev.filter((_, i) => i !== index));
                        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              {t("petImageGallery.addDialog.cancel")}
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={uploading || selectedFiles.length === 0}
            >
              {uploading ? <LoadingSpinner size="sm" className="mr-2" /> : <ImagePlus className="h-4 w-4 mr-2" />}
              {t("petImageGallery.addDialog.upload")} {selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Caption Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("petImageGallery.editDialog.title")}</DialogTitle>
            <DialogDescription>
              {t("petImageGallery.editDialog.description")}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="mb-4">
              <img 
                src={selectedImage?.image_url} 
                alt="Selected image" 
                className="w-full h-48 object-cover rounded"
              />
            </div>
            
            <div>
              <Label htmlFor="caption">{t("petImageGallery.editDialog.caption")}</Label>
              <Textarea
                id="caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder={t("petImageGallery.editDialog.caption")}
                className="mt-2"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {t("petImageGallery.editDialog.cancel")}
            </Button>
            <Button onClick={handleEditImage}>
              <Check className="h-4 w-4 mr-2" /> {t("petImageGallery.editDialog.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("petImageGallery.deleteDialog.title")}</DialogTitle>
            <DialogDescription>
              {t("petImageGallery.deleteDialog.description")}
              {selectedImage?.is_primary && (
                <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md">
                  <span className="font-semibold text-amber-700">{t("warning")}:</span> {t("petImageGallery.deleteDialog.primaryWarning")}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="mb-4">
            <img 
              src={selectedImage?.image_url} 
              alt="Image to delete" 
              className="w-full h-48 object-cover rounded"
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              {t("petImageGallery.deleteDialog.cancel")}
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteImage}
            >
              <Trash2 className="h-4 w-4 mr-2" /> {t("petImageGallery.deleteDialog.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 