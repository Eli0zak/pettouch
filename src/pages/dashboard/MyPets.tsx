import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AddPetDialog } from '@/components/ui/add-pet-dialog';
import { EditPetDialog } from '@/components/ui/edit-pet-dialog';
import { MapPin, Calendar, Edit, Trash2, Link, PawPrint, Cake, Weight, Info, Tag, Heart, User, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { PetAvatar } from '@/components/ui/pet-avatar';
import { PetImageGallery } from '@/components/ui/pet-image-gallery';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Define the Pet and DbPet types here instead of importing them
interface DbPet {
  id: string;
  created_at: string;
  owner_id: string;
  name: string;
  type: string;
  breed: string | null;
  gender: string | null;
  color: string | null;
  birthday: string | null;
  microchip_id: string | null;
  weight_kg: number | null;
  profile_image_url: string | null;
  medical_info: any;
  emergency_contact: any;
  veterinarian: any;
  notes: string | null;
  is_active: boolean;
  qr_code_url: string | null;
  scan_count?: number;
  last_scanned_at?: string;
}

interface Pet extends Omit<DbPet, 'breed' | 'birthday' | 'color' | 'gender' | 'microchip_id' | 'weight_kg' | 'profile_image_url'> {
  breed: string;
  birthday: string;
  color: string;
  gender: string;
  microchip_id: string;
  weight_kg: number;
  profile_image_url: string | null;
  scan_count: number;
  last_scanned_at: string;
  medical_info: {
    blood_type: string;
    conditions: string[];
    allergies: string[];
    medications: string[];
    vaccinations: any[];
    last_checkup: string;
    next_checkup: string;
    medical_notes: string;
    veterinarian: {
      name: string;
      phone: string;
      email: string;
      clinic: string;
      address: string;
      specialization: string;
      license_number: string;
    }
  };
  emergency_contact: {
    name: string;
    phone: string;
    email: string;
    relationship: string;
    address: string;
  }
}

interface PetImage {
  id: string;
  pet_id: string;
  image_url: string;
  is_primary: boolean;
  caption: string | null;
  created_at: string;
}

const MyPets = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deletingPet, setDeletingPet] = useState<Pet | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [search, setSearch] = useState('');
  const [filteredPets, setFilteredPets] = useState<Pet[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const { t } = useLanguage();

  const fetchPets = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('owner_id', user.id);

      if (error) throw error;

      // Transform the database records into Pet type
      const petsWithImages = data?.map((dbPet: DbPet) => {
        return {
          ...dbPet,
          profile_image_url: dbPet.profile_image_url || null,
          breed: dbPet.breed || "",
          birthday: dbPet.birthday || "",
          color: dbPet.color || "",
          gender: dbPet.gender || "",
          microchip_id: dbPet.microchip_id || "",
          weight_kg: dbPet.weight_kg || 0,
          scan_count: dbPet.scan_count || 0,
          last_scanned_at: dbPet.last_scanned_at || "",
          medical_info: {
            blood_type: (dbPet.medical_info as any)?.blood_type || "",
            conditions: (dbPet.medical_info as any)?.conditions || [],
            allergies: (dbPet.medical_info as any)?.allergies || [],
            medications: (dbPet.medical_info as any)?.medications || [],
            vaccinations: (dbPet.medical_info as any)?.vaccinations || [],
            last_checkup: (dbPet.medical_info as any)?.last_checkup || "",
            next_checkup: (dbPet.medical_info as any)?.next_checkup || "",
            medical_notes: (dbPet.medical_info as any)?.medical_notes || "",
            veterinarian: {
              name: (dbPet.medical_info as any)?.veterinarian?.name || "",
              phone: (dbPet.medical_info as any)?.veterinarian?.phone || "",
              email: (dbPet.medical_info as any)?.veterinarian?.email || "",
              clinic: (dbPet.medical_info as any)?.veterinarian?.clinic || "",
              address: (dbPet.medical_info as any)?.veterinarian?.address || "",
              specialization: (dbPet.medical_info as any)?.veterinarian?.specialization || "",
              license_number: (dbPet.medical_info as any)?.veterinarian?.license_number || ""
            }
          },
          emergency_contact: {
            name: (dbPet.emergency_contact as any)?.name || "",
            phone: (dbPet.emergency_contact as any)?.phone || "",
            email: (dbPet.emergency_contact as any)?.email || "",
            relationship: (dbPet.emergency_contact as any)?.relationship || "",
            address: (dbPet.emergency_contact as any)?.address || ""
          }
        };
      }) as Pet[];

      setPets(petsWithImages || []);
      
      // If there's only one pet, select it automatically
      if (petsWithImages && petsWithImages.length === 1) {
        setSelectedPet(petsWithImages[0]);
      }
    } catch (error: any) {
      console.error('Error fetching pets:', error);
      toast({
        title: t("error"),
        description: t("dashboard.pets.errors.fetch"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPet) return;
    setLoading(true);

    try {    
      // First fetch all images for this pet
      const { data: petImages, error: fetchImagesError } = await supabase
        .from('pet_images')
        .select('*')
        .eq('pet_id', deletingPet.id);
        
      if (fetchImagesError) throw fetchImagesError;
      
      // Delete all images from storage
      if (petImages && petImages.length > 0) {
        for (const image of petImages) {
          try {
            const urlParts = image.image_url.split('/');
            const fileName = urlParts[urlParts.indexOf('pets') + 1];
            
            await supabase.storage
              .from('pet-images')
              .remove([`pets/${fileName}`]);
          } catch (storageError) {
            console.error('Error deleting image:', storageError);
          }
        }
      }
      
      // Delete the pet record
      const { error: deleteError } = await supabase
        .from('pets')
        .delete()
        .eq('id', deletingPet.id);

      if (deleteError) throw deleteError;

      toast({
        title: t("success"),
        description: t("dashboard.pets.success.deleted"),
      });
      
      // If the deleted pet was selected, clear selection
      if (selectedPet?.id === deletingPet.id) {
        setSelectedPet(null);
      }
      
      fetchPets();
    } catch (error: any) {
      toast({
        title: t("error"),
        description: error.message || t("dashboard.pets.errors.delete"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setDeletingPet(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleDeleteClick = (pet: Pet) => {
    setDeletingPet(pet);
    setIsDeleteDialogOpen(true);
  };

  const handleEdit = (pet: Pet) => {
    setEditingPet(pet);
    setIsEditDialogOpen(true);
  };

  const handleCopyProfileLink = (id: string) => {
    const profileUrl = `${window.location.origin}/pet/${id}`;
    navigator.clipboard.writeText(profileUrl);
    toast({
      title: t("success"),
      description: t("dashboard.pets.success.copied"),
    });
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  useEffect(() => {
    fetchPets();
  }, []);
  
  useEffect(() => {
    if (search.trim() === '') {
      setFilteredPets(pets);
    } else {
      const filtered = pets.filter(
        pet => 
          pet.name.toLowerCase().includes(search.toLowerCase()) ||
          pet.type.toLowerCase().includes(search.toLowerCase()) ||
          pet.breed.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredPets(filtered);
    }
  }, [search, pets]);
  
  useEffect(() => {
    if (activeTab === "all") {
      setFilteredPets(pets);
    } else {
      const filtered = pets.filter(pet => pet.type.toLowerCase() === activeTab.toLowerCase());
      setFilteredPets(filtered);
    }
  }, [activeTab, pets]);

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
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t("dashboard.pets.title")}</h1>
          <p className="text-muted-foreground">{t("dashboard.pets.description")}</p>
        </div>
        <div className="mt-4 md:mt-0">
          <AddPetDialog onSuccess={fetchPets} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar with pet list */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>{t("dashboard.pets.yourPets")}</CardTitle>
              <CardDescription>
                {pets.length > 0 
                  ? t("dashboard.pets.selectPet") 
                  : t("dashboard.pets.noPetsYet")}
              </CardDescription>
              <div className="relative mt-2">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("dashboard.pets.search")}
                  className="pl-8"
                  value={search}
                  onChange={handleSearch}
                />
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <Tabs 
                defaultValue="all" 
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="w-full mb-4">
                  <TabsTrigger value="all" className="flex-1">{t("dashboard.pets.all")}</TabsTrigger>
                  <TabsTrigger value="dog" className="flex-1">{t("dashboard.pets.dogs")}</TabsTrigger>
                  <TabsTrigger value="cat" className="flex-1">{t("dashboard.pets.cats")}</TabsTrigger>
                  <TabsTrigger value="other" className="flex-1">{t("dashboard.pets.others")}</TabsTrigger>
                </TabsList>
              </Tabs>
              
              {loading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-2">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredPets.length > 0 ? (
                    filteredPets.map((pet) => (
                      <div 
                        key={pet.id}
                        className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${
                          selectedPet?.id === pet.id 
                            ? 'bg-primary/10 hover:bg-primary/15' 
                            : 'hover:bg-muted'
                        }`}
                        onClick={() => setSelectedPet(pet)}
                      >
                        <PetAvatar 
                          src={pet.profile_image_url} 
                          fallback={pet.name.charAt(0)} 
                          size="md"
                          petType={pet.type}
                        />
                        <div>
                          <div className="font-medium">{pet.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {pet.breed || pet.type.charAt(0).toUpperCase() + pet.type.slice(1)}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      {search ? t("dashboard.pets.noMatchingPets") : t("dashboard.pets.noPetsFound")}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
            {pets.length === 0 && !loading && (
              <CardFooter className="pt-0">
                <div className="w-full flex flex-col items-center justify-center py-6">
                  <PawPrint className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center mb-4">{t("dashboard.pets.emptyState")}</p>
                  <AddPetDialog onSuccess={fetchPets} />
                </div>
              </CardFooter>
            )}
          </Card>
        </div>
        
        {/* Main content area */}
        <div className="lg:col-span-2">
          {loading ? (
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-center items-center h-64">
                  <LoadingSpinner size="lg" text={t("dashboard.pets.loading")} />
                </div>
              </CardContent>
            </Card>
          ) : selectedPet ? (
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl">{selectedPet.name}</CardTitle>
                      <CardDescription>
                        {selectedPet.breed || selectedPet.type.charAt(0).toUpperCase() + selectedPet.type.slice(1)}
                        {selectedPet.birthday && ` • ${calculateAge(selectedPet.birthday)}`}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEdit(selectedPet)}
                      >
                        <Edit className="h-4 w-4 mr-2" /> {t("dashboard.pets.edit")}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleCopyProfileLink(selectedPet.id)}
                      >
                        <Link className="h-4 w-4 mr-2" /> {t("dashboard.pets.share")}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <PetImageGallery 
                    petId={selectedPet.id} 
                    onImageChange={fetchPets}
                    editable={true}
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>{t("dashboard.pets.details")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedPet.gender && (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="p-1.5">
                          <User className="h-4 w-4" />
                        </Badge>
                        <div>
                          <div className="text-sm font-medium">{t("dashboard.pets.gender")}</div>
                          <div className="text-sm text-muted-foreground">
                            {selectedPet.gender.charAt(0).toUpperCase() + selectedPet.gender.slice(1)}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {selectedPet.color && (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="p-1.5">
                          <Heart className="h-4 w-4" />
                        </Badge>
                        <div>
                          <div className="text-sm font-medium">{t("dashboard.pets.color")}</div>
                          <div className="text-sm text-muted-foreground">{selectedPet.color}</div>
                        </div>
                      </div>
                    )}
                    
                    {selectedPet.birthday && (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="p-1.5">
                          <Cake className="h-4 w-4" />
                        </Badge>
                        <div>
                          <div className="text-sm font-medium">{t("dashboard.pets.birthday")}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(selectedPet.birthday)}
                            {calculateAge(selectedPet.birthday) && ` (${calculateAge(selectedPet.birthday)})`}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {selectedPet.weight_kg > 0 && (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="p-1.5">
                          <Weight className="h-4 w-4" />
                        </Badge>
                        <div>
                          <div className="text-sm font-medium">{t("dashboard.pets.weight")}</div>
                          <div className="text-sm text-muted-foreground">{selectedPet.weight_kg} kg</div>
                        </div>
                      </div>
                    )}
                    
                    {selectedPet.microchip_id && (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="p-1.5">
                          <Tag className="h-4 w-4" />
                        </Badge>
                        <div>
                          <div className="text-sm font-medium">{t("dashboard.pets.microchip")}</div>
                          <div className="text-sm text-muted-foreground">{selectedPet.microchip_id}</div>
                        </div>
                      </div>
                    )}
                    
                    {selectedPet.scan_count > 0 && (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="p-1.5">
                          <Search className="h-4 w-4" />
                        </Badge>
                        <div>
                          <div className="text-sm font-medium">{t("dashboard.pets.scans")}</div>
                          <div className="text-sm text-muted-foreground">
                            {selectedPet.scan_count} {selectedPet.scan_count === 1 ? t("dashboard.pets.scan") : t("dashboard.pets.scans")}
                            {selectedPet.last_scanned_at && ` • ${t("dashboard.pets.lastScan")}: ${formatDate(selectedPet.last_scanned_at)}`}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {selectedPet.notes && (
                    <div className="mt-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Info className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-medium">{t("dashboard.pets.notes")}</h3>
                      </div>
                      <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md">
                        {selectedPet.notes}
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="border-t pt-6">
                  <Button 
                    variant="destructive" 
                    className="w-full sm:w-auto"
                    onClick={() => handleDeleteClick(selectedPet)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> {t("dashboard.pets.delete")}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <PawPrint className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">{t("dashboard.pets.selectPetPrompt")}</h3>
                  <p className="text-muted-foreground mb-6">{t("dashboard.pets.selectPetDescription")}</p>
                  {pets.length === 0 && (
                    <AddPetDialog onSuccess={fetchPets} />
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {editingPet && (
        <EditPetDialog 
          pet={editingPet}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSuccess={fetchPets}
        />
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("dashboard.pets.deleteDialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("dashboard.pets.deleteDialog.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingPet(null)}>
              {t("dashboard.pets.deleteDialog.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={handleDeleteConfirm}
            >
              {t("dashboard.pets.deleteDialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyPets;
