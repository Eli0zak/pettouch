import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ShoppingCart, X, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/utils';

interface CartDrawerProps {
  children?: React.ReactNode;
}

export function CartDrawer({ children }: CartDrawerProps) {
  const { cartItems, removeFromCart, updateQuantity, subtotal, totalItems, isCartOpen, setIsCartOpen, clearCart } = useCart();

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetTrigger asChild>
        {children || (
          <Button variant="outline" size="icon" className="relative">
            <ShoppingCart className="h-[1.2rem] w-[1.2rem]" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader className="space-y-2.5 pr-6">
          <SheetTitle className="flex items-center text-lg">
            <ShoppingCart className="mr-2 h-5 w-5" /> Shopping Cart
          </SheetTitle>
        </SheetHeader>
        
        {cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            <div className="rounded-full bg-muted h-16 w-16 flex items-center justify-center">
              <ShoppingCart className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-medium">Your cart is empty</h3>
              <p className="text-sm text-muted-foreground">
                Looks like you haven't added any products to your cart yet.
              </p>
            </div>
            <Button asChild>
              <Link to="/store">Continue Shopping</Link>
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 pr-4 -mr-4">
              <ul className="space-y-5">
                {cartItems.map((item) => (
                  <li key={item.id} className="grid grid-cols-[80px,1fr,auto] gap-4">
                    <div className="h-20 w-20 overflow-hidden rounded-md border bg-muted">
                      {item.product.thumbnail ? (
                        <img
                          src={item.product.thumbnail}
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-secondary text-secondary-foreground">
                          <span className="text-xs">No image</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium">{item.product.name}</h4>
                      <div className="flex items-center text-sm">
                        <span className={item.product.sale_price ? "line-through text-muted-foreground text-xs mr-2" : ""}>
                          {formatPrice(item.product.price)}
                        </span>
                        {item.product.sale_price && (
                          <span className="font-medium text-primary">
                            {formatPrice(item.product.sale_price)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        >
                          <span>-</span>
                        </Button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <span>+</span>
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <p className="text-sm font-medium">
                        {formatPrice((item.product.sale_price || item.product.price) * item.quantity)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>
            
            <div className="mt-6 space-y-4">
              <Separator />
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-sm">Subtotal</span>
                  <span className="text-sm font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Shipping</span>
                  <span className="text-sm text-muted-foreground">Calculated at checkout</span>
                </div>
              </div>
              <Button asChild className="w-full">
                <Link to="/checkout">Checkout</Link>
              </Button>
              <div className="flex justify-end">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-1.5 text-sm"
                  onClick={clearCart}
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Clear Cart</span>
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

export default CartDrawer;
