import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { cn } from '@/lib/utils';

interface PetFormProps {
  initialData?: {
    id?: string;
    name: string;
    type: string;
    breed: string;
    birthday: string;
    image_url: string | null;
  };
  onSuccess?: () => void;
}

const petTypes = [
  'Dog',
  'Cat',
  'Bird',
  'Fish',
  'Rabbit',
  'Hamster',
  'Guinea Pig',
  'Other'
];

const PetForm: React.FC<PetFormProps> = ({ initialData, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    type: initialData?.type || '',
    breed: initialData?.breed || '',
    birthday: initialData?.birthday || '',
  });
  const [imageUrl, setImageUrl] = useState<string | null>(initialData?.image_url || null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File too large",
        description: "Image must be less than 5MB",
        variant: "destructive"
      });
      return;
    }

    setImageFile(file);
    const imageUrl = URL.createObjectURL(file);
    setImageUrl(imageUrl);
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `pet-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('pets')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('pets')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalImageUrl = imageUrl;

      // Upload new image if selected
      if (imageFile) {
        setImageLoading(true);
        finalImageUrl = await uploadImage(imageFile);
        setImageLoading(false);
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const petData = {
        ...formData,
        image_url: finalImageUrl,
        owner_id: user.id,
      };

      if (initialData?.id) {
        // Update existing pet
        const { error } = await supabase
          .from('pets')
          .update(petData)
          .eq('id', initialData.id);

        if (error) throw error;

        toast({
          title: "Pet updated",
          description: "Your pet's information has been updated successfully."
        });
      } else {
        // Create new pet
        const { error } = await supabase
          .from('pets')
          .insert([petData]);

        if (error) throw error;

        toast({
          title: "Pet added",
          description: "Your new pet has been added successfully."
        });
      }

      onSuccess?.();
      navigate('/pets');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Image Upload */}
      <div className="space-y-2">
        <Label>Pet Photo</Label>
        <div className="relative">
          <div 
            className={cn(
              "w-full aspect-square rounded-lg overflow-hidden bg-gray-100",
              "flex items-center justify-center",
              "border-2 border-dashed border-gray-300",
              "hover:border-pet-primary transition-colors",
              "cursor-pointer"
            )}
            onClick={() => fileInputRef.current?.click()}
          >
            {imageLoading ? (
              <LoadingSpinner />
            ) : imageUrl ? (
              <>
                <img
                  src={imageUrl}
                  alt="Pet preview"
                  className="w-full h-full object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    setImageUrl(null);
                    setImageFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <div className="text-center p-4">
                <Camera className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-500">
                  Click to upload a photo of your pet
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  PNG, JPG up to 5MB
                </p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
        </div>
      </div>

      {/* Pet Details */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Pet Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="h-12"
            required
            maxLength={50}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Pet Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value })}
            required
          >
            <SelectTrigger id="type" className="h-12">
              <SelectValue placeholder="Select pet type" />
            </SelectTrigger>
            <SelectContent>
              {petTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="breed">Breed (Optional)</Label>
          <Input
            id="breed"
            value={formData.breed}
            onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
            className="h-12"
            maxLength={50}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="birthday">Birthday (Optional)</Label>
          <Input
            id="birthday"
            type="date"
            value={formData.birthday}
            onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
            className="h-12"
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <Button
          type="submit"
          className="w-full h-12 bg-pet-primary hover:bg-pet-secondary"
          disabled={loading || imageLoading}
        >
          {loading ? (
            <LoadingSpinner className="mr-2" />
          ) : (
            initialData ? 'Update Pet' : 'Add Pet'
          )}
        </Button>
      </div>
    </motion.form>
  );
};

export default PetForm;
