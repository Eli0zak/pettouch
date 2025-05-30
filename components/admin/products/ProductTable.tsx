
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product, ProductCategory, Store } from '@/types';
import { Pencil, Trash2, Star, StarOff, PackageCheck, Store as StoreIcon } from 'lucide-react';

interface ProductTableProps {
  products: Product[];
  categories: ProductCategory[];
  stores: Store[];
  onEdit: (product: Product) => void;
  onToggleFeatured: (id: string, featured: boolean) => void;
  onDelete: (id: string) => void;
  t: (key: string) => string;
}

const ProductTable: React.FC<ProductTableProps> = ({ 
  products, 
  categories, 
  stores, 
  onEdit, 
  onToggleFeatured, 
  onDelete,
  t 
}) => {
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown Category';
  };

  const getStoreName = (storeId?: string) => {
    if (!storeId) return '-';
    const store = stores.find(s => s.id === storeId);
    return store ? store.name : 'Unknown Store';
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('admin.products.product') || 'Product'}</TableHead>
            <TableHead>{t('admin.products.store') || 'Store'}</TableHead>
            <TableHead>{t('admin.products.category') || 'Category'}</TableHead>
            <TableHead>{t('admin.products.price') || 'Price'}</TableHead>
            <TableHead>{t('admin.products.stock') || 'Stock'}</TableHead>
            <TableHead>{t('admin.products.status') || 'Status'}</TableHead>
            <TableHead className="text-right">{t('admin.common.actions') || 'Actions'}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {product.thumbnail ? (
                    <img 
                      src={product.thumbnail} 
                      alt={product.name} 
                      className="w-10 h-10 rounded object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                      <PackageCheck size={20} />
                    </div>
                  )}
                  <div>
                    <div>{product.name}</div>
                    <div className="text-xs text-muted-foreground">{product.sku}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {product.store_id ? (
                  <div className="flex items-center gap-2">
                    {product.store_stores?.logo_url ? (
                      <img 
                        src={product.store_stores.logo_url} 
                        alt={product.store_stores.name} 
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <StoreIcon size={16} className="text-muted-foreground" />
                    )}
                    <span>{product.store_stores?.name || getStoreName(product.store_id)}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>{getCategoryName(product.category_id)}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className={product.sale_price ? "line-through text-muted-foreground text-xs" : ""}>
                    ${product.price.toFixed(2)}
                  </span>
                  {product.sale_price && (
                    <span className="text-primary font-medium">${product.sale_price.toFixed(2)}</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <span className={product.stock <= 0 ? "text-destructive" : ""}>{product.stock}</span>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {product.featured && (
                    <Badge variant="default" className="bg-amber-500">
                      {t('admin.products.featured') || 'Featured'}
                    </Badge>
                  )}
                  {product.is_new && (
                    <Badge variant="outline" className="border-blue-500 text-blue-500">
                      {t('admin.products.new') || 'New'}
                    </Badge>
                  )}
                  {product.is_bestseller && (
                    <Badge variant="outline" className="border-green-500 text-green-500">
                      {t('admin.products.bestseller') || 'Bestseller'}
                    </Badge>
                  )}
                  {product.stock <= 0 && (
                    <Badge variant="destructive">
                      {t('admin.products.outOfStock') || 'Out of Stock'}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onEdit(product)}
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onToggleFeatured(product.id, product.featured || false)}
                  >
                    {product.featured ? <StarOff size={16} /> : <Star size={16} />}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onDelete(product.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProductTable;
