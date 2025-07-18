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
        {children || null}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        {/* Removed Shopping Cart UI from footer */}
      </SheetContent>
    </Sheet>
  );
}

export default CartDrawer;
