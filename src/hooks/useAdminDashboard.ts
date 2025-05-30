
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DashboardData {
  userCount: number;
  petCount: number;
  lostFoundCount: number;
  orderCount: number;
  recentUsers: any[];
  recentPets: any[];
  userGrowth: number;
  petGrowth: number;
  lostFoundGrowth: number;
  orderGrowth: number;
  petTypeDistribution: { name: string, value: number }[];
  planDistribution: { name: string, value: number }[];
  monthlyScans: { month: string, scans: number }[];
  monthlyUsers: { month: string, users: number }[];
  monthlyOrders: { month: string, orders: number }[];
  lostFoundStatusDistribution: { name: string, value: number }[];
}

export const useAdminDashboard = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    userCount: 0,
    petCount: 0,
    lostFoundCount: 0,
    orderCount: 0,
    recentUsers: [],
    recentPets: [],
    userGrowth: 0,
    petGrowth: 0,
    lostFoundGrowth: 0,
    orderGrowth: 0,
    petTypeDistribution: [],
    planDistribution: [],
    monthlyScans: [],
    monthlyUsers: [],
    monthlyOrders: [],
    lostFoundStatusDistribution: [],
  });

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch counts
      const [
        { count: userCount }, 
        { count: petCount }, 
        { count: lostFoundCount },
        { count: orderCount }
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('pets').select('*', { count: 'exact', head: true }),
        supabase.from('lost_found_posts').select('*', { count: 'exact', head: true }),
        supabase.from('store_orders').select('*', { count: 'exact', head: true })
      ]);

      // Fetch pet type distribution
      const { data: petTypes } = await supabase
        .from('pets')
        .select('type');

      // Count pet types
      const petTypeCount: Record<string, number> = {};
      petTypes?.forEach(pet => {
        petTypeCount[pet.type] = (petTypeCount[pet.type] || 0) + 1;
      });
      
      const petTypeDistribution = Object.entries(petTypeCount).map(([name, value]) => ({ name, value }));

      // Fetch plan distribution
      const { data: plans } = await supabase
        .from('users')
        .select('plan');

      // Count plans
      const planCount: Record<string, number> = {};
      plans?.forEach(user => {
        planCount[user.plan] = (planCount[user.plan] || 0) + 1;
      });
      
      const planDistribution = Object.entries(planCount).map(([name, value]) => ({ name, value }));

      // Fetch lost & found status distribution
      const { data: lostFoundStatus } = await supabase
        .from('lost_found_posts')
        .select('status');

      // Count statuses
      const statusCount: Record<string, number> = {
        open: 0,
        resolved: 0,
        closed: 0
      };
      
      lostFoundStatus?.forEach(post => {
        const status = post.status as keyof typeof statusCount;
        if (status in statusCount) {
          statusCount[status] += 1;
        }
      });
      
      const lostFoundStatusDistribution = Object.entries(statusCount).map(([name, value]) => ({ name, value }));

      // Set dashboard data
      setDashboardData({
        userCount: userCount || 0,
        petCount: petCount || 0,
        lostFoundCount: lostFoundCount || 0,
        orderCount: orderCount || 0,
        recentUsers: [],
        recentPets: [],
        userGrowth: 15, // Example data - would calculate from real data
        petGrowth: 8,
        lostFoundGrowth: 12,
        orderGrowth: 5,
        petTypeDistribution,
        planDistribution,
        monthlyScans: [
          { month: 'Jan', scans: 12 },
          { month: 'Feb', scans: 19 },
          { month: 'Mar', scans: 25 },
          { month: 'Apr', scans: 32 },
          { month: 'May', scans: 28 },
          { month: 'Jun', scans: 40 }
        ],
        monthlyUsers: [
          { month: 'Jan', users: 5 },
          { month: 'Feb', users: 8 },
          { month: 'Mar', users: 12 },
          { month: 'Apr', users: 15 },
          { month: 'May', users: 20 },
          { month: 'Jun', users: 25 }
        ],
        monthlyOrders: [
          { month: 'Jan', orders: 2 },
          { month: 'Feb', orders: 4 },
          { month: 'Mar', orders: 8 },
          { month: 'Apr', orders: 6 },
          { month: 'May', orders: 10 },
          { month: 'Jun', orders: 12 }
        ],
        lostFoundStatusDistribution
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({ 
        title: "Error", 
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return { loading, dashboardData, fetchDashboardData };
};
