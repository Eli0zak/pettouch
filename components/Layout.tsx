import React, { useEffect, lazy, Suspense, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import TranslationDebugger from './TranslationDebugger';
import { supabase } from '@/integrations/supabase/client';
import ThemeToggle from './ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import MobileNavBar from './MobileNavBar';

// Lazy load components for better performance
const AutoLocationPermissionRequest = lazy(() => import('./AutoLocationPermissionRequest'));
// Note: We've created both .tsx and .jsx versions of this component to ensure compatibility

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { dir, isRTL } = useLanguage();
  const { isDark } = useTheme();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  
  // Check if current page is dashboard or admin
  const isDashboardPath = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin');

  useEffect(() => {
    // Handle scroll events for parallax and other effects
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Check if user is admin
    const checkIfAdmin = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (data.session) {
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', data.session.user.id)
          .single();
        
        setIsAdmin(userData?.role === 'admin' || false);
      }
    };
    
    checkIfAdmin();
  }, []);
  
  // Determine whether to show debugger
  const showDebugger = process.env.NODE_ENV === 'development' || isAdmin;
  
  // Animation variants for page transitions
  const pageTransition = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.3 }
  };

  // Animated background shapes
  const BackgroundShapes = () => (
    <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
      <motion.div 
        className={cn(
          "absolute top-20 right-[10%] w-64 h-64 rounded-full filter blur-3xl opacity-20",
          isDark ? "bg-primary-600" : "bg-primary-400"
        )}
        animate={{ 
          x: [0, 10, 0], 
          y: [0, 15, 0],
          scale: [1, 1.05, 1]
        }}
        transition={{ 
          duration: 20,
          repeat: Infinity,
          repeatType: "reverse" 
        }}
        style={{ 
          translateY: scrollY * -0.05
        }}
      />
      <motion.div 
        className={cn(
          "absolute bottom-40 left-[5%] w-72 h-72 rounded-full filter blur-3xl opacity-10",
          isDark ? "bg-accent-3" : "bg-accent-2"
        )}
        animate={{ 
          x: [0, -20, 0], 
          y: [0, 20, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          duration: 25, 
          repeat: Infinity,
          repeatType: "reverse",
          delay: 1 
        }}
        style={{ 
          translateY: scrollY * 0.03
        }}
      />
      <motion.div 
        className={cn(
          "absolute top-[40%] left-[40%] w-96 h-96 rounded-full filter blur-3xl opacity-10",
          isDark ? "bg-accent-1" : "bg-accent-1"
        )}
        animate={{ 
          x: [0, 15, 0], 
          y: [0, -15, 0],
          scale: [1, 0.95, 1]
        }}
        transition={{ 
          duration: 30,
          repeat: Infinity,
          repeatType: "reverse",
          delay: 2 
        }}
        style={{ 
          translateY: scrollY * -0.02
        }}
      />
    </div>
  );
  
  return (
    <div 
      dir={dir()} 
      className={cn(
        "min-h-screen flex flex-col", 
        isRTL ? 'rtl' : 'ltr',
        isDark 
          ? 'bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-gray-100' 
          : 'bg-gradient-to-b from-gray-50 via-white to-gray-50 text-gray-900',
        "transition-colors duration-500"
      )}
    >
      {/* Animated background */}
      <BackgroundShapes />
      
      {/* Main content */}
      <div className="relative z-10 flex flex-col flex-grow">
        {!isDashboardPath && (
          <Navbar />
        )}
        
        <AnimatePresence mode="wait">
          <motion.main 
            key={location.pathname}
            className={cn(
              "flex-grow", 
              isDashboardPath ? 'pt-0' : '', 
              !isDashboardPath ? 'pb-0' : '',
              // Add bottom padding on mobile for the nav bar
              "pb-16 md:pb-0"
            )}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageTransition}
          >
            {children || <Outlet />}
          </motion.main>
        </AnimatePresence>
        
        {!isDashboardPath && <Footer />}
        
        {/* Mobile navigation for non-dashboard pages */}
        {!isDashboardPath && <MobileNavBar />}
        
        {/* Fixed position theme toggle in the bottom right */}
        <div className="fixed bottom-20 md:bottom-6 right-6 z-50">
          <ThemeToggle />
        </div>
        
        {/* Show TranslationDebugger only in development or for admin users */}
        {showDebugger && <TranslationDebugger />}
        
        {/* Lazy loaded location permission request */}
        <Suspense fallback={null}>
          <AutoLocationPermissionRequest />
        </Suspense>
      </div>
    </div>
  );
};

export default Layout;
