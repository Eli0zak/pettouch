import React, { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { toggleTheme, isDark } = useTheme();
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Handle animation states
  const handlePress = () => setIsPressed(true);
  const handlePressRelease = () => {
    setIsPressed(false);
    toggleTheme();
  };

  const handleClick = () => {
    toggleTheme();
  };

  return (
    <motion.button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      className={cn(
        // Base styles
        "relative h-12 w-12 rounded-full focus:outline-none",
        // Claymorphism styles
        "shadow-lg transition-all duration-300",
        isDark 
          ? "bg-gray-800 shadow-inner-dark" 
          : "bg-white",
        // Pressed state
        isPressed 
          ? "scale-95 shadow-inner" 
          : "scale-100",
        // Additional classes
        className
      )}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {/* Clay effect outer ring */}
      <motion.div 
        className={cn(
          "absolute inset-0 rounded-full",
          isDark 
            ? "bg-gray-700 shadow-clay-dark" 
            : "bg-gray-100 shadow-clay-light"
        )}
        animate={{ 
          opacity: isHovered ? 1 : 0,
          scale: isHovered ? 1.1 : 1
        }}
        transition={{
          duration: 0.2,
          type: "spring",
          stiffness: 300,
          damping: 15
        }}
      />
      
      {/* Icon container */}
      <div className="relative z-10 h-full w-full flex items-center justify-center">
        <AnimatePresence mode="wait">
          {isDark ? (
            <motion.svg 
              key="moon"
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6 text-amber-300" 
              viewBox="0 0 20 20" 
              fill="currentColor"
              initial={{ rotate: -30, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 30, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </motion.svg>
          ) : (
            <motion.svg 
              key="sun"
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6 text-amber-500" 
              viewBox="0 0 20 20" 
              fill="currentColor"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
            </motion.svg>
          )}
        </AnimatePresence>
      </div>
      
      {/* Ripple effect on click */}
      <AnimatePresence>
        {isPressed && (
          <motion.div
            className={cn(
              "absolute inset-0 rounded-full",
              isDark ? "bg-gray-600" : "bg-primary-100"
            )}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.15, scale: 1.5 }}
            exit={{ opacity: 0, scale: 2 }}
            transition={{ duration: 0.5 }}
          />
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export default ThemeToggle; 