import React, { useState, useEffect } from 'react';
import DashboardSidebar from './DashboardSidebar';
import { MenuIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import ThemeToggle from './ThemeToggle';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { language } = useLanguage();
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-background" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {isMobile && (
        <div className="sticky top-0 z-10 bg-card border-b shadow-sm p-4 flex items-center justify-between">
          <span className="text-xl font-bold bg-gradient-to-r from-pet-primary to-pet-secondary bg-clip-text text-transparent">
            PetTouch
          </span>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
              <MenuIcon className="h-6 w-6" />
            </Button>
          </div>
        </div>
      )}
      
      <div className="flex h-[calc(100vh-60px)]">
        <DashboardSidebar 
          isMobile={isMobile} 
          isOpen={sidebarOpen} 
          setIsOpen={setSidebarOpen} 
        />
        
        <main className={`flex-1 overflow-auto p-4 md:p-6 ${isMobile ? 'w-full' : ''}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
