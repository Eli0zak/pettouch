
import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination } from '@/components/ui/pagination';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChevronLeft, ChevronRight, Plus, ListFilter, PackageCheck, Layers } from 'lucide-react';
import { useProductManagement } from '@/hooks/useProductManagement';
import { Product } from '@/types/product';

// Import components
import ProductFilterBar from '@/components/admin/products/ProductFilterBar';
import ProductsTable from '@/components/admin/products/ProductsTable';
import ProductForm from '@/components/admin/products/ProductForm';
import CategoryForm from '@/components/admin/products/CategoryForm';
import ConfirmDialog from '@/components/admin/products/ConfirmDialog';

const AdminProducts = () => {
  const {
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
  } = useProductManagement();

  const [activeTab, setActiveTab] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Handle product saving
  const handleSaveProduct = async (productData: any) => {
    setIsSubmitting(true);
    try {
      const success = await saveProduct(productData);
      if (success) {
        closeDialog();
      }
      return success;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle category saving
  const handleSaveCategory = async (categoryData: any) => {
    setIsSubmitting(true);
    try {
      const success = await saveCategory(categoryData);
      if (success) {
        closeCategoryDialog();
      }
      return success;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Product Management</CardTitle>
            <CardDescription>
              Manage products, categories, and inventory in your store
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={openCategoryDialog}
              variant="outline"
              className="flex items-center gap-1"
            >
              <Layers size={16} />
              <span>Add Category</span>
            </Button>
            <Button onClick={openCreateDialog} className="flex items-center gap-1">
              <Plus size={16} />
              <span>Add Product</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="mb-6"
          >
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="all" onClick={() => updateStatusFilter('all')}>
                  All Products
                </TabsTrigger>
                <TabsTrigger value="active" onClick={() => updateStatusFilter('active')}>
                  Active
                </TabsTrigger>
                <TabsTrigger value="inactive" onClick={() => updateStatusFilter('inactive')}>
                  Inactive
                </TabsTrigger>
                <TabsTrigger value="out-of-stock" onClick={() => updateStatusFilter('out-of-stock')}>
                  Out of Stock
                </TabsTrigger>
                <TabsTrigger value="sale" onClick={() => updateStatusFilter('sale')}>
                  On Sale
                </TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'table' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('table')}
                  className="h-9 w-9"
                >
                  <ListFilter size={16} />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                  className="h-9 w-9"
                >
                  <Layers size={16} />
                </Button>
              </div>
            </div>
          </Tabs>
          
          {/* Filters */}
          <ProductFilterBar
            categories={categories}
            stores={stores}
            onSearchChange={updateSearchQuery}
            onCategoryChange={updateCategoryFilter}
            onStoreChange={updateStoreFilter}
            onStatusChange={updateStatusFilter}
            onSortChange={updateSortOption}
            onPriceRangeChange={updatePriceRange}
            onReset={resetFilters}
            selectedCategoryId={filters.categoryId}
            selectedStoreId={filters.storeId}
            selectedStatus={filters.status}
            selectedSort={filters.sortBy}
            priceRange={filters.priceRange}
          />
          
          {/* Error message */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {/* Loading spinner */}
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <PackageCheck className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-1">No products found</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                {filters.searchQuery || filters.categoryId || filters.storeId || filters.status !== 'all' || filters.priceRange[0] || filters.priceRange[1]
                  ? 'No products match your current filters. Try adjusting your search criteria.'
                  : 'You haven\'t added any products yet. Get started by adding your first product.'}
              </p>
              <Button onClick={openCreateDialog}>
                <Plus size={16} className="mr-2" />
                Add Your First Product
              </Button>
            </div>
          ) : (
            <>
              {/* Products Table */}
              <ProductsTable
                products={products}
                categories={categories}
                stores={stores}
                onViewProduct={openEditDialog}
                onEditProduct={openEditDialog}
                onDeleteProduct={openDeleteDialog}
                onToggleFeatured={(id, featured) => toggleProductStatus(id, 'featured', !featured)}
                onToggleStatus={(id, active) => toggleProductStatus(id, 'is_active', !active)}
                onUpdateStock={updateStock}
              />
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalCount)} of {totalCount} products
                  </div>
                  <Pagination>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-1 mx-2">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        // If totalPages <= 5, show all pages
                        // If totalPages > 5, show pages around current page
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (page <= 3) {
                          pageNum = i + 1;
                        } else if (page >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = page - 2 + i;
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={page === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPage(pageNum)}
                            className="w-9"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Product Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>
              {selectedProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
            <DialogDescription>
              {selectedProduct 
                ? 'Update the details of your existing product.'
                : 'Fill out the form below to add a new product to your store.'}
            </DialogDescription>
          </DialogHeader>
          
          <ProductForm
            product={selectedProduct || undefined}
            categories={categories}
            stores={stores}
            onSave={handleSaveProduct}
            onCancel={closeDialog}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
      
      {/* Category Form Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={closeCategoryDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              Add New Category
            </DialogTitle>
            <DialogDescription>
              Create a new product category for your store.
            </DialogDescription>
          </DialogHeader>
          
          <CategoryForm
            categories={categories}
            onSave={handleSaveCategory}
            onCancel={closeCategoryDialog}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={closeDeleteDialog}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone."
        actionLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={confirmDelete}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default AdminProducts;
