import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { ArrowRight, ArrowDown, PawPrint } from 'lucide-react';
import mainImage from '@/assets/main.png';
import catImage from '@/assets/cat.png';

const Hero = () => {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // For parallax scroll effect
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  
  const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, 50]);
  
  // Gradient animation
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const { clientX, clientY } = event;
      const rect = containerRef.current?.getBoundingClientRect();
      
      if (!rect) return;
      
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      
      mouseX.set(x);
      mouseY.set(y);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [mouseX, mouseY]);
  
  const background = useMotionTemplate`radial-gradient(
    650px circle at ${mouseX}px ${mouseY}px,
    rgba(100, 100, 255, 0.15),
    transparent 80%
  )`;
  
  // For smooth text and button animations
  const textOpacitySpring = useSpring(1, {
    stiffness: 100,
    damping: 30
  });
  
  const textY = useSpring(0, {
    stiffness: 100,
    damping: 30
  });
  
  useEffect(() => {
    scrollYProgress.onChange((latest) => {
      textOpacitySpring.set(1 - latest * 1.5);
      textY.set(latest * 100);
    });
  }, [scrollYProgress, textOpacitySpring, textY]);
  
  return (
    <div 
      ref={containerRef}
      className="relative overflow-hidden w-full min-h-[90vh] flex items-center py-16 md:py-24"
    >
      {/* Gradient overlay - moves with mouse */}
      <motion.div 
        className="absolute inset-0 z-0 opacity-60"
        style={{ background }}
        aria-hidden="true"
      />
      
      {/* Abstract background shapes */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Gradient circle - top right */}
        <motion.div 
          className={cn(
            "absolute -top-10 -right-10 w-72 h-72 rounded-full blur-3xl opacity-40",
            isDark ? "bg-blue-500" : "bg-primary-300"
          )}
          animate={{
            scale: [1, 1.05, 1],
            x: [0, 10, 0],
            y: [0, -10, 0],
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity,
            repeatType: "reverse"
          }}
          style={{ y: y1 }}
        />
        
        {/* Gradient circle - bottom left */}
        <motion.div 
          className={cn(
            "absolute -bottom-20 -left-20 w-96 h-96 rounded-full blur-3xl opacity-30",
            isDark ? "bg-purple-500" : "bg-accent-2"
          )}
          animate={{
            scale: [1, 1.1, 1],
            x: [0, -10, 0],
            y: [0, 15, 0],
          }}
          transition={{ 
            duration: 12, 
            repeat: Infinity,
            repeatType: "reverse",
            delay: 1
          }}
          style={{ y: y2 }}
        />
        
        {/* Floating elements */}
        <div className="absolute inset-0">
          {/* Floating paws - brutalist element */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className={cn(
                "absolute",
                isDark ? "text-primary-400" : "text-primary-600"
              )}
              style={{
                left: `${15 + i * 12}%`,
                top: `${20 + (i % 3) * 20}%`,
                scale: 0.5 + (i % 3) * 0.3,
                opacity: 0.2 + (i % 3) * 0.1,
              }}
              animate={{
                y: [0, -15, 0],
                rotate: [0, i % 2 ? 10 : -10, 0],
              }}
              transition={{
                duration: 3 + i,
                repeat: Infinity,
                repeatType: "reverse",
                delay: i * 0.5,
              }}
            >
              <PawPrint size={32} />
            </motion.div>
          ))}
        </div>
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative z-10"
            style={{ 
              opacity: textOpacitySpring,
              y: textY 
            }}
          >
            <motion.span 
              className="inline-block mb-4 text-sm font-medium px-4 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {t('home.hero.badge')}
            </motion.span>
            
              <motion.h1 
                className="text-4xl md:text-6xl lg:text-7xl font-semibold mb-6 tracking-tight font-ibm-plex-sans"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {t('home.hero.title')}
              </motion.h1>
              
              <motion.p 
                className="text-lg md:text-xl text-[#2D2D2D] dark:text-[#E5E5E5] mb-8 max-w-lg leading-relaxed font-ibm-plex-sans"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                {t('home.hero.description')}
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <Link to="/get-started">
                  <Button 
                    className="relative overflow-hidden bg-[#FF9900] hover:bg-[#cc7a00] text-white rounded-lg px-8 py-6 text-lg font-semibold font-ibm-plex-sans"
                    size="lg"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      {t('home.hero.cta')}
                      <motion.span
                        initial={{ x: -5, opacity: 0.5 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{
                          repeat: Infinity,
                          repeatType: "mirror",
                          duration: 0.8,
                        }}
                      >
                        <ArrowRight className="h-5 w-5" />
                      </motion.span>
                    </span>
                    
                    {/* Button hover effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-[#FF9900] to-[#cc7a00] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"
                      style={{ zIndex: 0 }}
                    />
                  </Button>
                </Link>
              </motion.div>
          </motion.div>
          
          <motion.div 
            className="relative lg:ml-auto"
            style={{ y: y3 }}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {/* Main image with glassmorphism card effect */}
            <div className="relative z-10">
              <motion.div 
                className={cn(
                  "rounded-2xl overflow-hidden shadow-2xl transform lg:rotate-3 transition-all",
                  isDark ? "shadow-primary-800/20" : "shadow-primary-200"
                )}
                whileHover={{ 
                  scale: 1.02,
                  rotate: 0,
                  transition: { type: "spring", stiffness: 300, damping: 25 }
                }}
              >
                {/* Glassmorphism effect overlay */}
                {/* Removed blur overlay to remove blur effect on photo */}
                {/* <div className="absolute inset-0 backdrop-blur-sm bg-white/20 dark:bg-black/20 z-10 rounded-2xl" /> */}
                
                <img 
                  src={mainImage}
                alt="A confident pet parent enjoying peace of mind with their beloved pet" 
                  className="w-full h-full rounded-lg object-cover"
                />
              </motion.div>
              
      
              
              {/* Neo-brutalism decorative element */}
              <motion.div 
                className={cn(
                  "absolute -top-6 -right-6 h-20 w-20 border-8 rounded-xl rotate-12",
                  "flex items-center justify-center",
                  isDark 
                    ? "border-accent-1 bg-gray-800" 
                    : "border-brutalism-border bg-accent-1"
                )}
                initial={{ opacity: 0, scale: 0.8, rotate: 25 }}
                animate={{ opacity: 1, scale: 1, rotate: 12 }}
                transition={{ duration: 0.5, delay: 1 }}
                whileHover={{
                  scale: 1.1,
                  rotate: 0,
                  transition: { type: "spring" }
                }}
              >
                <PawPrint 
                  className={cn(
                    "h-10 w-10", 
                    isDark ? "text-accent-1" : "text-brutalism-border"
                  )} 
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <motion.div
          className="w-8 h-12 rounded-full border-2 border-muted-foreground flex items-center justify-center"
          animate={{ y: [0, 5, 0] }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity, 
            repeatType: "loop" 
          }}
        >
          <motion.div
            className="w-1.5 h-3 rounded-full bg-primary-500"
            animate={{ 
              y: [0, 4, 0],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              repeatType: "loop" 
            }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Hero;
