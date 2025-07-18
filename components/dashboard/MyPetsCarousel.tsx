import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronRight, Plus } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface Pet {
  id: string;
  name: string;
  profile_image_url: string;
  breed: string;
  birthday: string;
  color: string;
  gender: string;
  microchip_id: string;
  weight_kg: number;
  medical_info?: any;
  emergency_contact?: any;
}

interface MyPetsCarouselProps {
  onManagePets: () => void;
  onPetClick: (petId: string) => void;
}

const requiredFields = ['breed', 'birthday', 'color', 'gender', 'microchip_id', 'weight_kg'];

const MyPetsCarousel: React.FC<MyPetsCarouselProps> = ({ onManagePets, onPetClick }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);

  const calculateProfileCompleteness = (pet: Pet): number => {
    const filledFields = requiredFields.filter(field => 
      pet[field as keyof Pet] && pet[field as keyof Pet] !== ''
    );
    return Math.round((filledFields.length / requiredFields.length) * 100);
  };

  const getMissingFields = (pet: Pet): string[] => {
    return requiredFields.filter(field => 
      !pet[field as keyof Pet] || pet[field as keyof Pet] === ''
    );
  };

  const fetchPets = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('User not authenticated');
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('pets')
        .select('*')
        .eq('owner_id', user.id);

      if (fetchError) throw fetchError;

      const transformedPets = data?.map(pet => ({
        ...pet,
        profileCompleteness: calculateProfileCompleteness(pet),
        missingFields: getMissingFields(pet),
        photoUrl: pet.profile_image_url
      })) || [];

      setPets(transformedPets);
    } catch (err) {
      console.error('Error fetching pets:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch pets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPets();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8 min-h-[200px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-700 text-sm">Error loading pets: {error}</p>
        </div>
        <Button 
          variant="outline"
          onClick={() => window.location.reload()}
          size="sm"
          className="w-full"
        >
          Retry
        </Button>
      </div>
    );
  }

  if (pets.length === 0) {
    return (
      <div className="space-y-4 p-4">
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
              <Plus className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-800">Start your pet care journey</h3>
            <p className="text-gray-600 text-sm mb-6">Add your first pet to track their health and appointments</p>
            <Button 
              onClick={onManagePets}
              className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-lg font-medium"
            >
              Add Your First Pet
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (pets.length === 1) {
    const pet = pets[0];
    const completeness = pet.profileCompleteness || 0;
    
    return (
      <div className="space-y-4 p-4">
        <Card 
          className="cursor-pointer hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-primary/5 to-transparent border-primary/10"
          onClick={() => onPetClick(pet.id)}
        >
          <CardContent className="p-0">
            {/* صورة الحيوان الأليف */}
            <div className="relative h-48 bg-gray-100 overflow-hidden rounded-t-lg">
              <img
                src={pet.photoUrl || '/placeholder-pet.jpg'}
                alt={pet.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h2 className="text-xl font-bold text-white mb-1">{pet.name}</h2>
                <p className="text-white/80 text-sm">{pet.breed || 'Not specified'}</p>
              </div>
            </div>
            
            {/* معلومات الملف الشخصي */}
            <div className="p-4 space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Profile Status</span>
                  <span className={`text-sm font-bold px-2 py-1 rounded-full text-xs ${
                    completeness >= 80 ? 'bg-green-100 text-green-700' :
                    completeness >= 50 ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {completeness}% Complete
                  </span>
                </div>
                
                <div className="relative">
                  <Progress 
                    value={completeness} 
                    className="h-2 bg-gray-100 rounded-full overflow-hidden"
                  />
                  <div 
                    className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-300 ${
                      completeness >= 80 ? 'bg-green-500' :
                      completeness >= 50 ? 'bg-amber-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${completeness}%` }}
                  />
                </div>
                
                {pet.missingFields && pet.missingFields.length > 0 && (
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                    <p className="text-xs text-primary font-medium">
                      🎯 Next step: Add {pet.missingFields[0]}
                    </p>
                  </div>
                )}
              </div>
              
              {/* معلومات سريعة */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Age</p>
                  <p className="text-sm font-medium">
                    {pet.birthday ? `${new Date().getFullYear() - new Date(pet.birthday).getFullYear()} years` : 'Not set'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Weight</p>
                  <p className="text-sm font-medium">
                    {pet.weight_kg ? `${pet.weight_kg} kg` : 'Not set'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Button 
          variant="outline" 
          className="w-full flex items-center justify-center hover:bg-primary/5 py-3 font-medium"
          onClick={onManagePets}
        >
          Manage Profile
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    );
  }

  // عرض متعدد الحيوانات الأليفة
  return (
    <div className="space-y-4">
      <div className="px-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">Your Pets</h2>
        <p className="text-sm text-gray-600">Select a pet to view details</p>
      </div>
      
      <div className="relative">
        <div className="overflow-x-auto pb-4 scrollbar-hide">
          <div className="flex space-x-4 px-4 first:pl-4 last:pr-4">
            {pets.map((pet) => {
              const completeness = pet.profileCompleteness || 0;
              
              return (
                <Card 
                  key={pet.id}
                  className="flex-shrink-0 w-[220px] cursor-pointer hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-primary/5 to-transparent border-primary/10"
                  onClick={() => onPetClick(pet.id)}
                >
                  <CardContent className="p-0">
                    {/* صورة الحيوان */}
                    <div className="relative h-32 bg-gray-100 overflow-hidden rounded-t-lg">
                      <img
                        src={pet.photoUrl || '/placeholder-pet.jpg'}
                        alt={pet.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-2 left-3 right-3">
                        <h3 className="font-semibold text-white text-sm truncate">{pet.name}</h3>
                        <p className="text-white/80 text-xs truncate">{pet.breed || 'Not specified'}</p>
                      </div>
                    </div>
                    
                    {/* معلومات المتابعة */}
                    <div className="p-3 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Profile Status</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          completeness >= 80 ? 'bg-green-100 text-green-700' :
                          completeness >= 50 ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {completeness}%
                        </span>
                      </div>
                      
                      <div className="relative">
                        <Progress 
                          value={completeness} 
                          className="h-1.5 bg-gray-100 rounded-full overflow-hidden"
                        />
                        <div 
                          className={`absolute top-0 left-0 h-1.5 rounded-full transition-all duration-300 ${
                            completeness >= 80 ? 'bg-green-500' :
                            completeness >= 50 ? 'bg-amber-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${completeness}%` }}
                        />
                      </div>
                      
                      {pet.missingFields && pet.missingFields.length > 0 && (
                        <div className="bg-primary/10 rounded p-2">
                          <p className="text-xs text-primary font-medium truncate">
                            Add: {pet.missingFields[0]}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
        
        {/* مؤشرات التمرير */}
        <div className="absolute left-0 top-0 bottom-4 w-4 bg-gradient-to-r from-white to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-4 w-4 bg-gradient-to-l from-white to-transparent pointer-events-none" />
      </div>
      
      <div className="px-4">
        <Button 
          variant="outline" 
          className="w-full flex items-center justify-center hover:bg-primary/5 py-3 font-medium"
          onClick={onManagePets}
        >
          Manage All Pets
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default MyPetsCarousel;