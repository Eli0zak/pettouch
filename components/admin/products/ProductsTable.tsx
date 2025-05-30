
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CheckCircle, Edit, Eye, MoreHorizontal, Package, Pencil, Star, Trash2, XCircle } from 'lucide-react';
import { Product, ProductCategory, Store } from '@/types/product';

interface ProductsTableProps {
  products: Product[];
  categories: ProductCategory[];
  stores: Store[];
  onViewProduct: (product: Product) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onToggleFeatured: (productId: string, featured: boolean) => void;
  onToggleStatus: (productId: string, active: boolean) => void;
  onUpdateStock: (productId: string, stock: number) => void;
}

const ProductsTable: React.FC<ProductsTableProps> = ({
  products,
  categories,
  stores,
  onViewProduct,
  onEditProduct,
  onDeleteProduct,
  onToggleFeatured,
  onToggleStatus,
  onUpdateStock,
}) => {
  const [editingStock, setEditingStock] = useState<{id: string, value: number} | null>(null);

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  const getStoreName = (storeId: string | null | undefined) => {
    if (!storeId) return 'N/A';
    const store = stores.find(store => store.id === storeId);
    return store ? store.name : 'Unknown';
  };

  const handleStockChange = (id: string, value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setEditingStock({ id, value: numValue });
    }
  };

  const saveStock = (id: string) => {
    if (editingStock && editingStock.id === id) {
      onUpdateStock(id, editingStock.value);
      setEditingStock(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">Image</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[150px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                {product.thumbnail ? (
                  <img
                    src={product.thumbnail}
                    alt={product.name}
                    className="w-10 h-10 rounded-md object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                    <Package size={18} className="text-muted-foreground" />
                  </div>
                )}
              </TableCell>
              
              <TableCell>
                <div className="font-medium">{product.name}</div>
                <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                  {product.sku ? `SKU: ${product.sku}` : 'No SKU'}
                </div>
              </TableCell>
              
              <TableCell>{getCategoryName(product.category_id)}</TableCell>
              
              <TableCell>
                <div className="font-medium">
                  {product.sale_price ? (
                    <>
                      <span className="text-muted-foreground line-through mr-2">
                        {formatPrice(product.price)}
                      </span>
                      <span className="text-destructive">
                        {formatPrice(product.sale_price)}
                      </span>
                    </>
                  ) : (
                    formatPrice(product.price)
                  )}
                </div>
                {product.store_id && (
                  <div className="text-xs text-muted-foreground">
                    Store: {getStoreName(product.store_id)}
                  </div>
                )}
              </TableCell>
              
              <TableCell>
                {editingStock && editingStock.id === product.id ? (
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      min="0"
                      className="w-20 h-8"
                      value={editingStock.value}
                      onChange={(e) => handleStockChange(product.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          saveStock(product.id);
                        }
                      }}
                      onBlur={() => saveStock(product.id)}
                      autoFocus
                    />
                  </div>
                ) : (
                  <div
                    className="cursor-pointer hover:bg-accent hover:text-accent-foreground p-1 rounded-md inline-block"
                    onClick={() => setEditingStock({ id: product.id, value: product.stock })}
                  >
                    <Badge variant={product.stock === 0 ? "destructive" : product.stock < 5 ? "outline" : "secondary"}>
                      {product.stock}
                    </Badge>
                  </div>
                )}
              </TableCell>
              
              <TableCell>
                <div className="flex items-center space-x-2">
                  {product.is_active !== false ? (
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">
                      Inactive
                    </Badge>
                  )}
                  
                  {product.featured && (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      Featured
                    </Badge>
                  )}
                </div>
              </TableCell>
              
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewProduct(product)}>
                      <Eye size={14} className="mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEditProduct(product)}>
                      <Edit size={14} className="mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onToggleFeatured(product.id, !!product.featured)}>
                      <Star size={14} className="mr-2" />
                      {product.featured ? 'Remove Featured' : 'Mark as Featured'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onToggleStatus(product.id, product.is_active !== false)}>
                      {product.is_active !== false ? (
                        <>
                          <XCircle size={14} className="mr-2" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <CheckCircle size={14} className="mr-2" />
                          Activate
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onDeleteProduct(product.id)} className="text-destructive">
                      <Trash2 size={14} className="mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProductsTable;
