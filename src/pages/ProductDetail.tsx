
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/product';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast";
import { formatPrice } from '@/lib/utils';
import { logger } from '@/utils/logger';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('store_products')
          .select(`
            *,
            store_stores (
              id,
              name,
              logo_url
            )
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        setProduct(data as Product);
      } catch (error) {
        logger.error('Error fetching product', { error, productId: id });
        toast({
          title: "Error",
          description: "Failed to load product details",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, toast]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto py-10 text-center">
        <h1 className="text-2xl font-bold mb-4">Product not found</h1>
        <p>The product you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          {product.images && product.images.length > 0 ? (
            <div className="aspect-square overflow-hidden rounded-lg border bg-muted">
              <img
                src={product.thumbnail || product.images[0]}
                alt={product.name}
                className="object-cover w-full h-full"
              />
            </div>
          ) : (
            <div className="aspect-square flex items-center justify-center rounded-lg border bg-muted">
              <span className="text-muted-foreground">No image available</span>
            </div>
          )}
          
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((img, i) => (
                <div key={i} className="aspect-square rounded-md overflow-hidden border">
                  <img src={img} alt={`${product.name} ${i+1}`} className="object-cover w-full h-full" />
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            {product.store_stores && (
              <p className="text-muted-foreground">Sold by {product.store_stores.name}</p>
            )}
          </div>
          
          <div className="flex items-baseline gap-2">
            {product.sale_price ? (
              <>
                <span className="text-3xl font-bold">{formatPrice(product.sale_price)}</span>
                <span className="text-muted-foreground line-through">{formatPrice(product.price)}</span>
                <span className="text-green-600 text-sm font-medium">
                  Save {formatPrice(product.price - product.sale_price)}
                </span>
              </>
            ) : (
              <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
            )}
          </div>
          
          {product.description && (
            <div className="prose max-w-none">
              <p>{product.description}</p>
            </div>
          )}
          
          <div className="space-y-2">
            <p className="text-sm font-medium">Quantity</p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </Button>
              <span className="w-12 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Button 
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="w-full"
            >
              {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
            
            <p className="text-xs text-muted-foreground">
              {product.stock > 0 ? `${product.stock} in stock` : 'Currently unavailable'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
