
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { ProductCategory } from '@/types/product';
import { ImagePlus } from 'lucide-react';
import { useImageUpload } from '@/hooks/useImageUpload';

interface CategoryFormData {
  id?: string;
  name: string;
  description?: string;
  slug: string;
  parent_id?: string | null;
  image?: string | null;
  featured?: boolean;
}

interface CategoryFormProps {
  category?: ProductCategory;
  categories: ProductCategory[];
  onSave: (data: CategoryFormData) => Promise<boolean>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  category,
  categories,
  onSave,
  onCancel,
  isSubmitting = false,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(category?.image || null);
  const { uploading, uploadImage } = useImageUpload();

  const form = useForm<CategoryFormData>({
    defaultValues: {
      id: category?.id || undefined,
      name: category?.name || '',
      description: category?.description || '',
      slug: category?.slug || '',
      parent_id: category?.parent_id || null,
      image: category?.image || null,
      featured: category?.featured || false,
    }
  });

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // Handle name change to auto-generate slug
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    form.setValue('name', name);
    
    // Only auto-generate slug if the slug is empty or matches a previous auto-generated version
    if (!form.getValues('slug') || form.getValues('slug') === generateSlug(form.getValues('name'))) {
      form.setValue('slug', generateSlug(name));
    }
  };

  // Handle image upload
  const handleImageUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;
    
    const url = await uploadImage(files[0], 'category-images');
    if (url) {
      setImagePreview(url);
      form.setValue('image', url);
    }
  };

  // Handle form submission
  const onSubmit = async (data: CategoryFormData) => {
    const success = await onSave(data);
    
    if (success && !category) {
      // Reset form on successful creation
      form.reset({
        id: undefined,
        name: '',
        description: '',
        slug: '',
        parent_id: null,
        image: null,
        featured: false,
      });
      setImagePreview(null);
    }
  };

  // Filter out the current category from parent options to prevent circular references
  const parentOptions = categories.filter(cat => cat.id !== category?.id);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          rules={{ required: 'Category name is required' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category Name</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  onChange={handleNameChange}
                  placeholder="Enter category name"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          rules={{ required: 'Slug is required' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="category-slug"
                />
              </FormControl>
              <FormDescription>
                Used in URLs. Auto-generated from name but can be customized.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Enter category description" 
                  className="min-h-[100px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {parentOptions.length > 0 && (
          <FormField
            control={form.control}
            name="parent_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parent Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a parent category (optional)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">None (Top Level)</SelectItem>
                    {parentOptions.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Optionally nest this category under a parent category
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="space-y-2">
          <FormLabel>Category Image</FormLabel>
          <div className="flex items-center gap-4">
            {imagePreview ? (
              <div className="relative w-32 h-32">
                <img 
                  src={imagePreview} 
                  alt="Category" 
                  className="w-full h-full object-cover rounded-md border"
                />
              </div>
            ) : (
              <div className="w-32 h-32 border-2 border-dashed rounded-md flex items-center justify-center bg-muted">
                <ImagePlus className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            
            <Button 
              type="button" 
              variant="outline" 
              disabled={uploading}
            >
              <label className="cursor-pointer flex items-center">
                {imagePreview ? 'Change Image' : 'Upload Image'}
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                  disabled={uploading} 
                />
              </label>
            </Button>
          </div>
        </div>

        <FormField
          control={form.control}
          name="featured"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Featured Category</FormLabel>
                <FormDescription>
                  Featured categories are prominently displayed in the store
                </FormDescription>
              </div>
              <FormControl>
                <Switch 
                  checked={field.value} 
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || uploading}>
            {category ? 'Update Category' : 'Create Category'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CategoryForm;
