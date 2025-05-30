
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product, ProductCategory, Store } from '@/types/product';
import { useToast } from '@/components/ui/use-toast';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch products with filters
  const fetchProducts = useCallback(async (searchTerm = '', categoryFilter: string | null = null, storeFilter: string | null = null) => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('store_products')
        .select('*')
        .order('created_at', { ascending: false });

      if (categoryFilter) {
        query = query.eq('category_id', categoryFilter);
      }
      
      if (storeFilter) {
        query = query.eq('store_id', storeFilter);
      }
      
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Transform the data to match our Product interface
      const transformedProducts: Product[] = data.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        price: item.price,
        sale_price: item.sale_price,
        stock: item.stock,
        sku: item.sku,
        category_id: item.category_id,
        store_id: item.store_id,
        images: item.images as string[] || [],
        thumbnail: item.thumbnail as string,
        tags: item.tags as string[] || [],
        featured: item.featured,
        is_new: item.is_new,
        is_bestseller: item.is_bestseller,
        is_active: item.is_active !== false, // Default to true if not specified
        attributes: item.attributes as Record<string, string | number | string[]> || {},
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
      
      setProducts(transformedProducts);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      setError(error.message || 'Failed to load products');
      toast({
        title: "Error",
        description: "Failed to load products data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('store_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      const transformedCategories: ProductCategory[] = data.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        slug: item.slug,
        parent_id: item.parent_id,
        image: item.image,
        featured: item.featured
      }));
      
      setCategories(transformedCategories);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Fetch stores
  const fetchStores = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('store_stores')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      
      const transformedStores: Store[] = data.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        logo_url: item.logo_url,
        banner_url: item.banner_url,
        website: item.website,
        email: item.email,
        phone: item.phone,
        address: item.address,
        is_active: item.is_active,
        owner_id: item.owner_id,
        social_media: item.social_media ? 
          JSON.parse(JSON.stringify(item.social_media)) : 
          { facebook: '', instagram: '', twitter: '' }
      }));
      
      setStores(transformedStores);
    } catch (error: any) {
      console.error('Error fetching stores:', error);
      toast({
        title: "Error",
        description: "Failed to load stores",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Save product (create or update)
  const saveProduct = async (productData: Partial<Product>, isEditing: boolean): Promise<boolean> => {
    try {
      if (isEditing && productData.id) {
        // Update existing product
        const { error } = await supabase
          .from('store_products')
          .update({
            name: productData.name,
            description: productData.description,
            price: productData.price,
            sale_price: productData.sale_price,
            stock: productData.stock,
            sku: productData.sku,
            category_id: productData.category_id,
            store_id: productData.store_id || null,
            images: productData.images,
            thumbnail: productData.thumbnail,
            tags: productData.tags,
            featured: productData.featured,
            is_new: productData.is_new,
            is_bestseller: productData.is_bestseller,
            attributes: productData.attributes,
            updated_at: new Date().toISOString()
          })
          .eq('id', productData.id);

        if (error) throw error;

        toast({
          title: "Product Updated",
          description: "Product has been updated successfully"
        });
      } else {
        // Create new product
        const { error } = await supabase
          .from('store_products')
          .insert({
            name: productData.name,
            description: productData.description,
            price: productData.price,
            sale_price: productData.sale_price,
            stock: productData.stock,
            sku: productData.sku,
            category_id: productData.category_id,
            store_id: productData.store_id || null,
            images: productData.images || [],
            thumbnail: productData.thumbnail || '',
            tags: productData.tags || [],
            featured: productData.featured || false,
            is_new: productData.is_new || false,
            is_bestseller: productData.is_bestseller || false,
            attributes: productData.attributes || {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) throw error;

        toast({
          title: "Product Created",
          description: "Product has been created successfully"
        });
      }
      
      // Refresh products list
      await fetchProducts();
      return true;
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: `Failed to save product: ${error.message}`,
        variant: "destructive"
      });
      return false;
    }
  };

  // Delete product
  const deleteProduct = async (productId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('store_products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      // Update local state
      setProducts(products.filter(product => product.id !== productId));

      toast({
        title: "Product Deleted",
        description: "Product has been deleted successfully"
      });
      return true;
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: `Failed to delete product: ${error.message}`,
        variant: "destructive"
      });
      return false;
    }
  };

  // Toggle featured status
  const toggleFeatured = async (productId: string, featured: boolean): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('store_products')
        .update({ featured: !featured })
        .eq('id', productId);

      if (error) throw error;

      // Update local state
      setProducts(products.map(product => 
        product.id === productId ? { ...product, featured: !featured } : product
      ));

      toast({
        title: featured ? "Removed from Featured" : "Added to Featured",
        description: `Product has been ${featured ? 'removed from' : 'added to'} featured products`
      });
      return true;
    } catch (error: any) {
      console.error('Error updating featured status:', error);
      toast({
        title: "Error",
        description: `Failed to update featured status: ${error.message}`,
        variant: "destructive"
      });
      return false;
    }
  };

  // Initial data loading
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchProducts(), fetchCategories(), fetchStores()]);
    };
    
    loadData();
  }, [fetchProducts, fetchCategories, fetchStores]);

  return {
    products,
    categories,
    stores,
    loading,
    error,
    fetchProducts,
    fetchCategories,
    fetchStores,
    saveProduct,
    deleteProduct,
    toggleFeatured
  };
};
