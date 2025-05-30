import React, { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Star, ShoppingCart, Heart, Share2, Sparkles, Check } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  rating?: number;
  inStock?: boolean;
  isNew?: boolean;
  discount?: number;
  onAddToCart?: () => void;
  onAddToWishlist?: () => void;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  price,
  imageUrl,
  category,
  rating = 0,
  inStock = true,
  isNew = false,
  discount = 0,
  onAddToCart,
  onAddToWishlist,
  className = '',
}) => {
  const { isDark } = useTheme();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showRipple, setShowRipple] = useState(false);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  
  // 3D card tilt effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);
  
  // Calculate the discounted price if there's a discount
  const discountedPrice = discount > 0 ? price - (price * discount / 100) : price;
  
  // Handle mouse move for 3D effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const centerX = rect.left + width / 2;
    const centerY = rect.top + height / 2;
    
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    x.set(mouseX);
    y.set(mouseY);
  };
  
  // Handle mouse leave
  const handleMouseLeave = () => {
    setIsHovered(false);
    // Reset card rotation
    x.set(0);
    y.set(0);
  };
  
  // Handle wishlist toggle with animation
  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsWishlisted(!isWishlisted);
    setShowRipple(true);
    
    setTimeout(() => {
      setShowRipple(false);
    }, 600);
    
    if (onAddToWishlist) {
      onAddToWishlist();
    }
  };
  
  // Handle add to cart with animation
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAddedToCart) {
      setIsAddedToCart(true);
      
      if (onAddToCart) {
        onAddToCart();
      }
      
      // Reset after 2 seconds
      setTimeout(() => {
        setIsAddedToCart(false);
      }, 2000);
    }
  };

  return (
    <motion.div 
      className={cn(
        // Base styles
        "relative rounded-xl overflow-hidden transition-all duration-300",
        // Glass effect based on theme
        isDark 
          ? "bg-black/20 backdrop-blur-md border border-white/10" 
          : "bg-white/70 backdrop-blur-md border border-gray-100",
        // Shadow based on interaction
        isHovered 
          ? isDark ? "shadow-2xl shadow-primary-900/30" : "shadow-2xl shadow-primary-200/50" 
          : isDark ? "shadow-lg shadow-black/20" : "shadow-md",
        // Additional classes
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: "preserve-3d",
        perspective: 1000,
        rotateX: isHovered ? rotateX : 0,
        rotateY: isHovered ? rotateY : 0,
      }}
    >
      <Link to={`/products/${id}`} className="block">
        {/* Product image section */}
        <div className="relative aspect-square w-full overflow-hidden">
          {/* Main product image */}
          <motion.div
            className="h-full w-full"
            style={{ 
              z: 20, 
              transformStyle: "preserve-3d",
              translateZ: isHovered ? "20px" : "0px",
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <motion.img
              src={imageUrl || '/placeholder.svg'}
              alt={name}
              className="h-full w-full object-cover"
              animate={{ 
                scale: isHovered ? 1.05 : 1,
                filter: isHovered ? "brightness(1.05)" : "brightness(1)"
              }}
              transition={{ duration: 0.3 }}
              loading="lazy"
            />

            {/* Glassmorphism overlay */}
            <motion.div
              className={cn(
                "absolute inset-0 pointer-events-none",
                isDark ? "bg-gradient-to-t from-black/60 to-transparent" : "bg-gradient-to-t from-white/60 to-transparent"
              )}
              style={{
                clipPath: "polygon(0 70%, 100% 50%, 100% 100%, 0% 100%)",
              }}
              animate={{
                opacity: isHovered ? 1 : 0.7,
              }}
            />
          </motion.div>
          
          {/* Floating badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-20">
            {isNew && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                style={{ 
                  transformStyle: "preserve-3d",
                  translateZ: isHovered ? "40px" : "0px",
                }}
              >
                <Badge className="bg-accent-3 text-white font-medium flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  New
                </Badge>
              </motion.div>
            )}
            
            {discount > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                style={{ 
                  transformStyle: "preserve-3d",
                  translateZ: isHovered ? "40px" : "0px",
                }}
              >
                <Badge className="bg-accent-1 text-black font-medium">
                  {discount}% OFF
                </Badge>
              </motion.div>
            )}
          </div>
          
          {/* Quick action buttons - appear on hover */}
          <AnimatePresence>
            {isHovered && (
              <motion.div 
                className="absolute top-3 right-3 flex flex-col gap-2 z-20"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                style={{ 
                  transformStyle: "preserve-3d",
                  translateZ: "40px",
                }}
              >
                {/* Wishlist button */}
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.button
                        className={cn(
                          "h-9 w-9 rounded-full flex items-center justify-center",
                          "backdrop-blur-sm transition-colors",
                          isWishlisted 
                            ? "bg-red-500/90 text-white" 
                            : isDark ? "bg-white/20 text-white hover:bg-white/30" : "bg-black/10 hover:bg-black/20"
                        )}
                        onClick={handleWishlistToggle}
                        whileTap={{ scale: 0.9 }}
                      >
                        <div className="relative">
                          <Heart 
                            className={cn(
                              "h-5 w-5",
                              isWishlisted ? "fill-current" : ""
                            )} 
                          />
                          
                          {/* Ripple effect */}
                          <AnimatePresence>
                            {showRipple && (
                              <motion.span
                                className="absolute inset-0 rounded-full bg-red-500/20"
                                initial={{ scale: 0, opacity: 0.8 }}
                                animate={{ scale: 3, opacity: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.6 }}
                              />
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                {/* Share button */}
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.button
                        className={cn(
                          "h-9 w-9 rounded-full flex items-center justify-center",
                          "backdrop-blur-sm",
                          isDark ? "bg-white/20 text-white hover:bg-white/30" : "bg-black/10 hover:bg-black/20"
                        )}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Share2 className="h-4 w-4" />
                      </motion.button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Share product
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Category tag */}
          <div 
            className="absolute bottom-3 left-3 z-20"
            style={{ 
              transformStyle: "preserve-3d",
              translateZ: isHovered ? "30px" : "0px",
            }}
          >
            <span className={cn(
              "text-xs font-medium px-2 py-1 rounded-full",
              isDark 
                ? "bg-white/20 text-white backdrop-blur-sm" 
                : "bg-black/20 text-white backdrop-blur-sm"
            )}>
              {category}
            </span>
          </div>
          
          {/* Out of stock overlay */}
          {!inStock && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-30">
              <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-full">
                <span className="text-white font-bold text-lg">Out of Stock</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Product info section */}
        <div className="p-4">
          {/* Product name and price */}
          <div className="mb-2">
            <div className="flex justify-between items-start gap-2">
              <motion.h3 
                className="text-lg font-bold line-clamp-1"
                style={{ 
                  transformStyle: "preserve-3d",
                  translateZ: isHovered ? "15px" : "0px",
                }}
              >
                {name}
              </motion.h3>
              
              <motion.div 
                className="flex flex-col items-end"
                style={{ 
                  transformStyle: "preserve-3d",
                  translateZ: isHovered ? "15px" : "0px",
                }}
              >
                {discount > 0 && (
                  <span className="text-xs line-through text-muted-foreground">
                    ${price.toFixed(2)}
                  </span>
                )}
                <span className={cn(
                  "font-bold",
                  discount > 0 ? "text-accent-3" : "text-primary-600 dark:text-primary-400"
                )}>
                  ${discountedPrice.toFixed(2)}
                </span>
              </motion.div>
            </div>
          </div>
          
          {/* Rating */}
          <motion.div 
            className="flex items-center mb-3"
            style={{ 
              transformStyle: "preserve-3d",
              translateZ: isHovered ? "10px" : "0px",
            }}
          >
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-3.5 w-3.5", 
                    i < Math.floor(rating) 
                      ? "text-amber-500 fill-amber-500" 
                      : i < rating 
                        ? "text-amber-500 fill-amber-500/50" 
                        : "text-gray-300 dark:text-gray-600"
                  )}
                />
              ))}
            </div>
            <span className="ml-1 text-xs text-muted-foreground">({rating.toFixed(1)})</span>
          </motion.div>
          
          {/* Add to cart button */}
          <motion.div
            style={{ 
              transformStyle: "preserve-3d",
              translateZ: isHovered ? "20px" : "0px",
            }}
          >
            <Button
              className={cn(
                "w-full relative overflow-hidden",
                isAddedToCart 
                  ? "bg-green-500 hover:bg-green-600" 
                  : "bg-primary-500 hover:bg-primary-600"
              )}
              onClick={handleAddToCart}
              disabled={!inStock || isAddedToCart}
            >
              <AnimatePresence mode="wait">
                {isAddedToCart ? (
                  <motion.div
                    key="added"
                    className="flex items-center justify-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Added to Cart
                  </motion.div>
                ) : (
                  <motion.div
                    key="add"
                    className="flex items-center justify-center"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {inStock ? 'Add to Cart' : 'Out of Stock'}
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Button hover/click effect */}
              {inStock && (
                <motion.div
                  className="absolute inset-0 bg-white"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={isAddedToCart ? { scale: 20, opacity: 0 } : { scale: 0, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                />
              )}
            </Button>
          </motion.div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard; 