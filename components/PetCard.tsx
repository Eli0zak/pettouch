import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { Link } from 'react-router-dom';

interface PetCardProps {
  id: string;
  name: string;
  type: string;
  breed: string;
  imageUrl: string;
  status?: 'active' | 'lost' | 'found';
  className?: string;
}

const PetCard: React.FC<PetCardProps> = ({
  id,
  name,
  type,
  breed,
  imageUrl,
  status = 'active',
  className = '',
}) => {
  const { theme, isDark } = useTheme();
  
  // Status colors
  const statusColors = {
    active: 'bg-green-500',
    lost: 'bg-red-500',
    found: 'bg-blue-500',
  };
  
  // Card animation variants
  const cardVariants = {
    hover: {
      y: -5,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20,
      },
    },
    tap: {
      scale: 0.98,
    },
  };

  return (
    <motion.div
      className={`card-neumorphic ${isDark ? 'dark' : 'light'} overflow-hidden ${className}`}
      whileHover="hover"
      whileTap="tap"
      variants={cardVariants}
    >
      <Link to={`/pets/${id}`} className="block">
        <div className="relative aspect-square w-full overflow-hidden rounded-lg mb-4">
          {/* Pet image */}
          <img
            src={imageUrl || '/images/pet-placeholder.png'}
            alt={`${name} - ${breed}`}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
          
          {/* Status indicator */}
          <div className="absolute top-2 right-2 flex items-center">
            <span className={`${statusColors[status]} h-3 w-3 rounded-full animate-pulse-light`}></span>
            <span className="ml-1 text-xs font-medium bg-black/50 text-white px-2 py-0.5 rounded-full">
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
        </div>
        
        {/* Pet info */}
        <div>
          <h3 className="text-xl font-bold">{name}</h3>
          <div className="flex items-center justify-between mt-1">
            <p className="text-sm text-muted-foreground">{type}</p>
            <p className="text-sm text-muted-foreground">{breed}</p>
          </div>
          
          {/* Quick action buttons */}
          <div className="mt-4 flex justify-between gap-2">
            <button 
              className={`btn-neumorphic ${isDark ? 'dark' : 'light'} flex-1 py-1 text-sm flex items-center justify-center`}
              aria-label="View pet profile"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              View
            </button>
            <button 
              className={`btn-neumorphic ${isDark ? 'dark' : 'light'} flex-1 py-1 text-sm flex items-center justify-center`}
              aria-label="Generate QR code"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1zM13 12a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1v-3a1 1 0 00-1-1h-3zm1 2v1h1v-1h-1z" clipRule="evenodd" />
              </svg>
              QR Code
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default PetCard; 