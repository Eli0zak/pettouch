import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { PawPrint } from 'lucide-react';

interface TeamMemberProps {
  name: string;
  petName: string;
  role: string;
  bio: string;
  image: string;
  petImage?: string;
}

const TeamMember: React.FC<TeamMemberProps> = ({
  name,
  petName,
  role,
  bio,
  image,
  petImage,
}) => {
  const { isDark } = useTheme();

  return (
    <motion.div
      className={cn(
        "rounded-2xl overflow-hidden",
        "transform transition-all duration-300",
        isDark ? "bg-card" : "bg-white",
        "shadow-lg hover:shadow-xl"
      )}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={`${name} from PetTouch team`}
          className="w-full h-full object-cover"
        />
        
        {/* Pet Image Overlay */}
        {petImage && (
          <motion.div
            className="absolute bottom-4 right-4 w-16 h-16 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg"
            whileHover={{ scale: 1.1 }}
          >
            <img
              src={petImage}
              alt={`${name}'s pet ${petName}`}
              className="w-full h-full object-cover"
            />
          </motion.div>
        )}

        {/* Decorative Element */}
        <motion.div 
          className={cn(
            "absolute -top-6 -right-6 h-16 w-16 border-4 rounded-xl rotate-12",
            "flex items-center justify-center",
            isDark 
              ? "border-accent-1 bg-gray-800" 
              : "border-brutalism-border bg-accent-1"
          )}
          whileHover={{
            scale: 1.1,
            rotate: 0,
            transition: { type: "spring" }
          }}
        >
          <PawPrint 
            className={cn(
              "h-8 w-8", 
              isDark ? "text-accent-1" : "text-brutalism-border"
            )} 
          />
        </motion.div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className={cn(
            "text-xl font-semibold font-ibm-plex-sans",
            isDark ? "text-white" : "text-[#2D2D2D]"
          )}>
            {name} & {petName}
          </h3>
          <p className={cn(
            "text-sm font-medium mt-1",
            isDark ? "text-white/70" : "text-[#2D2D2D]/70"
          )}>
            {role}
          </p>
        </div>

        <p className={cn(
          "text-base leading-relaxed font-ibm-plex-sans",
          isDark ? "text-white/80" : "text-[#2D2D2D]/80"
        )}>
          {bio}
        </p>
      </div>
    </motion.div>
  );
};

export default TeamMember;
