import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { PetAvatar } from '@/components/ui/pet-avatar';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { type Pet } from '@/types/pet';
import { useLanguage } from '@/contexts/LanguageContext';

interface PetSummaryCardProps {
  pet: Pet;
  isExpanded: boolean;
  onToggle: () => void;
  className?: string;
}

export const PetSummaryCard = ({ 
  pet, 
  isExpanded, 
  onToggle, 
  className 
}: PetSummaryCardProps) => {
  const { t } = useLanguage();
  
  // Calculate profile completeness percentage
  const calculateProfileCompleteness = (pet: Pet) => {
    const fields = [
      pet.name,
      pet.breed,
      pet.gender,
      pet.color,
      pet.birthday,
      pet.weight_kg,
      pet.profile_image_url,
      pet.medical_info?.blood_type,
      pet.medical_info?.veterinarian?.name,
      pet.emergency_contact?.name
    ];

    const filledFields = fields.filter(field => {
      if (typeof field === 'number') return field > 0;
      if (typeof field === 'string') return field.trim() !== '';
      return field !== null && field !== undefined;
    }).length;

    return Math.round((filledFields / fields.length) * 100);
  };

  const completeness = calculateProfileCompleteness(pet);

  return (
    <Card 
      className={cn(
        "transition-all duration-200 ease-in-out hover:shadow-md",
        isExpanded && "ring-2 ring-primary",
        className
      )}
      role="button"
      onClick={onToggle}
    >
      <CardContent className="p-6 md:p-8">
        <div className="flex items-center gap-6">
          <PetAvatar
            src={pet.profile_image_url}
            fallback={pet.name.charAt(0)}
            size="lg"
            petType={pet.type}
            className="w-16 h-16 md:w-20 md:h-20"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="font-bold text-xl truncate">{pet.name}</h3>
                <p className="text-base text-muted-foreground">
                  {pet.breed || pet.type.charAt(0).toUpperCase() + pet.type.slice(1)}
                </p>
              </div>
              <button 
                className="flex items-center justify-center w-11 h-11 rounded-full hover:bg-muted transition-colors"
                onClick={onToggle}
                aria-label={isExpanded ? t("dashboard.pets.collapse") : t("dashboard.pets.expand")}
              >
                {isExpanded ? (
                  <ChevronUp className="h-6 w-6 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-6 w-6 text-muted-foreground" />
                )}
              </button>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground font-medium">
                  {t("dashboard.pets.profileCompleteness")}
                </span>
                <span className="font-semibold">{completeness}%</span>
              </div>
              <Progress 
                value={completeness} 
                className="h-2 rounded-full bg-secondary/50" 
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
