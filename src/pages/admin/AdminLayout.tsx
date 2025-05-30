import React, { useState, useEffect, Suspense } from 'react';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import TranslationDebugger from '@/components/TranslationDebugger';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import ThemeToggle from '@/components/ThemeToggle';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { 
  LayoutDashboard, 
  Users, 
  Tag as TagIcon, 
  Search, 
  ShoppingBag, 
  LogOut, 
  Menu,
  ChevronRight,
  ChevronLeft,
  Home,
  Settings,
  ArrowUpRightSquare,
  Package,
  Store,
  X
} from 'lucide-react';
import Logo from '@/components/Logo';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [adminName, setAdminName] = useState('Administrator');
  const [pendingOrders, setPendingOrders] = useState(0);
  const [openReports, setOpenReports] = useState(0);
  const [pendingUpgrades, setPendingUpgrades] = useState(0);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          toast({
            title: "Unauthorized",
            description: "You must be logged in to access this page.",
            variant: "destructive"
          });
          navigate('/auth');
          return;
        }
        
        // Check if user is admin
        const { data, error } = await supabase
          .from('users')
          .select('role, first_name, last_name')
          .eq('id', user.id)
          .single();
        
        if (error || data?.role !== 'admin') {
          toast({
            title: "Access Denied",
            description: "You don't have permission to access the admin panel.",
            variant: "destructive"
          });
          navigate('/dashboard');
          return;
        }
        
        // Set admin name
        if (data.first_name || data.last_name) {
          setAdminName(`${data.first_name || ''} ${data.last_name || ''}`.trim());
        }

        // Fetch pending orders count
        const { count: pendingCount } = await supabase
          .from('store_orders')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');
        
        if (pendingCount !== null) {
          setPendingOrders(pendingCount);
        }
        
        // Fetch open reports count
        const { count: openCount } = await supabase
          .from('lost_found_posts')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'open');
        
        if (openCount !== null) {
          setOpenReports(openCount);
        }

        // Fetch pending upgrade requests count
        const { count: upgradeCount } = await supabase
          .from('subscription_requests')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');
        
        if (upgradeCount !== null) {
          setPendingUpgrades(upgradeCount);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        toast({
          title: "Error",
          description: "There was an error verifying your access.",
          variant: "destructive"
        });
        navigate('/');
      }
    };
    
    checkAdminStatus();
    
    // Set up a polling interval for refreshing counts
    const interval = setInterval(() => {
      checkAdminStatus();
    }, 60000); // refresh every minute
    
    return () => clearInterval(interval);
  }, [navigate, toast, t]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Success",
        description: "You've been logged out successfully."
      });
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Error",
        description: "There was an error logging you out.",
        variant: "destructive"
      });
    }
  };

  // Navigation items
  const navItems = [
    { 
      name: 'Dashboard', 
      path: '/admin', 
      icon: <LayoutDashboard size={20} />,
      badge: null
    },
    { 
      name: 'Users', 
      path: '/admin/users', 
      icon: <Users size={20} />,
      badge: null
    },
    { 
      name: 'Pets', 
      path: '/admin/pets', 
      icon: <TagIcon size={20} />,
      badge: null
    },
    {
      name: 'NFC Tags',
      path: '/admin/tags',
      icon: <TagIcon size={20} />,
      badge: null
    },
    { 
      name: 'Lost & Found', 
      path: '/admin/lost-found', 
      icon: <Search size={20} />,
      badge: openReports > 0 ? openReports : null
    },
    { 
      name: 'Products', 
      path: '/admin/products', 
      icon: <Package size={20} />,
      badge: null
    },
    { 
      name: 'Orders', 
      path: '/admin/orders', 
      icon: <ShoppingBag size={20} />,
      badge: pendingOrders > 0 ? pendingOrders : null
    },
    {
      name: 'Upgrade Requests',
      path: '/admin/upgrade-requests',
      icon: <ArrowUpRightSquare size={20} />,
      badge: pendingUpgrades > 0 ? pendingUpgrades : null
    }
  ];

  // Determine if path is active
  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="h-screen flex flex-col bg-background" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Mobile header */}
      <header className="bg-card border-b p-4 flex justify-between items-center md:hidden shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        >
          <Menu />
        </Button>
        
        <div className="flex items-center gap-2">
          <Logo size={32} />
          <span className="font-bold text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Admin</span>
        </div>

        <ThemeToggle />
      </header>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
        <SheetContent side={language === 'ar' ? 'right' : 'left'} className="w-[300px] p-0 bg-card">
          <div className="flex flex-col h-full">
            <div className="p-5 flex items-center justify-between border-b">
              <div className="flex items-center gap-2">
                <Logo size={32} />
                <span className="font-bold text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Admin Panel</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileSidebarOpen(false)}
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            
            <nav className="flex-1 p-5">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center mb-2 p-3 rounded-lg transition-all duration-200 ${
                    isActivePath(item.path) 
                      ? 'bg-primary/10 text-primary shadow-sm' 
                      : 'text-foreground hover:bg-primary/5 hover:text-primary'
                  }`}
                  onClick={() => setIsMobileSidebarOpen(false)}
                >
                  {item.icon}
                  <span className="ml-3 font-medium">{t(item.name)}</span>
                  {item.badge && (
                    <Badge variant="destructive" className="ml-auto">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              ))}
            </nav>
            
            <div className="p-5 border-t">
              <Button
                variant="outline"
                className="w-full flex items-center justify-start hover:bg-primary/5 transition-colors"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span className="font-medium">{t("Logout")}</span>
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <div className={`hidden md:block ${isSidebarCollapsed ? 'w-20' : 'w-64'} bg-card border-r transition-all duration-300 shadow-sm`}>
          <div className="flex flex-col h-full">
            <div className="p-4 flex items-center justify-between border-b">
              {!isSidebarCollapsed && (
                <>
                  <Logo size={32} />
                  <span className="font-bold text-xl ml-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Admin</span>
                </>
              )}
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className={isSidebarCollapsed ? 'mx-auto' : 'ml-auto'}
              >
                {language === 'ar' 
                  ? (isSidebarCollapsed ? <ChevronLeft /> : <ChevronRight />)
                  : (isSidebarCollapsed ? <ChevronRight /> : <ChevronLeft />)
                }
              </Button>
            </div>
            
            <div className="p-4 border-b">
              {!isSidebarCollapsed ? (
                <div className="font-medium">
                  {adminName}
                  <div className="text-xs text-muted-foreground">
                    {t("Administrator")}
                  </div>
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto font-bold text-primary">
                  {adminName[0]}
                </div>
              )}
            </div>
            
            <nav className="flex-1 py-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : ''} mb-1 p-3 mx-2 rounded-lg transition-all duration-200 ${
                    isActivePath(item.path) 
                      ? 'bg-primary/10 text-primary shadow-sm' 
                      : 'text-foreground hover:bg-primary/5 hover:text-primary'
                  }`}
                >
                  <span className={isActivePath(item.path) ? 'text-primary' : ''}>{item.icon}</span>
                  {!isSidebarCollapsed && <span className="ml-3 font-medium">{t(item.name)}</span>}
                  {!isSidebarCollapsed && item.badge && (
                    <Badge variant="destructive" className="ml-auto">
                      {item.badge}
                    </Badge>
                  )}
                  {isSidebarCollapsed && item.badge && (
                    <Badge variant="destructive" className="absolute top-0 right-0 -mt-1 -mr-1 w-5 h-5 flex items-center justify-center p-0 text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              ))}
            </nav>
            
            <div className="p-4 border-t flex justify-between items-center">
              <ThemeToggle />
              
              {!isSidebarCollapsed && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="hover:bg-primary/5 transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span className="font-medium">{t("Logout")}</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Desktop header */}
          <header className="bg-card border-b p-4 hidden md:flex justify-between items-center shadow-sm">
            <div className="flex items-center">
              <Button variant="outline" size="sm" asChild className="hover:bg-primary/5 transition-colors">
                <Link to="/dashboard" className="flex items-center">
                  <Home className="h-4 w-4 mr-2" />
                  <span className="font-medium">{t("Back to Dashboard")}</span>
                </Link>
              </Button>
              
              <Separator orientation="vertical" className="mx-4 h-6" />
              
              <h1 className="font-semibold text-lg bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                {navItems.find(item => isActivePath(item.path))?.name 
                  ? t(navItems.find(item => isActivePath(item.path))!.name)
                  : t("Admin Dashboard")
                }
              </h1>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" asChild className="hover:bg-primary/5 transition-colors">
                <Link to="/store" className="flex items-center">
                  <Store className="h-4 w-4 mr-2" />
                  <span className="font-medium">{t("Visit Store")}</span>
                </Link>
              </Button>
            </div>
          </header>
          
          {/* Admin content */}
          <main className="flex-1 overflow-auto p-6">
            <Suspense fallback={<div className="flex justify-center items-center h-full"><LoadingSpinner size="lg" /></div>}>
              <Outlet />
            </Suspense>
          </main>
        </div>
      </div>
      
      {/* Add the translation debugger */}
      <TranslationDebugger />
    </div>
  );
};

export default AdminLayout;
