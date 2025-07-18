import React from 'react';
import { format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Mail, Phone, Heart, Info, Share2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface CommunityReportCardProps {
  post: {
    id: string;
    title: string;
    description: string;
    image_url?: string | null;
    status: 'open' | 'resolved' | 'closed';
    pet_type?: string;
    pet_breed?: string;
    government?: string;
    area?: string;
    last_seen_location?: string;
    last_seen_date?: string | null;
    created_at: string;
    contact_phone?: string | null;
    contact_email?: string | null;
  };
  onOpenInteractionModal: (postId: string, postTitle: string, type: 'found' | 'know') => void;
}

const getStatusStyles = (status: 'open' | 'resolved' | 'closed') => {
  switch (status) {
    case 'open':
      return {
        badge: 'bg-amber-100 text-amber-800 border-amber-200',
        border: 'border-amber-300',
        shadow: 'shadow-amber-100'
      };
    case 'resolved':
      return {
        badge: 'bg-green-100 text-green-800 border-green-200',
        border: 'border-green-300',
        shadow: 'shadow-green-100'
      };
    case 'closed':
      return {
        badge: 'bg-gray-100 text-gray-800 border-gray-200',
        border: 'border-gray-300',
        shadow: 'shadow-gray-100'
      };
    default:
      return {
        badge: 'bg-blue-100 text-blue-800 border-blue-200',
        border: 'border-blue-300',
        shadow: 'shadow-blue-100'
      };
  }
};

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return 'Unknown date';
  try {
    return format(new Date(dateString), 'PPP');
  } catch {
    return 'Unknown date';
  }
};

const CommunityReportCard: React.FC<CommunityReportCardProps> = ({ post, onOpenInteractionModal }) => {
  return (
    <Card className={`hover:shadow-lg transition-all ${getStatusStyles(post.status).border} border-2 ${getStatusStyles(post.status).shadow}`}>
      <CardHeader>
        <div className="aspect-video rounded-md bg-muted mb-4 max-h-48 overflow-hidden shadow-md border border-gray-200">
          <img
            src={typeof post.image_url === 'string' ? post.image_url : `https://source.unsplash.com/featured/400x300?pet&${post.id}`}
            alt={post.title}
            className="w-full h-full object-cover rounded-md"
          />
        </div>
        <div className="flex justify-between items-start">
          <CardTitle className="line-clamp-2">{post.title}</CardTitle>
          <div className={`px-2 py-1 text-xs rounded-full border ${getStatusStyles(post.status).badge}`}>
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
          {post.government && post.area && (
            <div className="flex items-center">
              <MapPin className="h-3 w-3 mr-2" />
              <span>{post.government} - {post.area}</span>
            </div>
          )}
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
      <CardFooter className="flex flex-col gap-2">
        {post.status === 'open' && (
          <>
            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                className="flex-1 bg-emerald-50 hover:bg-emerald-100 border-emerald-200" 
                onClick={() => onOpenInteractionModal(post.id, post.title, 'found')}
              >
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  <span>I Found This Pet</span>
                </div>
              </Button>
            </div>
            <Button 
              variant="ghost" 
              className="w-full text-muted-foreground hover:text-foreground" 
              onClick={() => onOpenInteractionModal(post.id, post.title, 'know')}
            >
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                <span>I Have Information</span>
              </div>
            </Button>
          </>
        )}
        <div className="w-full pt-2 border-t">
          <Button variant="outline" className="w-full" onClick={() => window.navigator.share?.({
            title: post.title,
            text: `Help find this pet: ${post.description}`,
            url: window.location.href
          }).catch(() => {})}>
            <div className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              <span>Share Alert</span>
            </div>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default CommunityReportCard;
