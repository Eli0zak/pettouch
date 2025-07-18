import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { UserAvatar } from '@/components/ui/user-avatar';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { logger } from '@/utils/logger';
import { User } from '@supabase/supabase-js';

import QuickActionsBar from '@/components/dashboard/QuickActionsBar';
import MyPetsCarousel from '@/components/dashboard/MyPetsCarousel';
import RecentScanAlerts from '@/components/dashboard/RecentScanAlerts';
import MyTagsCard from '@/components/dashboard/MyTagsCard';
import PetCareTipsCard from '@/components/dashboard/PetCareTipsCard';
import DailyMission from '@/components/dashboard/DailyMission';
import AchievementsSection from '@/components/dashboard/AchievementsSection';

interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  video_url: string | null;
  thumbnail_url: string;
  social_proof_tags: string[];
  created_at: string;
}

interface Scan {
  id: string;
  petName: string;
  location?: string;
  date: string;
  time: string;
  mapImageUrl?: string;
}

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentScans, setRecentScans] = useState<Scan[]>([]);
  const [hasCompletedDaily, setHasCompletedDaily] = useState(false);
  const [latestTip, setLatestTip] = useState<Article | null>(null);
  const [activeTagsCount, setActiveTagsCount] = useState<number>(0);
  const [petsCount, setPetsCount] = useState<number>(0);
  const [streakCount, setStreakCount] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (data?.user) {
          setUser(data.user);
        }
      } catch (error) {
        logger.error('Error fetching user data', { error });
      } finally {
        setLoading(false);
      }
    };

    const fetchLatestTip = async () => {
      try {
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error) throw error;
        if (data) {
          setLatestTip(data);
        }
      } catch (error) {
        logger.error('Error fetching latest tip:', error);
      }
    };

    const fetchActiveTagsCount = async () => {
      try {
        const { count, error } = await supabase
          .from('nfc_tags')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user?.id ?? '')
          .eq('is_active', true);

        if (error) throw error;
        if (count !== null) {
          setActiveTagsCount(count);
        }
      } catch (error) {
        logger.error('Error fetching active tags count:', error);
      }
    };

    const fetchPetsCount = async () => {
      try {
        const { count, error } = await supabase
          .from('pets')
          .select('*', { count: 'exact', head: true })
          .eq('owner_id', user?.id ?? '');

        if (error) throw error;
        if (count !== null) {
          setPetsCount(count);
        }
      } catch (error) {
        logger.error('Error fetching pets count:', error);
      }
    };

    const fetchStreakCount = async () => {
      try {
        const { data, error } = await supabase
          .from('user_streaks')
          .select('streak_count')
          .eq('user_id', user?.id ?? '')
          .single();

        if (error) throw error;
        if (data && typeof data.streak_count === 'number') {
          setStreakCount(data.streak_count);
        } else {
          setStreakCount(0);
        }
      } catch (error) {
        logger.error('Error fetching streak count:', error);
        setStreakCount(0);
      }
    };

    getUser();
    fetchLatestTip();
    fetchActiveTagsCount();
    fetchPetsCount();
    fetchStreakCount();

    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timeInterval);
  }, [user]);

  const handleQuickActions = {
    onReportLost: () => navigate('/dashboard/lost-found'),
    onScanTag: () => navigate('/dashboard/scan-records'),
    onAddRecord: () => navigate('/dashboard/pets'),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <LoadingSpinner className="border-[#6B4EFF]" size="lg" />
      </div>
    );
  }

  const tipOfTheDay = latestTip || {
    id: 'default',
    title: "Daily Pet Care",
    content: "Remember to check your pet's water bowl and spend some quality time together today.",
    category: "Daily Care",
    video_url: null,
    thumbnail_url: "",
    social_proof_tags: [],
    created_at: new Date().toISOString(),
  };

  const getUserName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.split(' ')[0];
    }
    return user?.email?.split('@')[0] || 'Pet Parent';
  };

  const formatTime = () => {
    return currentTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = () => {
    return currentTime.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-ibm-plex">
      {/* Mobile Layout */}
      <div className="lg:hidden">
        {/* Mobile Hero Section */}
        <div className="relative bg-gradient-to-br from-[#6B4EFF] to-[#8f7eff] px-4 pt-12 pb-8 overflow-hidden rounded-b-3xl">
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('/public/peto.svg')] bg-no-repeat bg-center bg-contain"></div>
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-3">
                <UserAvatar
                  size="lg"
                  fallback={user?.email?.charAt(0)?.toUpperCase() || "P"}
                  className="ring-3 ring-white/30 shadow-lg"
                />
                <div>
                  <h1 className="text-white text-xl font-bold font-ibm-plex">
                    Hi, {getUserName()}!
                  </h1>
                  <p className="text-blue-100 text-sm font-ibm-plex">
                    Let's take care of your pets today
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-bold text-lg font-ibm-plex">{formatTime()}</p>
                <p className="text-blue-200 text-xs font-ibm-plex">{formatDate()}</p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center shadow-md">
                <p className="text-white/80 text-xs font-ibm-plex">My Pets</p>
                <p className="text-white font-bold text-lg font-ibm-plex">{petsCount}</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center shadow-md">
                <p className="text-white/80 text-xs font-ibm-plex">Tags Active</p>
                <p className="text-white font-bold text-lg font-ibm-plex">{activeTagsCount}</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center shadow-md">
                <p className="text-white/80 text-xs font-ibm-plex">Daily Streak</p>
                <p className="text-white font-bold text-lg font-ibm-plex">{streakCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Content */}
        <div className="px-4 -mt-4 pb-20 space-y-4">
          {/* Quick Actions Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#6B4EFF]/10 to-[#8f7eff]/10 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="relative">
              <h2 className="text-[#2D2D2D] font-semibold mb-3 flex items-center font-ibm-plex">
                <span className="w-2 h-2 bg-[#6B4EFF] rounded-full mr-2"></span>
                Quick Actions
              </h2>
              <QuickActionsBar {...handleQuickActions} />
            </div>
          </div>

          {/* Daily Mission Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#FF9900] p-4 relative overflow-hidden">
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-[#FF9900]/30 rounded-full"></div>
            <div className="relative">
              <h2 className="text-[#2D2D2D] font-semibold mb-3 flex items-center font-ibm-plex">
                <span className="text-[#FF9900] mr-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF9900" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 12l2 2 4-4" />
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                </span>
                Today's Mission
              </h2>
              <DailyMission
                currentStreak={streakCount}
                hasCompletedDaily={hasCompletedDaily}
              />
            </div>
          </div>

          {/* My Pets Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[#2D2D2D] text-xl font-semibold flex items-center font-ibm-plex">
                <span className="text-[#6B4EFF] mr-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B4EFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 21s-6-4.686-6-10a6 6 0 0 1 12 0c0 5.314-6 10-6 10z" />
                    <circle cx="12" cy="7" r="2" />
                  </svg>
                </span>
                My Pets
              </h2>
              <button
                onClick={() => navigate('/dashboard/pets')}
                className="text-[#6B4EFF] text-sm font-medium hover:text-[#8f7eff] transition-colors font-ibm-plex"
              >
                View All
              </button>
            </div>
            <MyPetsCarousel
              onManagePets={() => navigate('/dashboard/pets')}
              onPetClick={(petId: string) => navigate(`/pet/${petId}`)}
            />
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-[#2D2D2D] text-xl font-semibold mb-4 flex items-center font-ibm-plex">
              <span className="text-[#FF9900] mr-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF9900" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 21s-6-4.686-6-10a6 6 0 0 1 12 0c0 5.314-6 10-6 10z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </span>
              Recent Activity
            </h2>
            <RecentScanAlerts
              scans={recentScans}
              onViewAllScans={() => navigate('/dashboard/scan-records')}
            />
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="hidden lg:block max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Main Content */}
          <div className="col-span-8 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-[#2D2D2D] text-xl font-semibold mb-4 flex items-center font-ibm-plex">
                <span className="w-3 h-3 bg-[#6B4EFF] rounded-full mr-3"></span>
                Quick Actions
              </h2>
              <QuickActionsBar {...handleQuickActions} />
            </div>

            {/* Daily Mission */}
            <div className="bg-white rounded-3xl shadow-sm border border-[#FF9900] p-6">
              <h2 className="text-[#2D2D2D] text-xl font-semibold mb-4 flex items-center font-ibm-plex">
                <span className="text-[#FF9900] mr-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF9900" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 12l2 2 4-4" />
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                </span>
                Today's Mission
              </h2>
              <DailyMission
                currentStreak={streakCount}
                hasCompletedDaily={hasCompletedDaily}
              />
            </div>

            {/* My Pets */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[#2D2D2D] text-xl font-semibold flex items-center font-ibm-plex">
                  <span className="text-[#6B4EFF] mr-2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6B4EFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 21s-6-4.686-6-10a6 6 0 0 1 12 0c0 5.314-6 10-6 10z" />
                      <circle cx="12" cy="7" r="2" />
                    </svg>
                  </span>
                  My Pets
                </h2>
                <button
                  onClick={() => navigate('/dashboard/pets')}
                  className="text-[#6B4EFF] text-sm font-medium hover:text-[#8f7eff] transition-colors font-ibm-plex"
                >
                  View All
                </button>
              </div>
              <MyPetsCarousel
                onManagePets={() => navigate('/dashboard/pets')}
                onPetClick={(petId: string) => navigate(`/pet/${petId}`)}
              />
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-[#2D2D2D] text-xl font-semibold mb-4 flex items-center font-ibm-plex">
                <span className="text-[#FF9900] mr-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF9900" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 21s-6-4.686-6-10a6 6 0 0 1 12 0c0 5.314-6 10-6 10z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </span>
                Recent Activity
              </h2>
              <RecentScanAlerts
                scans={recentScans}
                onViewAllScans={() => navigate('/dashboard/scan-records')}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-span-4 space-y-6">
            {/* Achievements */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-[#2D2D2D] text-xl font-semibold mb-4 flex items-center font-ibm-plex">
                <span className="text-[#6B4EFF] mr-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6B4EFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 21h8M12 17v4M4 7h16M6 7v6a6 6 0 0 0 12 0V7" />
                  </svg>
                </span>
                Your Achievements
              </h2>
              <AchievementsSection />
            </div>

            {/* My Tags */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-[#6B4EFF] text-xl font-semibold mb-4 flex items-center font-ibm-plex">
                <span className="w-5 h-5 mr-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6B4EFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 12v-2a2 2 0 0 0-2-2h-2" />
                    <path d="M4 12v2a2 2 0 0 0 2 2h2" />
                    <path d="M12 4v2a2 2 0 0 0 2 2h2" />
                    <path d="M12 20v-2a2 2 0 0 0-2-2h-2" />
                  </svg>
                </span>
                NFC Tags
              </h2>
              <MyTagsCard onManageTags={() => navigate('/dashboard/tags-management')} />
            </div>

            {/* Pet Care Tips */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-[#6B4EFF] text-xl font-semibold mb-4 flex items-center font-ibm-plex">
                <span className="w-5 h-5 mr-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6B4EFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a10 10 0 0 1 10 10v2a10 10 0 0 1-10 10a10 10 0 0 1-10-10v-2a10 10 0 0 1 10-10z" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                </span>
                Pet Care Tips
              </h2>
              <PetCareTipsCard tip={tipOfTheDay} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
