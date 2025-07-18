import React, { useState } from 'react';
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Edit, 
  QrCode,
  Trash2,
  User,
  Heart,
  Cake,
  Weight,
  Tag,
  Search,
  Info,
  Stars,
  Gift,
  Calendar,
} from 'lucide-react';
import { PetImageGallery } from '@/components/ui/pet-image-gallery';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Pet } from '@/types/pet';
import { useLanguage } from '@/contexts/LanguageContext';
import BirthdayCountdown from '@/components/ui/BirthdayCountdown';
import { QRCodeModal } from './qr-code-modal';

interface PetDetailsViewProps {
  pet: Pet;
  onEdit: (pet: Pet) => void;
  onDelete: (pet: Pet) => void;
}

export const PetDetailsView = ({
  pet,
  onEdit,
  onDelete,
}: PetDetailsViewProps) => {
  const { t } = useLanguage();
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  const formatDate = (date: string) => {
    if (!date) return t("dashboard.pets.notAvailable");
    return new Date(date).toLocaleDateString();
  };

  const calculateAge = (birthday: string) => {
    if (!birthday) return null;
    
    const birthDate = new Date(birthday);
    const today = new Date();
    
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    
    if (months < 0) {
      years--;
      months += 12;
    }
    
    if (years > 0) {
      return `${years} ${years === 1 ? t("dashboard.pets.year") : t("dashboard.pets.years")}`;
    } else {
      return `${months} ${months === 1 ? t("dashboard.pets.month") : t("dashboard.pets.months")}`;
    }
  };

  return (
    <div className="space-y-6 animate-slideDown">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button 
          onClick={() => onEdit(pet)}
          className="flex-1 sm:flex-none h-11"
        >
          <Edit className="h-4 w-4 mr-2" /> {t("dashboard.pets.edit")}
        </Button>
        <Button 
          variant="outline"
          onClick={() => setIsQRModalOpen(true)}
          className="flex-1 sm:flex-none h-11"
        >
          <QrCode className="h-4 w-4 mr-2" /> {t("dashboard.pets.qrCode.show")}
        </Button>
        <Button 
          variant="outline"
          onClick={() => onDelete(pet)}
          className="flex-1 sm:flex-none h-11 border-destructive text-destructive hover:bg-destructive/90 hover:text-destructive-foreground"
        >
          <Trash2 className="h-4 w-4 mr-2" /> {t("dashboard.pets.delete")}
        </Button>
      </div>

      {/* Vital Stats */}
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.pets.vitalStats")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pet.gender && (
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="p-2">
                  <User className="h-4 w-4" />
                </Badge>
                <div>
                  <div className="text-sm text-muted-foreground font-medium">
                    {t("dashboard.pets.gender")}
                  </div>
                  <div className="text-base font-semibold">
                    {pet.gender.charAt(0).toUpperCase() + pet.gender.slice(1)}
                  </div>
                </div>
              </div>
            )}
            
            {pet.color && (
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="p-2">
                  <Heart className="h-4 w-4" />
                </Badge>
                <div>
                  <div className="text-sm text-muted-foreground font-medium">
                    {t("dashboard.pets.color")}
                  </div>
                  <div className="text-base font-semibold">
                    {pet.color}
                  </div>
                </div>
              </div>
            )}
            
            {pet.birthday && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="p-2">
                    <Cake className="h-4 w-4" />
                  </Badge>
                  <div>
                    <div className="text-sm text-muted-foreground font-medium">
                      {t("dashboard.pets.birthday")}
                    </div>
                    <div className="text-base font-semibold">
                      {formatDate(pet.birthday)}
                      {calculateAge(pet.birthday) && ` (${calculateAge(pet.birthday)})`}
                    </div>
                  </div>
                </div>
                <BirthdayCountdown petName={pet.name} birthday={pet.birthday} />
              </div>
            )}
            
            {pet.weight_kg > 0 && (
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="p-2">
                  <Weight className="h-4 w-4" />
                </Badge>
                <div>
                  <div className="text-sm text-muted-foreground font-medium">
                    {t("dashboard.pets.weight")}
                  </div>
                  <div className="text-base font-semibold">
                    {pet.weight_kg} kg
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Health Central */}
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.pets.healthCentral")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="vaccinations" className="w-full">
            <TabsList className="w-full h-12">
              <TabsTrigger 
                value="vaccinations" 
                className="flex-1 h-11"
              >
                {t("dashboard.pets.vaccinations")}
              </TabsTrigger>
              <TabsTrigger 
                value="medications" 
                className="flex-1 h-11"
              >
                {t("dashboard.pets.medications")}
              </TabsTrigger>
              <TabsTrigger 
                value="conditions" 
                className="flex-1 h-11"
              >
                {t("dashboard.pets.conditions")}
              </TabsTrigger>
            </TabsList>
            <div className="mt-6 p-4 bg-muted/10 rounded-lg">
              <TabsContent value="vaccinations">
                {pet.medical_info?.vaccinations?.length > 0 ? (
                  <ul className="space-y-3">
                    {pet.medical_info.vaccinations.map((vaccination: any, index: number) => (
                      <li key={index} className="flex justify-between items-center">
                        <span className="font-medium">{vaccination.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(vaccination.date)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    {t("dashboard.pets.noVaccinations")}
                  </p>
                )}
              </TabsContent>
              <TabsContent value="medications">
                {pet.medical_info?.medications?.length > 0 ? (
                  <ul className="space-y-3">
                    {pet.medical_info.medications.map((medication: string, index: number) => (
                      <li key={index} className="font-medium">{medication}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    {t("dashboard.pets.noMedications")}
                  </p>
                )}
              </TabsContent>
              <TabsContent value="conditions">
                {pet.medical_info?.conditions?.length > 0 ? (
                  <ul className="space-y-3">
                    {pet.medical_info.conditions.map((condition: string, index: number) => (
                      <li key={index} className="font-medium">{condition}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    {t("dashboard.pets.noConditions")}
                  </p>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Pet Story */}
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.pets.story.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Personality Traits */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Stars className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-medium">{t("dashboard.pets.story.personalityTitle")}</h3>
            </div>
            <p className="text-base bg-muted/30 p-4 rounded-md">
              {pet.personality_traits || t("dashboard.pets.story.noPersonality")}
            </p>
          </div>

          {/* Favorite Things */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Gift className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-medium">{t("dashboard.pets.story.favoritesTitle")}</h3>
            </div>
            <p className="text-base bg-muted/30 p-4 rounded-md">
              {pet.favorite_things || t("dashboard.pets.story.noFavorites")}
            </p>
          </div>

          {/* Adoption Day */}
          {pet.adoption_date && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-medium">{t("dashboard.pets.story.adoptionTitle")}</h3>
              </div>
              <p className="text-base bg-muted/30 p-4 rounded-md">
                {formatDate(pet.adoption_date)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Photos */}
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.pets.photos")}</CardTitle>
        </CardHeader>
        <CardContent>
          <PetImageGallery 
            petId={pet.id} 
            onImageChange={() => {}} // Will be handled by parent
            editable={true}
          />
        </CardContent>
      </Card>

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        petName={pet.name}
        petId={pet.id}
      />
    </div>
  );
};
