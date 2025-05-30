import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./dialog";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
import { PetImageGallery } from './pet-image-gallery';
import { Textarea } from './textarea';
import { useLanguage } from '@/contexts/LanguageContext';

interface EditPetDialogProps {
  pet: {
    id: string;
    name: string;
    type: string;
    breed: string;
    birthday: string;
    gender: string;
    notes: string | null;
    color: string;
    weight_kg: number;
    microchip_id: string;
    profile_image_url: string | null;
    medical_info?: {
      blood_type?: string;
      conditions?: string[];
      allergies?: string[];
      medications?: string[];
      vaccinations?: Array<{
        name: string;
        date: string;
        next_due: string;
      }>;
      last_checkup?: string;
      next_checkup?: string;
      medical_notes?: string;
      veterinarian?: {
        name: string;
        phone: string;
        email: string;
        address?: string;
        clinic?: string;
        specialization?: string;
        license_number?: string;
      };
    };
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditPetDialog({ pet, open, onOpenChange, onSuccess }: EditPetDialogProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("basic");
  const { t } = useLanguage();

  const [petData, setPetData] = useState({
    name: pet.name,
    type: pet.type,
    breed: pet.breed,
    gender: pet.gender,
    birthday: pet.birthday,
    color: pet.color,
    weight_kg: pet.weight_kg,
    microchip_id: pet.microchip_id,
    notes: pet.notes || "",
    profile_image_url: pet.profile_image_url,
    medical_info: {
      blood_type: pet.medical_info?.blood_type || "",
      conditions: pet.medical_info?.conditions || [],
      allergies: pet.medical_info?.allergies || [],
      medications: pet.medical_info?.medications || [],
      vaccinations: pet.medical_info?.vaccinations || [],
      last_checkup: pet.medical_info?.last_checkup || "",
      next_checkup: pet.medical_info?.next_checkup || "",
      medical_notes: pet.medical_info?.medical_notes || "",
      veterinarian: {
        name: pet.medical_info?.veterinarian?.name || "",
        phone: pet.medical_info?.veterinarian?.phone || "",
        email: pet.medical_info?.veterinarian?.email || "",
        clinic: pet.medical_info?.veterinarian?.clinic || "",
        address: pet.medical_info?.veterinarian?.address || "",
        specialization: pet.medical_info?.veterinarian?.specialization || "",
        license_number: pet.medical_info?.veterinarian?.license_number || ""
      }
    }
  });

  useEffect(() => {
    if (open) {
      setPetData({
        name: pet.name || "",
        type: pet.type || "",
        breed: pet.breed || "",
        gender: pet.gender || "",
        birthday: pet.birthday || "",
        color: pet.color || "",
        weight_kg: pet.weight_kg || 0,
        microchip_id: pet.microchip_id || "",
        notes: pet.notes || "",
        profile_image_url: pet.profile_image_url,
        medical_info: {
          blood_type: pet.medical_info?.blood_type || "",
          conditions: pet.medical_info?.conditions || [],
          allergies: pet.medical_info?.allergies || [],
          medications: pet.medical_info?.medications || [],
          vaccinations: pet.medical_info?.vaccinations || [],
          last_checkup: pet.medical_info?.last_checkup || "",
          next_checkup: pet.medical_info?.next_checkup || "",
          medical_notes: pet.medical_info?.medical_notes || "",
          veterinarian: {
            name: pet.medical_info?.veterinarian?.name || "",
            phone: pet.medical_info?.veterinarian?.phone || "",
            email: pet.medical_info?.veterinarian?.email || "",
            clinic: pet.medical_info?.veterinarian?.clinic || "",
            address: pet.medical_info?.veterinarian?.address || "",
            specialization: pet.medical_info?.veterinarian?.specialization || "",
            license_number: pet.medical_info?.veterinarian?.license_number || ""
          }
        }
      });
      setActiveTab("basic");
    }
  }, [pet, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!petData.name || !petData.type) {
      toast({
        title: t("error"),
        description: t("dashboard.pets.errors.requiredFields"),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const updates: any = {
        name: petData.name.trim(),
        type: petData.type.toLowerCase(),
        breed: petData.breed.trim() || null,
        gender: petData.gender || null,
        birthday: petData.birthday || null,
        notes: petData.notes.trim() || null,
        color: petData.color || null,
        weight_kg: petData.weight_kg || null,
        microchip_id: petData.microchip_id || null,
        medical_info: {
          blood_type: petData.medical_info.blood_type || null,
          conditions: petData.medical_info.conditions || null,
          allergies: petData.medical_info.allergies || null,
          medications: petData.medical_info.medications || null,
          vaccinations: petData.medical_info.vaccinations || null,
          last_checkup: petData.medical_info.last_checkup || null,
          next_checkup: petData.medical_info.next_checkup || null,
          medical_notes: petData.medical_info.medical_notes || null,
          veterinarian: {
            name: petData.medical_info.veterinarian.name || null,
            phone: petData.medical_info.veterinarian.phone || null,
            email: petData.medical_info.veterinarian.email || null,
            clinic: petData.medical_info.veterinarian.clinic || null,
            address: petData.medical_info.veterinarian.address || null,
            specialization: petData.medical_info.veterinarian.specialization || null,
            license_number: petData.medical_info.veterinarian.license_number || null
          }
        }
      };

      const { error } = await supabase
        .from("pets")
        .update(updates)
        .eq('id', pet.id);

      if (error) throw error;

      toast({
        title: t("success"),
        description: t("dashboard.pets.success.updated"),
      });

      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast({
        title: t("error"),
        description: error.message || t("dashboard.pets.errors.update"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t("dashboard.pets.edit.title")}</DialogTitle>
          <DialogDescription>
            {t("dashboard.pets.edit.description")}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="basic">{t("dashboard.pets.edit.tabs.basic")}</TabsTrigger>
            <TabsTrigger value="images">{t("dashboard.pets.edit.tabs.images")}</TabsTrigger>
            <TabsTrigger value="details">{t("dashboard.pets.edit.tabs.details")}</TabsTrigger>
          </TabsList>
          
          <form onSubmit={handleSubmit}>
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="name">{t("dashboard.pets.edit.name")}*</Label>
                  <Input
                    id="name"
                    value={petData.name}
                    onChange={(e) => setPetData({ ...petData, name: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="type">{t("dashboard.pets.edit.type")}*</Label>
                  <Select
                    value={petData.type}
                    onValueChange={(value) => setPetData({ ...petData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dog">{t("dashboard.pets.types.dog")}</SelectItem>
                      <SelectItem value="cat">{t("dashboard.pets.types.cat")}</SelectItem>
                      <SelectItem value="bird">{t("dashboard.pets.types.bird")}</SelectItem>
                      <SelectItem value="other">{t("dashboard.pets.types.other")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="breed">{t("dashboard.pets.edit.breed")}</Label>
                  <Input
                    id="breed"
                    value={petData.breed}
                    onChange={(e) => setPetData({ ...petData, breed: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="gender">{t("dashboard.pets.edit.gender")}</Label>
                  <Select
                    value={petData.gender}
                    onValueChange={(value) => setPetData({ ...petData, gender: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">{t("dashboard.pets.genders.male")}</SelectItem>
                      <SelectItem value="female">{t("dashboard.pets.genders.female")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="birthday">{t("dashboard.pets.edit.birthday")}</Label>
                  <Input
                    id="birthday"
                    type="date"
                    value={petData.birthday}
                    onChange={(e) => setPetData({ ...petData, birthday: e.target.value })}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div>
                  <Label htmlFor="color">{t("dashboard.pets.edit.color")}</Label>
                  <Input
                    id="color"
                    value={petData.color}
                    onChange={(e) => setPetData({ ...petData, color: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="weight">{t("dashboard.pets.edit.weight")}</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={petData.weight_kg}
                    onChange={(e) => setPetData({ ...petData, weight_kg: parseFloat(e.target.value) })}
                    step="0.1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="microchip">{t("dashboard.pets.edit.microchip")}</Label>
                  <Input
                    id="microchip"
                    value={petData.microchip_id}
                    onChange={(e) => setPetData({ ...petData, microchip_id: e.target.value })}
                  />
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="notes">{t("dashboard.pets.edit.notes")}</Label>
                  <Textarea
                    id="notes"
                    value={petData.notes}
                    onChange={(e) => setPetData({ ...petData, notes: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="images">
              <div className="space-y-4">
                <PetImageGallery petId={pet.id} onImageChange={() => {}} />
              </div>
            </TabsContent>
            
            <TabsContent value="details" className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">{t("dashboard.pets.edit.medicalInfo")}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="blood_type">{t("dashboard.pets.edit.bloodType")}</Label>
                    <Input
                      id="blood_type"
                      value={petData.medical_info.blood_type}
                      onChange={(e) => setPetData({
                        ...petData,
                        medical_info: { ...petData.medical_info, blood_type: e.target.value }
                      })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="last_checkup">{t("dashboard.pets.edit.lastCheckup")}</Label>
                    <Input
                      id="last_checkup"
                      type="date"
                      value={petData.medical_info.last_checkup}
                      onChange={(e) => setPetData({
                        ...petData,
                        medical_info: { ...petData.medical_info, last_checkup: e.target.value }
                      })}
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="next_checkup">{t("dashboard.pets.edit.nextCheckup")}</Label>
                    <Input
                      id="next_checkup"
                      type="date"
                      value={petData.medical_info.next_checkup}
                      onChange={(e) => setPetData({
                        ...petData,
                        medical_info: { ...petData.medical_info, next_checkup: e.target.value }
                      })}
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <Label htmlFor="medical_notes">{t("dashboard.pets.edit.medicalNotes")}</Label>
                    <Textarea
                      id="medical_notes"
                      value={petData.medical_info.medical_notes}
                      onChange={(e) => setPetData({
                        ...petData,
                        medical_info: { ...petData.medical_info, medical_notes: e.target.value }
                      })}
                      rows={2}
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">{t("dashboard.pets.edit.veterinarian")}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="vet_name">{t("dashboard.pets.edit.vetName")}</Label>
                    <Input
                      id="vet_name"
                      value={petData.medical_info.veterinarian.name}
                      onChange={(e) => setPetData({
                        ...petData,
                        medical_info: {
                          ...petData.medical_info,
                          veterinarian: { ...petData.medical_info.veterinarian, name: e.target.value }
                        }
                      })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="vet_phone">{t("dashboard.pets.edit.vetPhone")}</Label>
                    <Input
                      id="vet_phone"
                      value={petData.medical_info.veterinarian.phone}
                      onChange={(e) => setPetData({
                        ...petData,
                        medical_info: {
                          ...petData.medical_info,
                          veterinarian: { ...petData.medical_info.veterinarian, phone: e.target.value }
                        }
                      })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="vet_email">{t("dashboard.pets.edit.vetEmail")}</Label>
                    <Input
                      id="vet_email"
                      type="email"
                      value={petData.medical_info.veterinarian.email}
                      onChange={(e) => setPetData({
                        ...petData,
                        medical_info: {
                          ...petData.medical_info,
                          veterinarian: { ...petData.medical_info.veterinarian, email: e.target.value }
                        }
                      })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="vet_clinic">{t("dashboard.pets.edit.vetClinic")}</Label>
                    <Input
                      id="vet_clinic"
                      value={petData.medical_info.veterinarian.clinic}
                      onChange={(e) => setPetData({
                        ...petData,
                        medical_info: {
                          ...petData.medical_info,
                          veterinarian: { ...petData.medical_info.veterinarian, clinic: e.target.value }
                        }
                      })}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t("dashboard.pets.edit.cancel")}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t("dashboard.pets.edit.save")}
              </Button>
            </DialogFooter>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
