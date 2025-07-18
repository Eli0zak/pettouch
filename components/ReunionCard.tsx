import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { Calendar, Heart } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ReunionCardProps {
  pet: {
    id: string;
    title: string;
    pet_name?: string | null;
    image_url?: string | null;
    resolved_at?: string | null;
  };
}

const ReunionCard: React.FC<ReunionCardProps> = ({ pet }) => {
  const { t } = useLanguage();

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return '';
    }
  };

  const petName = pet.pet_name || pet.title.split(':')[1]?.trim() || 'Pet';

  return (
    <Card className="min-w-[280px] max-w-[320px] hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-card">
      <div className="relative">
        <div className="aspect-square overflow-hidden rounded-t-lg">
          <img
            src={pet.image_url || `https://source.unsplash.com/featured/?pet&${pet.id}`}
            alt={petName}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute top-2 right-2 bg-white/90 p-2 rounded-full shadow-md backdrop-blur-sm">
          <Heart className="h-5 w-5 text-rose-500 animate-pulse" fill="#ec4899" />
        </div>
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
          {t('petIsHome', { petName })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 mr-2" />
          <span>{t('reunited', { date: formatDate(pet.resolved_at) })}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReunionCard;
