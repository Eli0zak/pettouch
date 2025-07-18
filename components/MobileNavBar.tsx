import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Menu, Tag, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger
} from "@/components/ui/sheet";
import { useLanguage } from '@/contexts/LanguageContext';
import Logo from './Logo';

export const MobileNavBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, isRTL } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  // التحقق من الصفحة الحالية النشطة
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const navItems = [
    {
      name: t('nav.home'),
      path: '/',
      icon: <Home className="h-8 w-8" />
    },
    {
      name: t('nav.store'),
      path: '/store',
      icon: <Tag className="h-8 w-8" />
    },
    {              name: t('nav.pets'),
      path: '/dashboard/pets',
      icon: <Logo size={50} useSvg={true} showText={false} asLink={false} />
    },
    {
      name: t('nav.profile'),
      path: '/dashboard',
      icon: <User className="h-8 w-8" />
    }
  ];

  // عدم عرض شريط التنقل في بعض الصفحات مثل صفحة المصادقة
  if (location.pathname === '/auth' || location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-t border-border shadow-md md:hidden">
      <div className="flex h-16 max-h-16 items-center justify-around">
        {navItems.map((item) => (
          <Button
            key={item.path}
            variant="ghost"
            className={cn(
              "flex-1 flex-col items-center justify-center rounded-none h-full transition-all",
              isActive(item.path) 
                ? "bg-muted text-pet-primary font-medium shadow-sm border-t-2 border-pet-primary" 
                : "text-muted-foreground hover:bg-background hover:text-pet-primary"
            )}
            onClick={() => navigate(item.path)}
          >
            <div className="flex flex-col items-center">
              {item.icon}
              <span className="text-[10px] mt-1 max-w-[80px] truncate">{item.name}</span>
            </div>
          </Button>
        ))}
        
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              className={cn(
                "flex-1 flex-col items-center justify-center rounded-none h-full transition-all",
                isMenuOpen 
                  ? "bg-muted text-pet-primary font-medium"
                  : "text-muted-foreground hover:bg-background hover:text-pet-primary"
              )}
              onClick={() => setIsMenuOpen(true)}
            >
              <div className="flex flex-col items-center">
                <Menu className="h-7 w-7" />
                <span className="text-[10px] mt-1">{t('nav.menu')}</span>
              </div>
            </Button>
          </SheetTrigger>
          <SheetContent side={isRTL ? 'right' : 'left'} className="w-[85%] max-w-[320px]">
            <div className="flex justify-start mt-4 mb-8">
              <Logo size={90} />
            </div>
            <div className="flex flex-col gap-4">
              <Button 
                variant="ghost"
                className="justify-start"
                onClick={() => {
                  setIsMenuOpen(false);
                  navigate('/about');
                }}
              >
                {t('nav.about')}
              </Button>
          
              <Button 
                variant="ghost"
                className="justify-start"
                onClick={() => {
                  setIsMenuOpen(false);
                  navigate('/community-reports');
                }}
              >
                {t('nav.community')}
              </Button>
              <Button 
                variant="ghost"
                className="justify-start"
                onClick={() => {
                  setIsMenuOpen(false);
                  navigate('/dashboard/settings');
                }}
              >
                {t('settings.title')}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default MobileNavBar; 