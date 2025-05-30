import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { retrySupabaseQuery } from '@/utils/supabaseUtils';
import { logger } from '@/utils/logger';

// Create a context for auth state to avoid repeated checks
import { createContext, useContext } from 'react';

interface AuthState {
  isAuthenticated: boolean | null;
  isAdmin: boolean | null;
  userId: string | null;
  loading: boolean;
}

const AuthContext = createContext<AuthState>({
  isAuthenticated: null,
  isAdmin: null,
  userId: null,
  loading: true
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: null,
    isAdmin: null,
    userId: null,
    loading: true
  });
  
  const { toast } = useToast();
  
  useEffect(() => {
    const checkAuth = async () => {
      logger.info('Checking authentication state');
      try {
        // Get current session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        logger.info('Auth session', { hasSession: !!sessionData.session });
        
        if (sessionError) {
          logger.error('Session error', { error: sessionError });
          throw sessionError;
        }
        
        if (!sessionData.session) {
          logger.info('No active session found');
          setAuthState({
            isAuthenticated: false,
            isAdmin: false,
            userId: null,
            loading: false
          });
          return;
        }

        const userId = sessionData.session.user.id;
        
        // Check user role directly without retry mechanism for now
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', userId)
          .single();
        
        if (userError) {
          logger.error('Error fetching user role', { error: userError, userId });
          toast({
            title: "Error",
            description: "Failed to verify admin status. Please try refreshing the page.",
            variant: "destructive",
          });
          throw userError;
        }

        logger.info('User data fetched', { userData, userId });
        const isAdmin = userData?.role === 'admin';
        logger.info('User admin status', { isAdmin, userId });
          
        setAuthState({
          isAuthenticated: true,
          isAdmin: isAdmin,
          userId: userId,
          loading: false
        });
      } catch (error) {
        logger.error('Authentication check failed', { error });
        setAuthState({
          isAuthenticated: false,
          isAdmin: false,
          userId: null,
          loading: false
        });
        toast({
          title: "Authentication Error",
          description: "Failed to verify your authentication status. Please try logging in again.",
          variant: "destructive",
        });
      }
    };
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        logger.info('Auth state change', { event, hasSession: !!session });
        if (event === 'SIGNED_IN' && session) {
          checkAuth();
        } else if (event === 'SIGNED_OUT') {
          setAuthState({
            isAuthenticated: false,
            isAdmin: false,
            userId: null,
            loading: false
          });
        }
      }
    );
    
    checkAuth();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);
  
  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
};

interface PageGuardProps {
  requireAuth?: boolean;
  requireAdmin?: boolean;
  children: React.ReactNode;
}

const PageGuard: React.FC<PageGuardProps> = ({ 
  requireAuth = false, 
  requireAdmin = false,
  children 
}) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const { t } = useLanguage();
  
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-primary"></div>
      </div>
    );
  }
  
  useEffect(() => {
    if (requireAuth && !isAuthenticated && !loading) {
      toast({
        title: t('auth.required') || 'Authentication Required',
        description: t('auth.pleaseLogin') || 'Please login to access this page',
        variant: "destructive",
      });
    }
  }, [requireAuth, isAuthenticated, loading, toast, t]);

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }
  
  useEffect(() => {
    if (requireAdmin && isAdmin === false && !loading) {
      logger.warn('Access denied: Admin privileges required', { 
        isAuthenticated, 
        isAdmin, 
        path: location.pathname 
      });
      toast({
        title: t('access.denied') || 'Access Denied',
        description: t('access.adminRequired') || 'Admin privileges required',
        variant: "destructive",
      });
    }
  }, [requireAdmin, isAdmin, loading, toast, t, logger, location.pathname, isAuthenticated]);

  if (requireAdmin) {
    if (isAdmin === null) {
      logger.info('Admin status is loading');
      return null;
    }
    
    if (!isAdmin) {
      return <Navigate to="/dashboard" replace />;
    }
  }
  
  return <>{children}</>;
};

export default PageGuard;
