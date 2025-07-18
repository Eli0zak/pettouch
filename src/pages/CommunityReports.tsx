import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Heart } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { LostFoundInteractionModal } from '@/components/LostFoundInteractionModal';
import { ReportFormModal } from '@/components/ReportFormModal';
import CommunityReportCard from '@/components/CommunityReportCard';
import ReunionCard from '@/components/ReunionCard';
import { Database } from '@/integrations/supabase/types';

type LostFoundPost = Database['public']['Tables']['lost_found_posts']['Row'] & {
  government?: string;
  area?: string;
  pet_type: 'dog' | 'cat' | 'bird' | 'other';
  status: 'open' | 'resolved' | 'closed';
  type?: 'lost' | 'found';
};

const governments = [
  'Alexandria', 'Aswan', 'Asyut', 'Beheira', 'Beni Suef', 'Cairo', 'Dakahlia',
  'Damietta', 'Faiyum', 'Gharbia', 'Giza', 'Ismailia', 'Kafr El Sheikh',
  'Luxor', 'Matrouh', 'Minya', 'Monufia', 'New Valley', 'North Sinai',
  'Port Said', 'Qalyubia', 'Qena', 'Red Sea', 'Sharqia', 'Sohag',
  'South Sinai', 'Suez'
];

const governmentAreas: Record<string, string[]> = {
  cairo: ['Sahel', 'Shubra', 'Heliopolis', 'Maadi', 'Nasr City'],
  alexandria: ['Smouha', 'Gleem', 'Stanley', 'Roushdy'],
  giza: ['Dokki', 'Mohandessin', 'Haram', '6th October'],
};

const CommunityReports: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [posts, setPosts] = useState<LostFoundPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'dog' | 'cat' | 'bird' | 'other'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'resolved' | 'closed'>('all');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterGovernment, setFilterGovernment] = useState('all');
  const [filterArea, setFilterArea] = useState('');

  useEffect(() => {
    setFilterArea('');
  }, [filterGovernment]);

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportType, setReportType] = useState<'lost' | 'found'>('lost');
  const [interactionModalOpen, setInteractionModalOpen] = useState(false);
  const [interactionPostId, setInteractionPostId] = useState<string | null>(null);
  const [interactionPostTitle, setInteractionPostTitle] = useState('');
  const [interactionType, setInteractionType] = useState<'found' | 'know'>('found');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('lost_found_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const typedPosts = data?.map(post => ({
        ...post,
        status: post.status as 'open' | 'resolved' | 'closed',
        type: (post as any).type as 'lost' | 'found'
      })) as LostFoundPost[];

      setPosts(typedPosts || []);
    } catch (error) {
      console.error('Error fetching lost and found posts:', error);
      toast({
        title: "Error",
        description: "Failed to load community reports",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const openInteractionModal = (postId: string, postTitle: string, type: 'found' | 'know') => {
    setInteractionPostId(postId);
    setInteractionPostTitle(postTitle);
    setInteractionType(type);
    setInteractionModalOpen(true);
  };

  const closeInteractionModal = () => {
    setInteractionModalOpen(false);
    setInteractionPostId(null);
    setInteractionPostTitle('');
  };

  const filteredPosts = posts.filter(post => {
    const searchMatch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.pet_name && post.pet_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (post.pet_breed && post.pet_breed.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (post.last_seen_location && post.last_seen_location.toLowerCase().includes(searchTerm.toLowerCase()));

    const typeMatch = filterType === 'all' || post.pet_type === filterType;
    const statusMatch = filterStatus === 'all' || post.status === filterStatus;
    const locationMatch = !filterLocation ||
      (post.last_seen_location &&
        post.last_seen_location.toLowerCase().includes(filterLocation.toLowerCase()));

    const governmentMatch = filterGovernment === 'all' ||
      (post.government?.toLowerCase() === filterGovernment.toLowerCase());

    const areaMatch = !filterArea ||
      (post.area?.toLowerCase().includes(filterArea.toLowerCase()));

    return searchMatch && typeMatch && statusMatch && locationMatch && governmentMatch && areaMatch;
  });

  return (
    <div className="container mx-auto py-12 px-6">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-2">
          {t('communityActionHub')}
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-center">
          {t('communityDescription')}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button
            size="lg"
            className="bg-amber-600 hover:bg-amber-700 text-white min-w-[200px]"
            onClick={() => {
              setReportType('lost');
              setReportModalOpen(true);
            }}
          >
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              <span>{t('reportLostPet')}</span>
            </div>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 min-w-[200px]"
            onClick={() => {
              setReportType('found');
              setReportModalOpen(true);
            }}
          >
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              <span>{t('foundPet')}</span>
            </div>
          </Button>
        </div>

        {/* Happy Reunions Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-center">{t('happyReunions')}</h2>
          <div className="relative">
            <div className="flex gap-4 overflow-x-auto pb-4 px-4 -mx-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {posts
                .filter(post => post.status === 'resolved')
                .slice(0, 6)
                .map(post => (
                  <ReunionCard key={post.id} pet={post} />
                ))}
            </div>
          </div>
        </div>

        {/* Active Alerts Section */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold mb-2">{t('activeAlerts')}</h2>
          <p className="text-muted-foreground mb-8">{t('alertsDescription')}</p>
        </div>

        <div className="max-w-5xl mx-auto space-y-4">
          {/* Search Bar - Full width on all screens */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
            placeholder={t('searchPlaceholderFull')}
              className="pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters Grid - Responsive grid layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Pet Type Filter */}
            <div className="w-full">
              <Select
                value={filterType}
                onValueChange={(value: 'all' | 'dog' | 'cat' | 'bird' | 'other') => setFilterType(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('petType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('AllTypes')}</SelectItem>
                  <SelectItem value="dog">{t('dog')}</SelectItem>
                  <SelectItem value="cat">{t('cat')}</SelectItem>
                  <SelectItem value="bird">{t('bird')}</SelectItem>
                  <SelectItem value="other">{t('other')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="w-full">
              <Select
                value={filterStatus}
                onValueChange={(value: 'all' | 'open' | 'resolved' | 'closed') => setFilterStatus(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('AllStatus')}</SelectItem>
                  <SelectItem value="open">{t('Open')}</SelectItem>
                  <SelectItem value="resolved">{t('Resolved')}</SelectItem>
                  <SelectItem value="closed">{t('Closed')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Location Filter */}
            <div className="w-full">
              <Input
                placeholder={t('locationFilter')}
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Government Filter */}
            <div className="w-full">
              <Select value={filterGovernment} onValueChange={setFilterGovernment}>
                <SelectTrigger>
                  <SelectValue placeholder={t('government')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('Governments')}</SelectItem>
                  {governments.map((gov) => (
                    <SelectItem key={gov.toLowerCase()} value={gov.toLowerCase()}>
                      {gov}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Area Filter */}
            <div className="w-full">
              <Select
                value={filterArea}
                onValueChange={(value) => setFilterArea(value)}
                disabled={filterGovernment === 'all'}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('areaFilter')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('Areas')}</SelectItem>
                  {(governmentAreas[filterGovernment] || []).map((area) => (
                    <SelectItem key={area.toLowerCase()} value={area.toLowerCase()}>
                      {area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="flex justify-center items-center h-40" dir="rtl">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pet-primary"></div>
          </div>
        ) : filteredPosts.length > 0 ? (
          filteredPosts.map(post => (
            <CommunityReportCard
              key={post.id}
              post={post}
              onOpenInteractionModal={openInteractionModal}
            />
          ))
        ) : (
          <div className="col-span-full p-8 text-center text-muted-foreground">
            {t('noReportsFound')}
          </div>
        )}
      </div>

      <LostFoundInteractionModal
        isOpen={interactionModalOpen}
        onClose={closeInteractionModal}
        postId={interactionPostId ?? ''}
        postTitle={interactionPostTitle ?? ''}
        interactionType={interactionType ?? 'found'}
        onSuccess={fetchPosts}
      />

      <ReportFormModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        onSuccess={fetchPosts}
      />
    </div>
  );
};

export default CommunityReports;
