import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { User, Menu, LogOut, LayoutDashboard, ShoppingCart, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import Logo from './Logo';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSelector } from '@/components/ui/language-selector';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCart } from '@/contexts/CartContext';

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage, t, isRTL } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const { totalItems } = useCart();

  // Minimum touch target size for buttons and links
  const minTouchSize = "min-h-[44px] min-w-[44px]";

  // Check if current path is dashboard
  const isDashboardPath = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin');
  
  // Handle scroll events to change navbar appearance
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Check initial auth state
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
      
      // Check if user is admin and get user data
      if (data.session) {
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.session.user.id)
          .single();
        
        if (!error && userData) {
          setIsAdmin(userData.role === 'admin');
          setUserData(userData);
        }
      }
    };
    
    checkAuth();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setIsAuthenticated(!!session);
      
      // Check if user is admin
      if (session) {
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (!error && userData) {
          setIsAdmin(userData.role === 'admin');
          setUserData(userData);
        }
      } else {
        setIsAdmin(false);
        setUserData(null);
      }
    });
    
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
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

  const switchLanguage = (newLanguage: 'en' | 'ar') => {
    setLanguage(newLanguage);
    toast({
      title: t("success"),
      description: t("languageUpdated"),
    });
  };

  const navLinkVariants = {
    initial: { opacity: 0.6, y: -5 },
    hover: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 10 }
    }
  };

  const searchVariants = {
    closed: { 
      width: "40px", 
      opacity: 0.7,
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 30 
      } 
    },
    open: { 
      width: "250px", 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 30 
      }
    }
  };

  // User menu component
  const UserMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="relative h-10 w-10 rounded-full p-0 border-2 border-primary-200"
        >
          <Avatar className="h-9 w-9">
            <AvatarImage src={userData?.avatar_url} />
            <AvatarFallback className="bg-primary-100 text-primary-800">
              {userData?.first_name?.[0] || userData?.email?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <span className="sr-only">User menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="font-medium">{userData?.first_name} {userData?.last_name}</span>
            <span className="text-xs text-muted-foreground truncate">
              {userData?.email}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link to="/dashboard">
          <DropdownMenuItem className="cursor-pointer">
            <User className="h-4 w-4 mr-2" />
            <span>{t('nav.dashboard')}</span>
          </DropdownMenuItem>
        </Link>
        {isAdmin && (
          <Link to="/admin">
            <DropdownMenuItem className="cursor-pointer">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              <span>{t('nav.admin')}</span>
            </DropdownMenuItem>
          </Link>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
          <LogOut className="h-4 w-4 mr-2" />
          <span>{t('nav.logout')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <nav 
      className={cn(
        // Base styles
        "sticky top-0 z-40 transition-all duration-300 border-b", 
        // Glassmorphism effect when scrolled
        scrolled 
          ? "backdrop-blur-md bg-white/80 dark:bg-gray-900/80" 
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className={cn("flex shrink-0", isRTL ? 'ml-6' : 'mr-6')}>
            <Logo size={88} asLink={true} />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1 mx-6 flex-1 justify-center">
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="flex items-center gap-1"
            >
              <Link to="/">
                <motion.span 
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors " + minTouchSize,
                    location.pathname === '/' 
                      ? "text-primary-700 dark:text-primary-400" 
                      : "text-gray-600 dark:text-gray-300"
                  )}
                  variants={navLinkVariants}
                  initial="initial"
                  whileHover="hover"
                >
                  {t('nav.home')}
                </motion.span>
              </Link>
              
              <Link to="/about">
                <motion.span 
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors " + minTouchSize,
                    location.pathname === '/about' 
                      ? "text-primary-700 dark:text-primary-400" 
                      : "text-gray-600 dark:text-gray-300"
                  )}
                  variants={navLinkVariants}
                  initial="initial"
                  whileHover="hover"
                >
                  {t('nav.about')}
                </motion.span>
              </Link>
              
              
              
              <Link to="/community-reports">
                <motion.span 
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors " + minTouchSize,
                    location.pathname === '/community-reports' 
                      ? "text-primary-700 dark:text-primary-400" 
                      : "text-gray-600 dark:text-gray-300"
                  )}
                  variants={navLinkVariants}
                  initial="initial"
                  whileHover="hover"
                >
                  {t('nav.community')}
                </motion.span>
              </Link>
              
              <Link to="/store">
                <motion.span 
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors " + minTouchSize,
                    location.pathname === '/store' 
                      ? "text-primary-700 dark:text-primary-400" 
                      : "text-gray-600 dark:text-gray-300"
                  )}
                  variants={navLinkVariants}
                  initial="initial"
                  whileHover="hover"
                >
                  {t('nav.store')}
                </motion.span>
              </Link>
            </motion.div>

            {/* Search bar */}
            <motion.div 
              className="flex items-center ml-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <motion.div
                className="relative"
                variants={searchVariants}
                initial="closed"
                animate={searchOpen ? "open" : "closed"}
              >
                <Input
                  type="text"
                  placeholder={searchOpen ? t('search.placeholder') : ""}
                  className={cn(
                    "h-9 pl-9 pr-4 rounded-full bg-gray-100 dark:bg-gray-800 border-none",
                    !searchOpen && "cursor-pointer"
                  )}
                  onFocus={() => setSearchOpen(true)}
                  onBlur={() => setSearchOpen(false)}
                />
                <Search 
                  className={cn(
                    "absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground",
                    searchOpen ? "opacity-100" : "opacity-70"
                  )} 
                />
              </motion.div>
            </motion.div>
          </div>

          <motion.div 
            className="hidden md:flex items-center gap-2 ml-auto"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <LanguageSelector />
            
            {isAuthenticated ? (
              <>
                {/* Shopping cart */}
                <Link to="/checkout">
              <Button 
                variant="ghost" 
                size="icon"
                className={"relative " + minTouchSize}
              >
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs bg-primary-500 text-white rounded-full">{totalItems > 0 ? totalItems : null}</span>
              </Button>
                </Link>
                
                {/* User menu */}
                <UserMenu />
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button 
                    variant="ghost"
                    className="text-gray-700 dark:text-gray-200"
                  >
                    {t('nav.login')}
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button 
                    variant="ghost"
                    className="text-gray-700 dark:text-gray-200"
                  >
                    {t('nav.signup')}
                  </Button>
                </Link>
              </>
            )}
          </motion.div>

          {/* Mobile Menu - Hide in dashboard */}
          {!isDashboardPath && (
            <div className="md:hidden flex items-center gap-2">
              {isAuthenticated && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="relative"
                  onClick={() => navigate('/checkout')}
                >
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs bg-primary-500 text-white rounded-full">{totalItems > 0 ? totalItems : null}</span>
              </Button>
              )}
              
              
              
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className={"bg-gray-100 dark:bg-gray-800 " + minTouchSize}
              >
                <Menu className="h-5 w-5" />
              </Button>
                </SheetTrigger>
                <SheetContent 
                  side={isRTL ? 'right' : 'left'} 
                  className="w-[300px] bg-white dark:bg-gray-900"
                >
                  <div className="mt-6 flow-root">
                    <div className="space-y-2">
                      {isAuthenticated && userData && (
                        <div className="flex items-center gap-3 p-3 mb-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={userData?.avatar_url} />
                            <AvatarFallback className="bg-primary-100 text-primary-800">
                              {userData?.first_name?.[0] || userData?.email?.[0]?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium">{userData?.first_name} {userData?.last_name}</span>
                            <span className="text-xs text-muted-foreground truncate">
                              {userData?.email}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      <div className="py-2 px-3">
                        <Input
                          type="text"
                          placeholder={t('search.placeholder')}
                          className="h-9 bg-gray-100 dark:bg-gray-800"
                          onChange={(e) => {
                            if (e.target.value) {
                              // Handle search
                            }
                          }}
                        />
                      </div>
                      
                      <Link 
                        to="/" 
                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {t('nav.home')}
                      </Link>
                      <Link 
                        to="/about" 
                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {t('nav.about')}
                      </Link>
                      
                      <Link 
                        to="/community-reports" 
                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {t('nav.community')}
                      </Link>
                      <Link 
                        to="/store" 
                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {t('nav.store')}
                      </Link>
                      
                      <div className="border-t pt-4 mt-4">
                        <div className="flex flex-col gap-2">
                          <LanguageSelector variant="full" className="w-full justify-start" />
                          
                          {isAuthenticated ? (
                            <>
                              {isAdmin && (
                                <Link to="/admin" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                                  <Button variant="ghost" className="w-full justify-start">
                                    <LayoutDashboard className="h-5 w-5 mr-2" />
                                    {t('nav.admin')}
                                  </Button>
                                </Link>
                              )}
                              <Link to="/dashboard" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                                <Button variant="ghost" className="w-full justify-start">
                                  <User className="h-5 w-5 mr-2" />
                                  {t('nav.dashboard')}
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                className="w-full justify-start text-destructive"
                                onClick={() => {
                                  handleLogout();
                                  setMobileMenuOpen(false);
                                }}
                              >
                                <LogOut className="h-5 w-5 mr-2" />
                                {t('nav.logout')}
                              </Button>
                            </>
                          ) : (
                            <>
                              <Link to="/auth" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                                <Button variant="ghost" className="w-full">
                                  {t('nav.login')}
                                </Button>
                              </Link>
                              <Link to="/auth" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                                <Button variant="ghost" className="w-full">
                                  {t('nav.signup')}
                                </Button>
                              </Link>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
