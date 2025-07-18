import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

interface NFCTagCardProps {
  id: string;
  tagId: string;
  status: 'active' | 'inactive' | 'pending';
  lastScan?: string;
  petId?: string;
  petName?: string;
  className?: string;
  onActivate?: () => void;
  onDeactivate?: () => void;
  onViewHistory?: () => void;
}

const NFCTagCard: React.FC<NFCTagCardProps> = ({
  id,
  tagId,
  status,
  lastScan,
  petId,
  petName,
  className = '',
  onActivate,
  onDeactivate,
  onViewHistory,
}) => {
  const { isDark } = useTheme();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  // Motion values for 3D effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Transform mouse movement to rotation
  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);
  
  // Status colors and labels
  const statusConfig = {
    active: {
      color: 'bg-green-500',
      label: 'Active',
    },
    inactive: {
      color: 'bg-red-500',
      label: 'Inactive',
    },
    pending: {
      color: 'bg-yellow-500',
      label: 'Pending',
    },
  };
  
  // Handle mouse move for 3D effect
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };
  
  // Reset position when mouse leaves
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={cardRef}
      className={`card-neumorphic ${isDark ? 'dark' : 'light'} ${className}`}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: 0.98 }}
    >
      {/* NFC Tag 3D Visualization */}
      <div className="relative mb-6 h-40 w-full flex items-center justify-center">
        <motion.div
          className={`h-32 w-32 rounded-full ${
            isDark ? 'bg-gray-800' : 'bg-gray-100'
          } shadow-lg flex items-center justify-center`}
          style={{
            transformStyle: 'preserve-3d',
            perspective: '1000px',
            rotateX,
            rotateY,
            z: 20,
          }}
          animate={{ 
            scale: isHovered ? 1.05 : 1,
            boxShadow: isHovered 
              ? '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)'
              : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
          }}
        >
          {/* NFC Symbol */}
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-pettouch-light-primary dark:text-pettouch-dark-primary"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ z: 30 }}
            animate={{ 
              scale: isHovered ? [1, 1.1, 1] : 1,
              opacity: isHovered ? [1, 0.8, 1] : 1,
            }}
            transition={{ 
              duration: 1.5,
              repeat: isHovered ? Infinity : 0,
              repeatType: 'reverse'
            }}
          >
            <path d="M20 12v-8a2 2 0 0 0-2-2H8"></path>
            <path d="M6 12v8a2 2 0 0 0 2 2h8"></path>
            <path d="M2 6h12"></path>
            <path d="M14 2v12"></path>
            <path d="M10 18H2"></path>
            <path d="M22 18h-8"></path>
          </motion.svg>
          
          {/* Tag ID */}
          <div 
            className="absolute -bottom-6 left-0 right-0 text-center"
            style={{ transform: 'translateZ(30px)' }}
          >
            <span className="text-xs font-mono bg-black/70 text-white px-2 py-1 rounded">
              {tagId}
            </span>
          </div>
        </motion.div>
        
        {/* Status indicator */}
        <div className="absolute top-2 right-2 flex items-center">
          <span className={`${statusConfig[status].color} h-3 w-3 rounded-full animate-pulse-light`}></span>
          <span className="ml-1 text-xs font-medium">
            {statusConfig[status].label}
          </span>
        </div>
      </div>
      
      {/* Tag information */}
      <div className="space-y-3">
        {petName && (
          <div>
            <p className="text-sm text-muted-foreground">Linked to</p>
            <p className="font-bold">{petName}</p>
          </div>
        )}
        
        {lastScan && (
          <div>
            <p className="text-sm text-muted-foreground">Last Scanned</p>
            <p>{lastScan}</p>
          </div>
        )}
        
        {/* Action buttons */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          {status === 'active' ? (
            <button 
              onClick={onDeactivate}
              className={`btn-neumorphic ${isDark ? 'dark' : 'light'} text-sm`}
            >
              Deactivate
            </button>
          ) : (
            <button 
              onClick={onActivate}
              className={`btn-neumorphic ${isDark ? 'dark' : 'light'} text-sm`}
            >
              Activate
            </button>
          )}
          
          <button 
            onClick={onViewHistory}
            className={`btn-neumorphic ${isDark ? 'dark' : 'light'} text-sm`}
          >
            View History
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default NFCTagCard;