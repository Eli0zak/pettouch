
import React, { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Search, Filter, X } from 'lucide-react';
import { ProductCategory, Store, ProductStatus, ProductSortOption } from '@/types/product';
import { debounce } from 'lodash';

interface ProductFilterBarProps {
  categories: ProductCategory[];
  stores: Store[];
  onSearchChange: (query: string) => void;
  onCategoryChange: (categoryId: string | null) => void;
  onStoreChange: (storeId: string | null) => void;
  onStatusChange: (status: ProductStatus) => void;
  onSortChange: (sort: ProductSortOption) => void;
  onPriceRangeChange: (min: number | null, max: number | null) => void;
  onReset: () => void;
  selectedCategoryId: string | null;
  selectedStoreId: string | null;
  selectedStatus: ProductStatus;
  selectedSort: ProductSortOption;
  priceRange: [number | null, number | null];
}

const ProductFilterBar: React.FC<ProductFilterBarProps> = ({
  categories,
  stores,
  onSearchChange,
  onCategoryChange,
  onStoreChange,
  onStatusChange,
  onSortChange,
  onPriceRangeChange,
  onReset,
  selectedCategoryId,
  selectedStoreId,
  selectedStatus,
  selectedSort,
  priceRange,
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [localPriceMin, setLocalPriceMin] = useState<number | null>(priceRange[0]);
  const [localPriceMax, setLocalPriceMax] = useState<number | null>(priceRange[1]);
  
  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      onSearchChange(query);
    }, 300),
    [onSearchChange]
  );
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    debouncedSearch(value);
  };
  
  const handlePriceMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? Number(e.target.value) : null;
    setLocalPriceMin(value);
  };
  
  const handlePriceMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? Number(e.target.value) : null;
    setLocalPriceMax(value);
  };
  
  const applyPriceFilter = () => {
    onPriceRangeChange(localPriceMin, localPriceMax);
  };
  
  const handleResetFilters = () => {
    setSearchValue('');
    setLocalPriceMin(null);
    setLocalPriceMax(null);
    onReset();
  };

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search input */}
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search products..."
            className="pl-10"
            value={searchValue}
            onChange={handleSearchChange}
          />
        </div>
        
        {/* Category filter */}
        <div className="w-full md:w-48">
          <Select 
            value={selectedCategoryId || 'all'} 
            onValueChange={(value) => onCategoryChange(value === 'all' ? null : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Store filter */}
        {stores.length > 0 && (
          <div className="w-full md:w-48">
            <Select 
              value={selectedStoreId || 'all'} 
              onValueChange={(value) => onStoreChange(value === 'all' ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Store" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stores</SelectItem>
                {stores.map((store) => (
                  <SelectItem key={store.id} value={store.id}>{store.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        {/* Status filter */}
        <div className="w-full md:w-48">
          <Select 
            value={selectedStatus} 
            onValueChange={(value) => onStatusChange(value as ProductStatus)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="out-of-stock">Out of Stock</SelectItem>
              <SelectItem value="sale">On Sale</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Sort options */}
        <div className="w-full md:w-48">
          <Select 
            value={selectedSort} 
            onValueChange={(value) => onSortChange(value as ProductSortOption)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="name-asc">Name: A to Z</SelectItem>
              <SelectItem value="name-desc">Name: Z to A</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          {/* Price range filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter size={16} />
                <span>Price Range</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4">
              <div className="space-y-4">
                <h4 className="font-medium">Filter by price</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="price-min">Min ($)</Label>
                    <Input
                      id="price-min"
                      type="number"
                      min="0"
                      placeholder="Min"
                      value={localPriceMin || ''}
                      onChange={handlePriceMinChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="price-max">Max ($)</Label>
                    <Input
                      id="price-max"
                      type="number"
                      min="0"
                      placeholder="Max"
                      value={localPriceMax || ''}
                      onChange={handlePriceMaxChange}
                    />
                  </div>
                </div>
                <Button onClick={applyPriceFilter} className="w-full">
                  Apply
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          
          {/* Reset filters button */}
          {(selectedCategoryId || selectedStoreId || selectedStatus !== 'all' || 
            selectedSort !== 'newest' || priceRange[0] || priceRange[1] || searchValue) && (
            <Button variant="ghost" size="sm" onClick={handleResetFilters} className="h-9">
              <X size={16} className="mr-2" />
              Reset Filters
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductFilterBar;
