import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { PlusCircle, AlertCircle, ArrowUpRight, User, Clock, CreditCard, Layers } from 'lucide-react';
import { UserAvatar } from '@/components/ui/user-avatar';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { retrySupabaseQuery } from '@/utils/supabaseUtils';
import { logger } from '@/utils/logger';

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPets: 0,
    recentScans: 0,
    currentPlan: 'Free',
    petLimit: 1 // Default for free plan
  });
  const navigate = useNavigate();

  const fetchDashboardData = async (userId: string) => {
    try {
      // Fetch pet count from supabase
      const { count: petsCount, error: petsError } = await supabase
        .from('pets')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', userId);
        
      if (petsError) {
        logger.error("Error fetching pet count", { error: petsError, userId });
        return;
      }

      // Fetch recent scans with retry
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: scansCount, error: scansError } = await supabase
        .from('nfc_scans')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', thirtyDaysAgo.toISOString());
        
      if (scansError) {
        logger.error("Error fetching scans count", { error: scansError, userId });
      }
      
      // Fetch user plan
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('plan')
        .eq('id', userId)
        .single();
        
      if (userError) {
        logger.error("Error fetching user plan", { error: userError, userId });
        return;
      }
      
      const plan = (userData as any)?.plan || 'free';
      
      // Set pet limits based on plan
      let petLimit = 1; // Default for free plan
      if (plan === 'comfort') {
        petLimit = 3;
      } else if (plan === 'rescue') {
        petLimit = 999; // Unlimited
      }
      
      // Format plan name for display
      const formattedPlan = plan.charAt(0).toUpperCase() + plan.slice(1);
      
      setStats({
        totalPets: petsCount || 0,
        recentScans: scansCount || 0,
        currentPlan: formattedPlan,
        petLimit: petLimit
      });
    } catch (error) {
      logger.error('Error fetching dashboard data', { error, userId });
    }
  };

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (data?.user) {
          setUser(data.user);
          await fetchDashboardData(data.user.id);
        }
      } catch (error) {
        logger.error('Error fetching user data', { error });
      } finally {
        setLoading(false);
      }
    };
    
    getUser();
    
    // Set up subscription for real-time updates to user data
    const userChannel = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        await fetchDashboardData(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        navigate('/auth');
      }
    });
    
    // Set up subscription for real-time updates to user plan
    const planChannel = supabase
      .channel('user-plan-dashboard')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'users',
        filter: user ? `id=eq.${user.id}` : undefined
      }, async (payload) => {
        logger.info("User data changed in dashboard", { payload: payload.new, userId: user?.id });
        if (payload.new && user) {
          await fetchDashboardData(user.id);
        }
      })
      .subscribe();
      
    return () => {
      userChannel.data.subscription.unsubscribe();
      supabase.removeChannel(planChannel);
    };
  }, [navigate, user?.id]);

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="lg" text="Loading dashboard..." />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className="flex items-center gap-4">
            <UserAvatar size="lg" fallback={user?.email?.charAt(0) || "U"} />
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.email?.split('@')[0]}</h1>
              <p className="text-gray-600">Here's an overview of your PetTouch account</p>
            </div>
          </div>
          <Button 
            className="mt-4 md:mt-0 bg-pet-primary hover:bg-pet-secondary"
            onClick={() => handleNavigation('/dashboard/pets')}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Pet
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-gray-700">Total Pets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="text-3xl font-bold">{stats.totalPets}</span>
                <Layers className="h-8 w-8 text-pet-primary" />
              </div>
            </CardContent>
            <CardFooter className="pt-0 text-sm text-gray-500">
              <span>Limit: {stats.totalPets}/{stats.petLimit === 999 ? '∞' : stats.petLimit} pets</span>
            </CardFooter>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-gray-700">Recent Scans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="text-3xl font-bold">{stats.recentScans}</span>
                <Clock className="h-8 w-8 text-pet-primary" />
              </div>
            </CardContent>
            <CardFooter className="pt-0 text-sm text-gray-500">
              <span>Last 30 days</span>
            </CardFooter>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-gray-700">Current Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="text-3xl font-bold">{stats.currentPlan}</span>
                <CreditCard className="h-8 w-8 text-pet-primary" />
              </div>
            </CardContent>
            <CardFooter className="pt-0 text-sm text-gray-500">
              <Link to="/dashboard/subscription" className="text-pet-primary hover:underline">Upgrade</Link>
            </CardFooter>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-gray-700">Account</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="text-lg truncate max-w-[150px]">{user?.email}</span>
                <User className="h-8 w-8 text-pet-primary" />
              </div>
            </CardContent>
            <CardFooter className="pt-0 text-sm text-gray-500">
              <Link to="/dashboard/settings" className="text-pet-primary hover:underline">Manage</Link>
            </CardFooter>
          </Card>
        </div>

        {/* Quick Actions */}
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-pet-accent1/20 to-pet-accent2/10 hover:shadow-md transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <PlusCircle className="mr-2 h-5 w-5 text-pet-primary" />
                Register New Pet
              </CardTitle>
              <CardDescription>Add a new pet to your account</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full border-pet-primary text-pet-primary hover:bg-pet-accent1/20"
                onClick={() => handleNavigation('/dashboard/pets')}
              >
                Add Pet
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="bg-gradient-to-br from-pet-accent2/20 to-pet-accent1/10 hover:shadow-md transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="mr-2 h-5 w-5 text-pet-primary" />
                Lost & Found
              </CardTitle>
              <CardDescription>Check community reports</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full border-pet-primary text-pet-primary hover:bg-pet-accent1/20"
                onClick={() => handleNavigation('/dashboard/lost-found')}
              >
                View Reports
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="bg-gradient-to-br from-pet-accent1/10 to-pet-accent2/20 hover:shadow-md transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ArrowUpRight className="mr-2 h-5 w-5 text-pet-primary" />
                Upgrade Plan
              </CardTitle>
              <CardDescription>Get more features and benefits</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button 
                className="w-full bg-pet-primary hover:bg-pet-secondary text-white"
                onClick={() => handleNavigation('/dashboard/subscription')}
              >
                View Plans
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Recent Activity */}
        <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8 text-gray-500">
              <p>No recent activity to display.</p>
              <p className="mt-2">Register your first pet to start tracking activities.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
