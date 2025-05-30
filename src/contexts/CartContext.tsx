import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Product } from '@/types/product';
import { logger } from '@/utils/logger';

// Define the CartItem type used in the context
export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selected_attributes?: Record<string, string | number>;
  added_at: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number, attributes?: Record<string, string | number>) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
}

// Create context with default values
const CartContext = createContext<CartContextType>({
  cartItems: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  totalItems: 0,
  subtotal: 0,
  isCartOpen: false,
  setIsCartOpen: () => {},
});

// Keep the rest of the existing code, but update the types
export const CartProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const { toast } = useToast();

  // Update cart item types when using localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } catch (error) {
      logger.error('Failed to load cart from localStorage', { error });
    }
  }, []);

  // Save cart items to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    } catch (error) {
      logger.error('Failed to save cart to localStorage', { error });
    }
  }, [cartItems]);

  // Add item to cart
  const addToCart = (product: Product, quantity = 1, attributes?: Record<string, string | number>) => {
    setCartItems(prevItems => {
      // Check if the product already exists in the cart
      const existingItem = prevItems.find(item => 
        item.product.id === product.id && 
        JSON.stringify(item.selected_attributes) === JSON.stringify(attributes)
      );

      if (existingItem) {
        // Update quantity if the product already exists
        return prevItems.map(item => 
          item.id === existingItem.id 
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        );
      } else {
        // Add new item if the product doesn't exist
        const newItem: CartItem = {
          id: `${product.id}-${Date.now()}`,
          product: product,
          quantity,
          selected_attributes: attributes,
          added_at: new Date().toISOString(),
        };
        return [...prevItems, newItem];
      }
    });

    toast({
      title: "Added to Cart",
      description: `${quantity} x ${product.name}`,
    });
  };

  // Remove item from cart
  const removeFromCart = (itemId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  // Update quantity of an item
  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId ? { ...item, quantity: quantity } : item
      )
    );
  };

  // Clear cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Calculate total items in cart
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Calculate subtotal
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product.sale_price || item.product.price;
    return sum + (price * item.quantity);
  }, 0);

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    subtotal,
    isCartOpen,
    setIsCartOpen,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use the cart context
export const useCart = () => useContext(CartContext);
