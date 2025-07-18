import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface ValueCardProps {
  title: string;
  visual: React.ReactNode;
  description?: string;
  testimonial?: string;
  testimonialAuthor?: string;
}

const ValueCard: React.FC<ValueCardProps> = ({
  title,
  visual,
  description,
  testimonial,
  testimonialAuthor,
}) => {
  const { isDark } = useTheme();

  return (
    <motion.div
      className={cn(
        "rounded-2xl p-6 h-full",
        "transform transition-all duration-300",
        isDark ? "bg-card hover:bg-card/80" : "bg-white hover:bg-gray-50",
        "shadow-lg hover:shadow-xl"
      )}
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {/* Visual Element */}
      <div className="mb-6 relative aspect-square rounded-xl overflow-hidden">
        {visual}
      </div>

      {/* Title */}
      <h3 className={cn(
        "text-xl font-semibold mb-4 font-ibm-plex-sans",
        isDark ? "text-white" : "text-[#2D2D2D]"
      )}>
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className={cn(
          "text-base mb-4",
          isDark ? "text-white/80" : "text-[#2D2D2D]/80"
        )}>
          {description}
        </p>
      )}

      {/* Testimonial */}
      {testimonial && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <blockquote className={cn(
            "text-sm italic mb-2",
            isDark ? "text-white/80" : "text-[#2D2D2D]/80"
          )}>
            "{testimonial}"
          </blockquote>
          {testimonialAuthor && (
            <p className="text-sm font-medium text-primary-600 dark:text-primary-400">
              — {testimonialAuthor}
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default ValueCard;
