import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AddPetDialog } from '@/components/ui/add-pet-dialog';
import { EditPetDialog } from '@/components/ui/edit-pet-dialog';
import { PawPrint, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
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
import { type Pet } from '@/types/pet';
import { PetSummaryCard } from '@/components/ui/pet-summary-card';
import { PetDetailsView } from '@/components/ui/pet-details-view';

const MyPets = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deletingPet, setDeletingPet] = useState<Pet | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [expandedPetId, setExpandedPetId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filteredPets, setFilteredPets] = useState<Pet[]>([]);
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
      const transformedPets = data?.map((dbPet: DbPet) => ({
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
      })) as Pet[];

      setPets(transformedPets || []);
      setExpandedPetId(transformedPets?.length === 1 ? transformedPets[0].id : null);
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
      
      setExpandedPetId(null);
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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handlePetToggle = (petId: string) => {
    setExpandedPetId(currentId => currentId === petId ? null : petId);
  };

  useEffect(() => {
    fetchPets();
  }, []);

  useEffect(() => {
    const filterPets = () => {
      if (search.trim() === '') {
        setFilteredPets(pets);
      } else {
        const searchLower = search.toLowerCase();
        const filtered = pets.filter(pet => 
          pet.name.toLowerCase().includes(searchLower) ||
          pet.type.toLowerCase().includes(searchLower) ||
          pet.breed.toLowerCase().includes(searchLower)
        );
        setFilteredPets(filtered);
      }
    };

    filterPets();
  }, [search, pets]);

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t("dashboard.pets.title")}</h1>
          <p className="text-muted-foreground">{t("dashboard.pets.description")}</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <AddPetDialog onSuccess={fetchPets} />
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t("dashboard.pets.search")}
          className="pl-9"
          value={search}
          onChange={handleSearch}
        />
      </div>

      {/* Pet List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      ) : filteredPets.length > 0 ? (
        <div className="space-y-4">
          {filteredPets.map(pet => (
            <div key={pet.id} className="space-y-4">
              <PetSummaryCard
                pet={pet}
                isExpanded={expandedPetId === pet.id}
                onToggle={() => handlePetToggle(pet.id)}
              />
              {expandedPetId === pet.id && (
                <PetDetailsView
                  pet={pet}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                />
              )}
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <PawPrint className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">
              {search ? t("dashboard.pets.noMatchingPets") : t("dashboard.pets.noPetsYet")}
            </h3>
            <p className="text-muted-foreground mb-6">
              {search ? t("dashboard.pets.tryDifferentSearch") : t("dashboard.pets.addNewPetDescription")}
            </p>
            {!search && <AddPetDialog onSuccess={fetchPets} />}
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
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
