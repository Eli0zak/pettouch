
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  petCount: number;
  scanCount: number;
  planName: string;
  petLimit: number;
}

export function useDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    petCount: 0,
    scanCount: 0,
    planName: 'Free',
    petLimit: 3
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        
        // Get the current user
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          throw userError;
        }
        
        if (!userData?.user) {
          throw new Error('No authenticated user found');
        }
        
        setUser(userData.user);
        const userId = userData.user.id;
        
        // Get pet count
        const { count: petCount, error: petError } = await supabase
          .from('pets')
          .select('*', { count: 'exact', head: true })
          .eq('owner_id', userId);
          
        if (petError) {
          console.error('Error fetching pet count:', petError);
        }
        
        // Get scan count 
        const { count: scanCount, error: scanError } = await supabase
          .from('scans')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);
          
        if (scanError) {
          console.error('Error fetching scan count:', scanError);
        }
        
        // Get user profile info
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();
          
        if (profileError) {
          console.error('Error fetching user profile:', profileError);
        }
        
        // Get recent activity (pets, scans, etc.)
        const { data: recentPets, error: recentPetsError } = await supabase
          .from('pets')
          .select('*')
          .eq('owner_id', userId)
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (recentPetsError) {
          console.error('Error fetching recent pets:', recentPetsError);
        }
        
        // Update stats
        setStats({
          petCount: petCount || 0,
          scanCount: scanCount || 0,
          planName: userProfile?.plan || 'Free',
          petLimit: 3 // Hardcoded for now, could come from plan configuration
        });
        
        // Set recent activity
        setRecentActivity(recentPets || []);
        
      } catch (err: any) {
        console.error('Dashboard data error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchDashboardData();
  }, []);
  
  return { 
    loading, 
    stats, 
    recentActivity,
    user,
    error
  };
}
