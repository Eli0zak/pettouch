
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProductCategory, Store } from '@/types';
import { Search } from 'lucide-react';

interface ProductFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  categoryFilter: string | null;
  setCategoryFilter: (value: string | null) => void;
  storeFilter: string | null;
  setStoreFilter: (value: string | null) => void;
  categories: ProductCategory[];
  stores: Store[];
  t: (key: string) => string;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  categoryFilter,
  setCategoryFilter,
  storeFilter,
  setStoreFilter,
  categories,
  stores,
  t
}) => {
  return (
    <div className="mb-4 flex flex-col md:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder={t('admin.products.searchProducts') || 'Search products...'}
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="w-full md:w-48">
        <Select 
          value={categoryFilter || 'all'} 
          onValueChange={(value) => setCategoryFilter(value === 'all' ? null : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('admin.products.filterByCategory') || 'Filter by category'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('admin.products.allCategories') || 'All Categories'}</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-full md:w-48">
        <Select 
          value={storeFilter || 'all'} 
          onValueChange={(value) => setStoreFilter(value === 'all' ? null : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('admin.products.filterByStore') || 'Filter by store'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('admin.products.allStores') || 'All Stores'}</SelectItem>
            {stores.map((store) => (
              <SelectItem key={store.id} value={store.id}>{store.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ProductFilters;
