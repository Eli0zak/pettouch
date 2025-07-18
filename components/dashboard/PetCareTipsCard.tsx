import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';

interface PetCareTipsCardProps {
  tip: {
    id: string;
    title: string;
    content: string;
    category: string;
    video_url?: string | null;
    thumbnail_url?: string;
    social_proof_tags?: string[];
    created_at: string;
  };
}

const PetCareTipsCard: React.FC<PetCareTipsCardProps> = ({ tip }) => {
  return (
    <Card className="bg-gradient-to-br from-primary/5 via-transparent to-amber-100/10 border-primary/10 hover:shadow-md transition-all duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-primary/10 p-2 rounded-full mr-3">
              <Lightbulb className="w-5 h-5 text-primary animate-pulse" />
            </div>
            <span className="text-lg font-medium">Daily Pet Care Tip</span>
          </div>
          {tip.category && (
            <span className="text-xs font-medium px-3 py-1 bg-primary/5 rounded-full">
              {tip.category}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-primary">{tip.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{tip.content}</p>
          <div className="flex items-center justify-center mt-2 space-x-1">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/30" />
            <div className="w-1.5 h-1.5 rounded-full bg-primary/20" />
            <div className="w-1.5 h-1.5 rounded-full bg-primary/10" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PetCareTipsCard;
