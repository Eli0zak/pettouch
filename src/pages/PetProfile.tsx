import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, Mail, Phone, Calendar, Clock, MapPin, Info, Heart, 
  ArrowLeft, Building, Shield, AlertTriangle 
} from 'lucide-react';
import { PetAvatar } from '@/components/ui/pet-avatar';
import { Separator } from '@/components/ui/separator';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAuth } from '@/components/PageGuard';
import { useLanguage } from '@/contexts/LanguageContext';
import { logger } from '@/utils/logger';

const PetProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [pet, setPet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated, userId } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    const fetchPet = async () => {
      if (!isAuthenticated) {
        toast({
          title: "Authentication Required",
          description: "Please login to view pet profiles",
          variant: "destructive",
        });
        setNotFound(true);
        setLoading(false);
        return;
      }
      if (!id) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('pets')
          .select('*, owner_id')
          .eq('id', id)
          .single();

        if (error) {
          logger.error('Error fetching pet', { error, petId: id });
          setNotFound(true);
        } else if (data) {
          // Check if the user is the owner of the pet
          if (data.owner_id !== userId) {
            logger.warn('Unauthorized access attempt to pet profile', { petId: id, userId });
            toast({
              title: "Access Denied",
              description: "You don't have permission to view this pet profile",
              variant: "destructive",
            });
            setNotFound(true);
          } else {
            logger.info('Pet data fetched successfully', { petId: id, petName: data.name });
            setPet(data);
          }
        } else {
          setNotFound(true);
        }
      } catch (error) {
        logger.error('Error fetching pet profile', { error, petId: id });
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPet();
  }, [id]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner size="lg" text="Loading pet profile..." />
        </div>
      </Layout>
    );
  }

  if (notFound || !pet) {
    return (
      <Layout>
        <div className="container mx-auto py-10 px-4">
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-10">
              <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Pet Not Found</h2>
              <p className="text-gray-600 mb-6">The pet profile you're looking for doesn't exist or may have been removed.</p>
              <Link to="/dashboard/pets">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to My Pets
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const petName = pet.name || 'Unknown';
  const petType = pet.type || 'Unknown';
  const breed = pet.breed || 'Unknown';
  const gender = pet.gender ? pet.gender.charAt(0).toUpperCase() + pet.gender.slice(1) : 'Unknown';
  const medicalInfo = pet.medical_info || {};
  const emergencyContact = pet.emergency_contact || {};
  const veterinarian = medicalInfo.veterinarian || {};

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          {isAuthenticated ? (
            <Link to="/dashboard/pets" className="inline-flex items-center text-pet-primary hover:underline mb-4">
              <ArrowLeft className="h-4 w-4 mr-1" /> {t('dashboard.backToPets') || 'Back to My Pets'}
            </Link>
          ) : (
            <Link to="/" className="inline-flex items-center text-pet-primary hover:underline mb-4">
              <ArrowLeft className="h-4 w-4 mr-1" /> {t('tagPage.backToHome') || 'Back to Home'}
            </Link>
          )}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="flex flex-col items-center">
              <PetAvatar 
                src={pet.profile_image_url} 
                fallback={petName.charAt(0)}
                size="xl"
                petType={petType}
                className="h-32 w-32" 
              />
              <Badge className="mt-4" variant="outline">
                {petType.charAt(0).toUpperCase() + petType.slice(1)}
              </Badge>
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{petName}</h1>
              <div className="flex flex-wrap gap-2 mt-2">
                {pet.breed && (
                  <Badge variant="secondary">{breed}</Badge>
                )}
                {pet.gender && (
                  <Badge variant="secondary">{gender}</Badge>
                )}
                {pet.color && (
                  <Badge variant="secondary">{pet.color}</Badge>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {pet.birthday && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-pet-primary" />
                    <span>Born: {formatDate(pet.birthday)}</span>
                  </div>
                )}
                {pet.microchip_id && (
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-pet-primary" />
                    <span>ID: {pet.microchip_id}</span>
                  </div>
                )}
                {pet.weight_kg && (
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-pet-primary" />
                    <span>Weight: {pet.weight_kg} kg</span>
                  </div>
                )}
                {pet.last_scanned_at && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-pet-primary" />
                    <span>Last Scanned: {formatDate(pet.last_scanned_at)}</span>
                  </div>
                )}
              </div>
              
              {pet.notes && (
                <div className="mt-4 p-3 bg-muted/30 rounded-md">
                  <h4 className="font-semibold mb-1">Notes</h4>
                  <p>{pet.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
          {/* Medical Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="h-5 w-5 mr-2 text-pet-primary" />
                Medical Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {medicalInfo.blood_type && (
                <div>
                  <h4 className="font-semibold text-sm">Blood Type</h4>
                  <p>{medicalInfo.blood_type}</p>
                </div>
              )}
              
              {medicalInfo.conditions && medicalInfo.conditions.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm">Conditions</h4>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {medicalInfo.conditions.map((condition: string, i: number) => (
                      <Badge key={i} variant="outline">{condition}</Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {medicalInfo.allergies && medicalInfo.allergies.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm">Allergies</h4>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {medicalInfo.allergies.map((allergy: string, i: number) => (
                      <Badge key={i} variant="outline">{allergy}</Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {medicalInfo.medications && medicalInfo.medications.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm">Medications</h4>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {medicalInfo.medications.map((medication: string, i: number) => (
                      <Badge key={i} variant="outline">{medication}</Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {medicalInfo.last_checkup && (
                <div>
                  <h4 className="font-semibold text-sm">Last Checkup</h4>
                  <p>{formatDate(medicalInfo.last_checkup)}</p>
                </div>
              )}
              
              {medicalInfo.next_checkup && (
                <div>
                  <h4 className="font-semibold text-sm">Next Checkup</h4>
                  <p>{formatDate(medicalInfo.next_checkup)}</p>
                </div>
              )}
              
              {medicalInfo.medical_notes && (
                <div>
                  <h4 className="font-semibold text-sm">Medical Notes</h4>
                  <p className="text-sm">{medicalInfo.medical_notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Phone className="h-5 w-5 mr-2 text-pet-primary" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.keys(veterinarian).some(key => veterinarian[key]) && (
                <div>
                  <h4 className="font-semibold flex items-center mb-3">
                    <Building className="h-4 w-4 mr-1" /> Veterinarian
                  </h4>
                  <div className="space-y-2">
                    {veterinarian.name && (
                      <div className="flex items-start gap-2">
                        <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span>{veterinarian.name}</span>
                      </div>
                    )}
                    
                    {veterinarian.clinic && (
                      <div className="flex items-start gap-2">
                        <Building className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span>{veterinarian.clinic}</span>
                      </div>
                    )}
                    
                    {veterinarian.phone && (
                      <div className="flex items-start gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span>{veterinarian.phone}</span>
                      </div>
                    )}
                    
                    {veterinarian.email && (
                      <div className="flex items-start gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span>{veterinarian.email}</span>
                      </div>
                    )}
                    
                    {veterinarian.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span className="flex-1">{veterinarian.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {Object.keys(emergencyContact).some(key => emergencyContact[key]) && (
                <div>
                  <Separator className="my-4" />
                  <h4 className="font-semibold flex items-center mb-3">
                    <AlertTriangle className="h-4 w-4 mr-1" /> Emergency Contact
                  </h4>
                  <div className="space-y-2">
                    {emergencyContact.name && (
                      <div className="flex items-start gap-2">
                        <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span>{emergencyContact.name}</span>
                        {emergencyContact.relationship && (
                          <span className="text-xs text-muted-foreground">({emergencyContact.relationship})</span>
                        )}
                      </div>
                    )}
                    
                    {emergencyContact.phone && (
                      <div className="flex items-start gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span>{emergencyContact.phone}</span>
                      </div>
                    )}
                    
                    {emergencyContact.email && (
                      <div className="flex items-start gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span>{emergencyContact.email}</span>
                      </div>
                    )}
                    
                    {emergencyContact.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span className="flex-1">{emergencyContact.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default PetProfile;
