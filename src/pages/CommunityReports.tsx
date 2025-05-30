import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Calendar, Mail, Phone } from 'lucide-react';
import { LostFoundPost } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

const CommunityReports = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<LostFoundPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

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
        status: post.status as 'open' | 'resolved' | 'closed'
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

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Unknown date';
    try {
      return format(new Date(dateString), 'PPP');
    } catch (error) {
      return 'Unknown date';
    }
  };

  const getStatusBadgeClass = (status: 'open' | 'resolved' | 'closed') => {
    switch (status) {
      case 'open':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'closed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
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
    
    return searchMatch && typeMatch && statusMatch;
  });

  return (
    <div className="container mx-auto py-12 px-6">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">
          {t('community.title')}
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
          {t('community.description')}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button className="bg-pet-primary hover:bg-pet-secondary text-white">
            {t('community.reportLost')}
          </Button>
          <Button variant="outline" className="border-pet-primary text-pet-primary hover:bg-pet-accent1/20">
            {t('community.reportFound')}
          </Button>
        </div>
        
        <div className="max-w-xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t('community.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
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
            <Card key={post.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="aspect-video rounded-md bg-muted mb-4">
                  <img
                    src={post.image_url || `https://source.unsplash.com/featured/400x300?pet&${post.id}`}
                    alt={post.title}
                    className="w-full h-full object-cover rounded-md"
                  />
                </div>
                <div className="flex justify-between items-start">
                  <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                  <div className={`px-2 py-1 text-xs rounded-full border ${getStatusBadgeClass(post.status)}`}>
                    {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                  </div>
                </div>
                <CardDescription>
                  {post.pet_type && post.pet_breed 
                    ? `${post.pet_type.charAt(0).toUpperCase() + post.pet_type.slice(1)} - ${post.pet_breed}`
                    : post.pet_type?.charAt(0).toUpperCase() + post.pet_type?.slice(1)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm line-clamp-3 mb-4">{post.description}</p>
                
                <div className="flex flex-col space-y-2 text-sm text-muted-foreground">
                  {post.last_seen_location && (
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 mr-2" />
                      <span>{post.last_seen_location}</span>
                    </div>
                  )}
                  {post.last_seen_date && (
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-2" />
                      <span>{formatDate(post.last_seen_date)}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-2" />
                    <span>Posted: {formatDate(post.created_at)}</span>
                  </div>
                  {(post.contact_phone || post.contact_email) && (
                    <div className="border-t pt-2 mt-2">
                      <p className="font-medium mb-1">Contact Information:</p>
                      {post.contact_phone && (
                        <div className="flex items-center">
                          <Phone className="h-3 w-3 mr-2" />
                          <span>{post.contact_phone}</span>
                        </div>
                      )}
                      {post.contact_email && (
                        <div className="flex items-center">
                          <Mail className="h-3 w-3 mr-2" />
                          <span>{post.contact_email}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  {t('community.viewDetails')}
                </Button>
              </CardFooter>
            </Card>
          )) 
        ) : (
          <Card className="p-8 text-center">
            <p>{t('community.noReportsFound')}</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CommunityReports;