
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";
import { Product, ProductCategory, Store, ProductStatus, ProductSortOption, ProductFormData } from '@/types/product';

interface UseProductManagementProps {
  initialLoad?: boolean;
}

interface ProductFilters {
  searchQuery: string;
  categoryId: string | null;
  storeId: string | null;
  status: ProductStatus;
  sortBy: ProductSortOption;
  priceRange: [number | null, number | null];
}

const DEFAULT_FILTERS: ProductFilters = {
  searchQuery: '',
  categoryId: null,
  storeId: null,
  status: 'all',
  sortBy: 'newest',
  priceRange: [null, null],
};

export function useProductManagement({ initialLoad = true }: UseProductManagementProps = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProductFilters>(DEFAULT_FILTERS);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const { toast } = useToast();

  // Function to fetch products with all filters
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('store_products')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters.searchQuery) {
        query = query.or(`name.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%,sku.ilike.%${filters.searchQuery}%`);
      }
      
      if (filters.categoryId) {
        query = query.eq('category_id', filters.categoryId);
      }
      
      if (filters.storeId) {
        query = query.eq('store_id', filters.storeId);
      }

      // Status filters
      switch (filters.status) {
        case 'active':
          query = query.eq('is_active', true);
          break;
        case 'inactive':
          query = query.eq('is_active', false);
          break;
        case 'out-of-stock':
          query = query.eq('stock', 0);
          break;
        case 'sale':
          query = query.not('sale_price', 'is', null);
          break;
      }

      // Price range filters
      if (filters.priceRange[0] !== null) {
        query = query.gte('price', filters.priceRange[0]);
      }
      if (filters.priceRange[1] !== null) {
        query = query.lte('price', filters.priceRange[1]);
      }

      // First get the count
      const { count, error: countError } = await query;
      
      if (countError) throw countError;
      setTotalCount(count || 0);
      
      // Apply sorting
      switch (filters.sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'price-asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price-desc':
          query = query.order('price', { ascending: false });
          break;
        case 'name-asc':
          query = query.order('name', { ascending: true });
          break;
        case 'name-desc':
          query = query.order('name', { ascending: false });
          break;
      }

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error: dataError } = await query;
      
      if (dataError) throw dataError;
      
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
        description: "Failed to load products",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [filters, page, pageSize, toast]);

  // Function to fetch categories
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

  // Function to fetch stores
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
  const saveProduct = async (productData: ProductFormData): Promise<boolean> => {
    try {
      if (productData.id) {
        // Update existing product
        const { error } = await supabase
          .from('store_products')
          .update({
            name: productData.name,
            description: productData.description || null,
            price: productData.price,
            sale_price: productData.sale_price || null,
            stock: productData.stock,
            sku: productData.sku || null,
            category_id: productData.category_id,
            store_id: productData.store_id || null,
            images: productData.images || [],
            thumbnail: productData.thumbnail || null,
            tags: productData.tags || [],
            featured: productData.featured || false,
            is_new: productData.is_new || false,
            is_bestseller: productData.is_bestseller || false,
            is_active: productData.is_active,
            attributes: productData.attributes || {},
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
            description: productData.description || null,
            price: productData.price,
            sale_price: productData.sale_price || null,
            stock: productData.stock,
            sku: productData.sku || null,
            category_id: productData.category_id,
            store_id: productData.store_id || null,
            images: productData.images || [],
            thumbnail: productData.thumbnail || null,
            tags: productData.tags || [],
            featured: productData.featured || false,
            is_new: productData.is_new || false,
            is_bestseller: productData.is_bestseller || false,
            is_active: productData.is_active,
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

  // Toggle product status (featured, active, etc.)
  const toggleProductStatus = async (productId: string, field: 'featured' | 'is_active' | 'is_new' | 'is_bestseller', newValue: boolean): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('store_products')
        .update({ [field]: newValue })
        .eq('id', productId);

      if (error) throw error;

      // Update local state
      setProducts(products.map(product => 
        product.id === productId ? { ...product, [field]: newValue } : product
      ));

      toast({
        title: "Status Updated",
        description: `Product ${field.replace('_', ' ')} status updated successfully`
      });
      return true;
    } catch (error: any) {
      console.error(`Error updating product ${field}:`, error);
      toast({
        title: "Error",
        description: `Failed to update product status: ${error.message}`,
        variant: "destructive"
      });
      return false;
    }
  };

  // Update stock quantity
  const updateStock = async (productId: string, newStock: number): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('store_products')
        .update({ 
          stock: newStock,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId);

      if (error) throw error;

      // Update local state
      setProducts(products.map(product => 
        product.id === productId ? { ...product, stock: newStock } : product
      ));

      toast({
        title: "Stock Updated",
        description: "Product stock has been updated successfully"
      });
      return true;
    } catch (error: any) {
      console.error('Error updating stock:', error);
      toast({
        title: "Error",
        description: `Failed to update stock: ${error.message}`,
        variant: "destructive"
      });
      return false;
    }
  };

  // Add a new category
  const saveCategory = async (categoryData: Partial<ProductCategory>): Promise<boolean> => {
    try {
      if (categoryData.id) {
        // Update existing category
        const { error } = await supabase
          .from('store_categories')
          .update({
            name: categoryData.name,
            description: categoryData.description || null,
            slug: categoryData.slug,
            parent_id: categoryData.parent_id || null,
            image: categoryData.image || null,
            featured: categoryData.featured || false,
            updated_at: new Date().toISOString()
          })
          .eq('id', categoryData.id);

        if (error) throw error;

        toast({
          title: "Category Updated",
          description: "Category has been updated successfully"
        });
      } else {
        // Create new category
        const { error } = await supabase
          .from('store_categories')
          .insert({
            name: categoryData.name!,
            description: categoryData.description || null,
            slug: categoryData.slug!,
            parent_id: categoryData.parent_id || null,
            image: categoryData.image || null,
            featured: categoryData.featured || false
          });

        if (error) throw error;

        toast({
          title: "Category Created",
          description: "Category has been created successfully"
        });
      }
      
      // Refresh categories list
      await fetchCategories();
      return true;
    } catch (error: any) {
      console.error('Error saving category:', error);
      toast({
        title: "Error",
        description: `Failed to save category: ${error.message}`,
        variant: "destructive"
      });
      return false;
    }
  };

  // Delete category
  const deleteCategory = async (categoryId: string): Promise<boolean> => {
    try {
      // Check if category has products
      const { data, error: countError } = await supabase
        .from('store_products')
        .select('id')
        .eq('category_id', categoryId);
      
      if (countError) throw countError;
      
      if (data && data.length > 0) {
        toast({
          title: "Cannot Delete Category",
          description: `This category has ${data.length} products. Please reassign these products before deleting.`,
          variant: "destructive"
        });
        return false;
      }
      
      const { error } = await supabase
        .from('store_categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;

      // Update local state
      setCategories(categories.filter(category => category.id !== categoryId));

      toast({
        title: "Category Deleted",
        description: "Category has been deleted successfully"
      });
      return true;
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: `Failed to delete category: ${error.message}`,
        variant: "destructive"
      });
      return false;
    }
  };

  // Helper functions for UI state management
  const openCreateDialog = () => {
    setSelectedProduct(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setTimeout(() => setSelectedProduct(null), 300);
  };

  const openDeleteDialog = (productId: string) => {
    setProductToDelete(productId);
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      const success = await deleteProduct(productToDelete);
      if (success) {
        closeDeleteDialog();
      }
    }
  };

  const openCategoryDialog = () => {
    setIsCategoryDialogOpen(true);
  };

  const closeCategoryDialog = () => {
    setIsCategoryDialogOpen(false);
  };

  // Filter handlers
  const updateSearchQuery = (query: string) => {
    setFilters(prev => ({ ...prev, searchQuery: query }));
    setPage(1); // Reset pagination when filters change
  };

  const updateCategoryFilter = (categoryId: string | null) => {
    setFilters(prev => ({ ...prev, categoryId }));
    setPage(1);
  };

  const updateStoreFilter = (storeId: string | null) => {
    setFilters(prev => ({ ...prev, storeId }));
    setPage(1);
  };

  const updateStatusFilter = (status: ProductStatus) => {
    setFilters(prev => ({ ...prev, status }));
    setPage(1);
  };

  const updateSortOption = (sortBy: ProductSortOption) => {
    setFilters(prev => ({ ...prev, sortBy }));
  };

  const updatePriceRange = (min: number | null, max: number | null) => {
    setFilters(prev => ({ ...prev, priceRange: [min, max] }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  };

  // Initial data loading
  useEffect(() => {
    if (initialLoad) {
      const loadData = async () => {
        await Promise.all([fetchCategories(), fetchStores()]);
        await fetchProducts();
      };
      
      loadData();
    }
  }, [initialLoad, fetchCategories, fetchStores, fetchProducts]);

  // Refetch products when filters or pagination changes
  useEffect(() => {
    if (initialLoad) {
      fetchProducts();
    }
  }, [fetchProducts, filters, page, pageSize, initialLoad]);

  return {
    // Data
    products,
    categories,
    stores,
    loading,
    error,
    totalCount,
    page,
    pageSize,
    filters,
    selectedProduct,
    isDialogOpen,
    isCategoryDialogOpen,
    isDeleteDialogOpen,
    
    // Pagination
    setPage,
    setPageSize,
    
    // Filter functions
    updateSearchQuery,
    updateCategoryFilter,
    updateStoreFilter,
    updateStatusFilter,
    updateSortOption,
    updatePriceRange,
    resetFilters,
    
    // CRUD operations
    saveProduct,
    deleteProduct,
    toggleProductStatus,
    updateStock,
    saveCategory,
    deleteCategory,
    
    // Dialog controls
    openCreateDialog,
    openEditDialog,
    closeDialog,
    openDeleteDialog,
    closeDeleteDialog,
    confirmDelete,
    openCategoryDialog,
    closeCategoryDialog,
    
    // Refetch data
    fetchProducts,
    fetchCategories,
    fetchStores
  };
}
