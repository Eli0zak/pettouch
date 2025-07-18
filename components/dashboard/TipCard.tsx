import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlayCircle, Heart, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TipCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnailUrl: string;
  hasVideo: boolean;
  socialProofTags: string[];
  isSaved?: boolean;
  onSave?: () => void;
  onShare?: () => void;
}

const TipCard: React.FC<TipCardProps> = ({
  id,
  title,
  description,
  category,
  thumbnailUrl,
  hasVideo,
  socialProofTags,
  isSaved = false,
  onSave,
  onShare,
}) => {
  const navigate = useNavigate();

  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-shadow duration-200">
      <div className="relative">
        {/* Thumbnail Image */}
        <div className="relative h-48 overflow-hidden">
          <img 
            src={thumbnailUrl || '/placeholder.svg'} 
            alt={title}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-200"
          />
          {/* Video Indicator */}
          {hasVideo && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <PlayCircle className="w-12 h-12 text-white" />
            </div>
          )}
        </div>

        {/* Social Proof Tags */}
        {socialProofTags.length > 0 && (
          <div className="absolute top-2 left-2 flex gap-2">
            {socialProofTags.map((tag, index) => (
              <span 
                key={index}
                className="px-2 py-1 text-xs font-medium rounded-full bg-black/50 text-white"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <span className="bg-pet-accent1/20 text-pet-primary text-xs px-2 py-1 rounded-full">
            {category}
          </span>
          <div className="flex gap-2">
            <button
              onClick={onSave}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              aria-label={isSaved ? "Remove from saved" : "Save for later"}
            >
              <Heart 
                className={`h-5 w-5 ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-500'}`}
              />
            </button>
            <button
              onClick={onShare}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Share"
            >
              <Share2 className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>
        <CardTitle className="text-lg mt-2 line-clamp-2">{title}</CardTitle>
      </CardHeader>

      <CardContent>
        <p className="text-gray-600 text-sm line-clamp-2">{description}</p>
      </CardContent>

      <CardFooter>
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => navigate(`/dashboard/tips/${id}`)}
        >
          Read More
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TipCard;
