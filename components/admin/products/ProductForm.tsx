import React, { useState, useEffect } from 'react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import { X, Plus, ImagePlus, Trash2, MoreHorizontal } from 'lucide-react';
import { Product, ProductCategory, Store, ProductFormData } from '@/types/product';
import { useForm } from 'react-hook-form';
import { useImageUpload } from '@/hooks/useImageUpload';
import { cn } from '@/lib/utils';

interface ProductFormProps {
  product?: Product;
  categories: ProductCategory[];
  stores: Store[];
  onSave: (data: ProductFormData) => Promise<boolean>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

const ProductForm: React.FC<ProductFormProps> = ({
  product,
  categories,
  stores,
  onSave,
  onCancel,
  isSubmitting = false,
}) => {
  const [formTab, setFormTab] = useState('basic');
  const [previewImages, setPreviewImages] = useState<string[]>(product?.images || []);
  const [previewThumbnail, setPreviewThumbnail] = useState<string | null>(product?.thumbnail || null);
  const [productTags, setProductTags] = useState<string[]>(product?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  
  const { uploading, uploadImage, uploadMultipleImages } = useImageUpload();
  
  const form = useForm<ProductFormData>({
    defaultValues: {
      id: product?.id,
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price || 0,
      sale_price: product?.sale_price || null,
      stock: product?.stock || 0,
      sku: product?.sku || '',
      category_id: product?.category_id || '',
      store_id: product?.store_id || undefined,
      images: product?.images || [],
      thumbnail: product?.thumbnail || '',
      tags: product?.tags || [],
      is_active: product?.is_active !== false, // Default to true if not specified
      featured: product?.featured || false,
      is_new: product?.is_new || false,
      is_bestseller: product?.is_bestseller || false,
      attributes: product?.attributes || {},
    },
  });
  
  // Update form when product changes
  useEffect(() => {
    if (product) {
      form.reset({
        id: product.id,
        name: product.name,
        description: product.description || '',
        price: product.price,
        sale_price: product.sale_price || null,
        stock: product.stock,
        sku: product.sku || '',
        category_id: product.category_id,
        store_id: product.store_id || undefined,
        images: product.images || [],
        thumbnail: product.thumbnail || '',
        tags: product.tags || [],
        is_active: product.is_active !== false,
        featured: product.featured || false,
        is_new: product.is_new || false,
        is_bestseller: product.is_bestseller || false,
        attributes: product.attributes || {},
      });
      setPreviewImages(product.images || []);
      setPreviewThumbnail(product.thumbnail || null);
      setProductTags(product.tags || []);
    }
  }, [product, form]);
  
  // Handle image uploads
  const handleImageUpload = async (files: FileList) => {
    if (files.length === 0) return;
    
    setIsProcessingImages(true);
    
    try {
      const uploadedUrls = await uploadMultipleImages(files);
      if (uploadedUrls.length > 0) {
        const newImages = [...previewImages, ...uploadedUrls];
        setPreviewImages(newImages);
        form.setValue('images', newImages);
        
        // If no thumbnail is set, use the first image as thumbnail
        if (!previewThumbnail) {
          setPreviewThumbnail(uploadedUrls[0]);
          form.setValue('thumbnail', uploadedUrls[0]);
        }
      }
    } finally {
      setIsProcessingImages(false);
    }
  };
  
  // Handle thumbnail upload
  const handleThumbnailUpload = async (files: FileList) => {
    if (files.length === 0) return;
    
    const url = await uploadImage(files[0]);
    if (url) {
      setPreviewThumbnail(url);
      form.setValue('thumbnail', url);
    }
  };
  
  // Remove image
  const removeImage = (indexToRemove: number) => {
    const newImages = previewImages.filter((_, index) => index !== indexToRemove);
    setPreviewImages(newImages);
    form.setValue('images', newImages);
    
    // If the removed image was the thumbnail, clear the thumbnail
    if (previewThumbnail === previewImages[indexToRemove]) {
      const newThumbnail = newImages.length > 0 ? newImages[0] : '';
      setPreviewThumbnail(newThumbnail);
      form.setValue('thumbnail', newThumbnail);
    }
  };
  
  // Set image as thumbnail
  const setImageAsThumbnail = (index: number) => {
    const thumbnail = previewImages[index];
    setPreviewThumbnail(thumbnail);
    form.setValue('thumbnail', thumbnail);
  };
  
  // Handle tags
  const addTag = () => {
    if (newTag && !productTags.includes(newTag)) {
      const updatedTags = [...productTags, newTag];
      setProductTags(updatedTags);
      form.setValue('tags', updatedTags);
      setNewTag('');
    }
  };
  
  const removeTag = (tagToRemove: string) => {
    const updatedTags = productTags.filter(tag => tag !== tagToRemove);
    setProductTags(updatedTags);
    form.setValue('tags', updatedTags);
  };
  
  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };
  
  // Submit handler
  const onSubmit = async (data: ProductFormData) => {
    // Make sure tags are included and handle "none" value for store_id
    const productData = {
      ...data,
      tags: productTags,
      store_id: data.store_id === 'none' ? null : data.store_id,
    };
    
    const success = await onSave(productData);
    
    if (success) {
      // Reset form on successful save
      if (!product) {
        form.reset();
        setPreviewImages([]);
        setPreviewThumbnail(null);
        setProductTags([]);
        setNewTag('');
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs value={formTab} onValueChange={setFormTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="additional">Additional Details</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4">
            {/* Basic product information */}
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="name"
                rules={{ required: 'Product name is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter product name" />
                    </FormControl>
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
                        placeholder="Enter product description" 
                        className="min-h-[120px]" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category_id"
                  rules={{ required: 'Category is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {stores.length > 0 && (
                  <FormField
                    control={form.control}
                    name="store_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Store</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a store" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">No Store</SelectItem>
                            {stores.map((store) => (
                              <SelectItem key={store.id} value={store.id}>
                                {store.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  rules={{ 
                    required: 'Price is required',
                    min: { value: 0, message: 'Price must be positive' }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          step="0.01" 
                          {...field} 
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="sale_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sale Price</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          step="0.01" 
                          {...field} 
                          value={field.value ?? ''} 
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                        />
                      </FormControl>
                      <FormMessage />
                      {form.watch('price') > 0 && form.watch('sale_price') && form.watch('sale_price') > 0 && (
                        <FormDescription>
                          Discount: {(100 - ((form.watch('sale_price') / form.watch('price')) * 100)).toFixed(0)}%
                        </FormDescription>
                      )}
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="stock"
                  rules={{ min: { value: 0, message: 'Stock cannot be negative' }}}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Quantity</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          step="1" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Product SKU" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active</FormLabel>
                        <FormDescription>
                          Product will be visible to customers
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
                
                <FormField
                  control={form.control}
                  name="featured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Featured</FormLabel>
                        <FormDescription>
                          Product will be showcased in featured sections
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
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="images">
            {/* Product images */}
            <div className="space-y-6">
              {/* Thumbnail */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Product Thumbnail</h3>
                  {previewThumbnail && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setPreviewThumbnail(null);
                        form.setValue('thumbnail', '');
                      }}
                    >
                      <Trash2 size={16} className="mr-1" /> Remove
                    </Button>
                  )}
                </div>
                
                {previewThumbnail ? (
                  <div className="relative w-full max-w-[200px]">
                    <img 
                      src={previewThumbnail} 
                      alt="Thumbnail" 
                      className="w-full h-48 object-cover rounded-md border"
                    />
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full max-w-[200px] h-48 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <ImagePlus size={36} className="text-muted-foreground mb-2" />
                      <p className="mb-1 text-sm text-muted-foreground">Click to upload thumbnail</p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*" 
                      onChange={(e) => e.target.files && handleThumbnailUpload(e.target.files)} 
                      disabled={uploading}
                    />
                  </label>
                )}
              </div>
              
              {/* Product Images */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Product Images</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploading || isProcessingImages}
                  >
                    <label className="flex items-center cursor-pointer">
                      <Plus size={16} className="mr-1" />
                      <span>Add Images</span>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*" 
                        multiple 
                        onChange={(e) => e.target.files && handleImageUpload(e.target.files)} 
                        disabled={uploading || isProcessingImages}
                      />
                    </label>
                  </Button>
                </div>
                
                {isProcessingImages ? (
                  <div className="flex items-center justify-center h-40 border rounded-md bg-muted/30">
                    <div className="flex flex-col items-center gap-2">
                      <div className="animate-spin w-8 h-8 border-t-2 border-primary rounded-full"></div>
                      <p className="text-sm text-muted-foreground">Uploading images...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {previewImages.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {previewImages.map((image, index) => (
                          <Card key={index} className="overflow-hidden">
                            <div className="relative h-32">
                              <img 
                                src={image} 
                                alt={`Product ${index + 1}`} 
                                className={cn(
                                  "w-full h-full object-cover",
                                  previewThumbnail === image && "ring-2 ring-primary"
                                )}
                              />
                              {previewThumbnail === image && (
                                <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-xs py-0.5 px-1 rounded">
                                  Thumbnail
                                </span>
                              )}
                            </div>
                            <CardFooter className="p-1 flex justify-between">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal size={14} />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem onClick={() => setImageAsThumbnail(index)}>
                                    Set as thumbnail
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => removeImage(index)} className="text-destructive">
                                    Remove
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-md">
                        <ImagePlus size={36} className="text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">No product images added</p>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="mt-2"
                          disabled={uploading}
                        >
                          <label className="flex items-center cursor-pointer">
                            <Plus size={16} className="mr-1" />
                            <span>Add Images</span>
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*" 
                              multiple 
                              onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                              disabled={uploading}
                            />
                          </label>
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="additional">
            {/* Additional product details */}
            <div className="space-y-6">
              {/* Product Tags */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium">Product Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {productTags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="py-1 px-3">
                      {tag}
                      <button
                        type="button"
                        className="ml-2 focus:outline-none"
                        onClick={() => removeTag(tag)}
                      >
                        <X size={14} />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={handleTagKeyPress}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addTag}
                    disabled={!newTag}
                  >
                    Add
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Press Enter or comma to add a tag
                </p>
              </div>
              
              {/* Additional Flags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="is_new"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">New Product</FormLabel>
                        <FormDescription>
                          Mark this product as new
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
                
                <FormField
                  control={form.control}
                  name="is_bestseller"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Bestseller</FormLabel>
                        <FormDescription>
                          Mark this product as a bestseller
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
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Preview Card */}
        {(formTab === 'basic' || formTab === 'additional') && (
          <div className="mt-6 border rounded-md p-4">
            <h3 className="text-lg font-semibold mb-2">Preview</h3>
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-muted rounded-md overflow-hidden flex-shrink-0">
                {previewThumbnail ? (
                  <img src={previewThumbnail} alt="Product" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-muted">
                    <ImagePlus size={24} className="text-muted-foreground" />
                  </div>
                )}
              </div>
              
              <div className="flex-grow">
                <h3 className="font-medium">
                  {form.watch('name') || 'Product Name'}
                </h3>
                
                <div className="flex items-center gap-2 mt-1">
                  <p className={cn(
                    "font-medium",
                    form.watch('sale_price') && "text-sm text-muted-foreground line-through"
                  )}>
                    {formatPrice(form.watch('price') || 0)}
                  </p>
                  
                  {form.watch('sale_price') && (
                    <p className="font-medium text-primary">
                      {formatPrice(form.watch('sale_price'))}
                    </p>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-1 mt-2">
                  {form.watch('is_active') && <Badge variant="outline">Active</Badge>}
                  {form.watch('featured') && <Badge variant="default">Featured</Badge>}
                  {form.watch('is_new') && <Badge variant="outline" className="border-blue-500 text-blue-700">New</Badge>}
                  {form.watch('is_bestseller') && <Badge variant="outline" className="border-green-500 text-green-700">Bestseller</Badge>}
                  {form.watch('stock') <= 0 && <Badge variant="destructive">Out of Stock</Badge>}
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || uploading}>
            {product ? 'Update Product' : 'Create Product'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProductForm;
