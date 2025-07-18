import React, { useEffect, useState } from 'react';
import { Star, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

const PointsStreakSection: React.FC = () => {
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  // Function to get streak color based on current streak
  const getStreakColor = (streakValue: number) => {
    if (streakValue === 0) return 'from-gray-400 to-gray-500';
    if (streakValue <= 3) return 'from-red-400 to-pink-400';
    if (streakValue <= 7) return 'from-orange-400 to-red-400';
    if (streakValue <= 14) return 'from-yellow-400 to-orange-400';
    if (streakValue <= 30) return 'from-green-400 to-emerald-400';
    if (streakValue <= 60) return 'from-blue-400 to-indigo-400';
    if (streakValue <= 100) return 'from-purple-400 to-pink-400';
    return 'from-yellow-400 via-pink-400 to-purple-600';
  };

  useEffect(() => {
    const fetchGamificationData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch points from users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('total_points')
          .eq('id', user.id)
          .single();

        let calculatedPoints = 0;

        // If no total_points, calculate from user_points
        if (!userData?.total_points) {
          const { data: pointsData, error: pointsError } = await supabase
            .from('user_points')
            .select('points')
            .eq('user_id', user.id);

          if (pointsData && !pointsError) {
            calculatedPoints = pointsData.reduce((sum, record) => sum + (record.points || 0), 0);
          }
        } else {
          calculatedPoints = userData.total_points;
        }

        // Fetch streak data
        const { data: streakData, error: streakError } = await supabase
          .from('user_streaks')
          .select('current_streak, last_activity_date')
          .eq('user_id', user.id)
          .single();

        let calculatedStreak = 0;
        if (streakData) {
          const lastActivity = new Date(streakData.last_activity_date);
          const today = new Date();
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          
          if (lastActivity >= yesterday) {
            calculatedStreak = streakData.current_streak || 0;
          }
        }

        setPoints(calculatedPoints);
        setStreak(calculatedStreak);

        // Set up real-time subscriptions
        const pointsSubscription = supabase
          .channel('points-updates')
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'users',
              filter: `id=eq.${user.id}`
            },
            (payload: any) => {
              const newPoints = payload.new?.total_points;
              if (typeof newPoints === 'number' && !isNaN(newPoints)) {
                setPoints(newPoints);
              }
            }
          )
          .subscribe();

        const streakSubscription = supabase
          .channel('streak-updates')
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'user_streaks',
              filter: `user_id=eq.${user.id}`
            },
            (payload: any) => {
              const newStreak = payload.new?.current_streak || 0;
              setStreak(newStreak);
            }
          )
          .subscribe();

        return () => {
          pointsSubscription.unsubscribe();
          streakSubscription.unsubscribe();
        };

      } catch (error) {
        console.error('Error fetching gamification data:', error);
        toast({
          title: "Error",
          description: "Failed to load points and streak data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGamificationData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center space-x-6 bg-white/80 backdrop-blur-sm rounded-lg p-3 shadow-sm">
        <div className="animate-pulse flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
          <div className="w-12 h-3 bg-gray-300 rounded"></div>
        </div>
        <div className="animate-pulse flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
          <div className="w-12 h-3 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center space-x-6 bg-gradient-to-r from-white/90 to-white/70 backdrop-blur-sm rounded-lg p-3 shadow-sm border border-white/20">
      
      {/* Points */}
      <div className="flex items-center space-x-2 group">
        <div className="w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200">
          <Star className="w-3 h-3 text-white" fill="currentColor" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-gray-800 leading-none">
            {points.toLocaleString()}
          </span>
          <span className="text-xs text-gray-500 leading-none">
            points
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-300"></div>

      {/* Streak */}
      <div className="flex items-center space-x-2 group">
        <div className={cn(
          "w-6 h-6 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-all duration-300 bg-gradient-to-br",
          getStreakColor(streak)
        )}>
          <Flame className="w-3 h-3 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-gray-800 leading-none">
            {streak}
          </span>
          <span className="text-xs text-gray-500 leading-none">
            streak
          </span>
        </div>
      </div>
    </div>
  );
};

export default PointsStreakSection;