import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, Search, Activity, BookOpen, 
  CreditCard, Settings, LogOut, MenuIcon, X,
  ShoppingBag, Shield, ShoppingCart, Tag, TagsIcon,
  Scan, LayoutDashboard, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

interface SidebarItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  translationKey: string;
  adminOnly?: boolean;
}

const DashboardSidebar = ({ isMobile, isOpen, setIsOpen }: { 
  isMobile: boolean;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const [isAdmin, setIsAdmin] = React.useState(false);
  
  React.useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();
          
        setIsAdmin(userData?.role === 'admin');
      }
    };
    
    checkAdminStatus();
  }, []);

  const sidebarItems: SidebarItem[] = [
    // لوحة التحكم الرئيسية
    { name: 'Overview', path: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" />, translationKey: 'dashboard.overview' },

    // إدارة الحيوانات الأليفة
    { name: 'My Pets', path: '/dashboard/pets', icon: <BookOpen className="h-5 w-5" />, translationKey: 'dashboard.totalPets' },

    // إدارة بطاقات NFC
    { name: 'NFC Tags', path: '/dashboard/tags-management', icon: <TagsIcon className="h-5 w-5" />, translationKey: 'dashboard.tagsManagement' },

    // سجلات المسح
    { name: 'Scan Records', path: '/dashboard/scan-records', icon: <Scan className="h-5 w-5" />, translationKey: 'dashboard.scanRecords' },

    // مركز المفقودات
    { name: 'Lost & Found', path: '/dashboard/lost-found', icon: <Search className="h-5 w-5" />, translationKey: 'dashboard.lostFound' },

    // المتجر والطلبات
    { name: 'Store', path: '/store', icon: <ShoppingBag className="h-5 w-5" />, translationKey: 'store' },
    { name: 'Orders', path: '/dashboard/orders', icon: <ShoppingCart className="h-5 w-5" />, translationKey: 'dashboard.orders' },

    // معلومات إضافية
    { name: 'Pet Care Tips', path: '/dashboard/tips', icon: <Zap className="h-5 w-5" />, translationKey: 'dashboard.petCareTips' },

    // الإدارة
    { name: 'Subscription', path: '/dashboard/subscription', icon: <CreditCard className="h-5 w-5" />, translationKey: 'dashboard.subscription' },
    { name: 'Settings', path: '/dashboard/settings', icon: <Settings className="h-5 w-5" />, translationKey: 'settings.title' },
    { name: 'Admin Panel', path: '/admin', icon: <Shield className="h-5 w-5" />, translationKey: 'ADMIN', adminOnly: true },
  ];

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: t("success"),
        description: t("You've been logged out successfully."),
      });
      navigate('/');
    } catch (error: any) {
      toast({
        title: t("error"),
        description: error.message || t("An error occurred during logout."),
        variant: "destructive",
      });
    }
  };

  const filteredSidebarItems = sidebarItems.filter(item => 
    !item.adminOnly || (item.adminOnly && isAdmin)
  );

  const mobileSidebarClass = isOpen 
    ? `fixed inset-y-0 left-0 w-64 transform translate-x-0 transition-transform duration-300 ease-in-out z-20 bg-card dark:bg-card border-r shadow-lg overflow-y-auto` 
    : `fixed inset-y-0 left-0 w-64 transform -translate-x-full transition-transform duration-300 ease-in-out z-20 bg-card dark:bg-card border-r shadow-lg overflow-y-auto`;

  // New function to check if a route is active
  const isRouteActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const content = (
    <div className="h-full flex flex-col bg-card dark:bg-card border-r shadow-md">
      {isMobile && (
        <div className="p-4 flex justify-between items-center border-b">
          <Logo size={80} />
          <Button variant="ghost" size="icon" className="min-h-[44px] min-w-[44px]" aria-label="Close sidebar" onClick={() => setIsOpen(false)}>
            <X className="h-6 w-6" />
          </Button>
        </div>
      )}
      
      <nav className="flex-1 p-5 overflow-y-auto">
        <ul className="space-y-2.5">
          {filteredSidebarItems.map((item) => {
            const isActive = isRouteActive(item.path);
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center p-3 rounded-lg group transition-all duration-200 ${
                    isActive 
                      ? 'bg-primary/10 text-primary dark:bg-primary/20 shadow-sm' 
                      : 'hover:bg-primary/5 text-foreground hover:text-primary dark:text-foreground dark:hover:bg-primary/10'
                  }`}
                  onClick={() => isMobile && setIsOpen(false)}
                  style={{ minHeight: '44px', minWidth: '44px' }}
                >
                  <span className={`${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`}>
                    {item.icon}
                  </span>
                  <span className={`ml-3 font-medium ${isActive ? 'text-primary' : ''}`}>
                    {t(item.translationKey) || item.name}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
        {isMobile && (
          <div className="mt-6 flex justify-center">
            <ThemeToggle />
          </div>
        )}
      </nav>
      
      <div className="p-5 border-t">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full flex items-center justify-center text-foreground hover:text-primary hover:bg-primary/5 transition-colors min-h-[44px]"
        >
          <LogOut className="h-5 w-5 mr-2" />
          <span className="font-medium">{t("nav.logout")}</span>
        </Button>
      </div>
    </div>
  );
  
  return (
    <>
      {isMobile ? (
        <>
          <div className={mobileSidebarClass} role="dialog" aria-modal="true" aria-label="Sidebar navigation">
            {content}
          </div>
          {isOpen && (
            <div 
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-10"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />
          )}
        </>
      ) : (
        <div className="w-64 h-full" role="complementary" aria-label="Sidebar navigation">{content}</div>
      )}
    </>
  );
};

export default DashboardSidebar;
