import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./dialog";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Textarea } from "./textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";
import { uploadPetImage } from '@/lib/upload-helper';
import { ImagePlus } from 'lucide-react';
import { Separator } from './separator';
import { Badge } from './badge';

// Validation functions
const validateEmail = (email: string): boolean => {
  if (!email) return true; // Allow empty email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone: string): boolean => {
  if (!phone) return true; // Allow empty phone
  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone);
};

const validateWeight = (weight: number): boolean => {
  if (!weight) return true; // Allow zero weight
  return weight > 0 && weight < 1000; // Reasonable weight range
};

export function AddPetDialog({ onSuccess }: { onSuccess?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  const [petData, setPetData] = useState({
    name: "",
    type: "",
    breed: "",
    gender: "",
    birthday: "",
    color: "",
    weight_kg: 0,
    microchip_id: "",
    notes: "",
    medical_info: {
      blood_type: "",
      conditions: [] as string[],
      allergies: [] as string[],
      medications: [] as string[],
      vaccinations: [] as { name: string; date: string; next_due: string }[],
      last_checkup: "",
      next_checkup: "",
      medical_notes: "",
      veterinarian: {
        name: "",
        phone: "",
        email: "",
        clinic: "",
        address: "",
        specialization: "",
        license_number: ""
      }
    },
    emergency_contact: {
      name: "",
      phone: "",
      email: "",
      relationship: "",
      address: "",
    }
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "Error",
          description: "Image size should be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    // Required fields
    if (!petData.name.trim()) {
      errors.name = "Pet name is required";
    }
    
    if (!petData.type) {
      errors.type = "Pet type is required";
    }
    
    // Email validations
    if (petData.medical_info.veterinarian.email && !validateEmail(petData.medical_info.veterinarian.email)) {
      errors.vetEmail = "Please enter a valid email address";
    }
    
    if (petData.emergency_contact.email && !validateEmail(petData.emergency_contact.email)) {
      errors.emergencyEmail = "Please enter a valid email address";
    }
    
    // Phone validations
    if (petData.medical_info.veterinarian.phone && !validatePhone(petData.medical_info.veterinarian.phone)) {
      errors.vetPhone = "Please enter a valid phone number";
    }
    
    if (petData.emergency_contact.phone && !validatePhone(petData.emergency_contact.phone)) {
      errors.emergencyPhone = "Please enter a valid phone number";
    }
    
    // Weight validation
    if (petData.weight_kg && !validateWeight(petData.weight_kg)) {
      errors.weight = "Please enter a valid weight (0-1000 kg)";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please correct the errors in the form",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      const formattedPetData = {
        name: petData.name.trim(),
        type: petData.type.toLowerCase(),
        breed: petData.breed.trim() || null,
        gender: petData.gender || null,
        birthday: petData.birthday || null,
        owner_id: user.id,
        color: petData.color || null,
        weight_kg: petData.weight_kg || null,
        microchip_id: petData.microchip_id || null,
        notes: petData.notes || null,
        medical_info: {
          ...petData.medical_info,
          conditions: petData.medical_info.conditions.filter(Boolean),
          allergies: petData.medical_info.allergies.filter(Boolean),
          medications: petData.medical_info.medications.filter(Boolean),
          vaccinations: petData.medical_info.vaccinations.filter(v => v.name && v.date)
        },
        emergency_contact: {
          ...petData.emergency_contact
        }
      };

      const { data: newPet, error: insertError } = await supabase
        .from("pets")
        .insert(formattedPetData)
        .select()
        .single();

      if (insertError) throw insertError;

      if (selectedImage && newPet) {
        const publicUrl = await uploadPetImage(selectedImage, newPet.id);
        
        const { error: updateError } = await supabase
          .from("pets")
          .update({ profile_image_url: publicUrl })
          .eq('id', newPet.id);

        if (updateError) throw updateError;
      }

      toast({
        title: "Success",
        description: "Pet added successfully!",
      });

      setIsOpen(false);
      if (onSuccess) onSuccess();
      setPetData({
        name: "",
        type: "",
        breed: "",
        gender: "",
        birthday: "",
        color: "",
        weight_kg: 0,
        microchip_id: "",
        notes: "",
        medical_info: {
          blood_type: "",
          conditions: [],
          allergies: [],
          medications: [],
          vaccinations: [],
          last_checkup: "",
          next_checkup: "",
          medical_notes: "",
          veterinarian: {
            name: "",
            phone: "",
            email: "",
            clinic: "",
            address: "",
            specialization: "",
            license_number: ""
          }
        },
        emergency_contact: {
          name: "",
          phone: "",
          email: "",
          relationship: "",
          address: "",
        }
      });
      setSelectedImage(null);
      setImagePreview(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add pet",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddVaccination = () => {
    setPetData(prev => ({
      ...prev,
      medical_info: {
        ...prev.medical_info,
        vaccinations: [
          ...prev.medical_info.vaccinations,
          { name: "", date: "", next_due: "" }
        ]
      }
    }));
  };

  const handleRemoveVaccination = (index: number) => {
    setPetData(prev => ({
      ...prev,
      medical_info: {
        ...prev.medical_info,
        vaccinations: prev.medical_info.vaccinations.filter((_, i) => i !== index)
      }
    }));
  };

  const handleArrayFieldChange = (field: 'conditions' | 'allergies' | 'medications', value: string) => {
    if (!value.trim()) return;
    setPetData(prev => ({
      ...prev,
      medical_info: {
        ...prev.medical_info,
        [field]: [...prev.medical_info[field], value.trim()]
      }
    }));
  };

  const handleRemoveArrayItem = (field: 'conditions' | 'allergies' | 'medications', index: number) => {
    setPetData(prev => ({
      ...prev,
      medical_info: {
        ...prev.medical_info,
        [field]: prev.medical_info[field].filter((_, i) => i !== index)
      }
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-pet-primary hover:bg-pet-secondary">+ Add New Pet</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Pet</DialogTitle>
          <DialogDescription>Fill in your pet's details below.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="pet-image">Pet Image</Label>
                  <div className="mt-2 flex flex-col items-center gap-4">
                    {imagePreview ? (
                      <div className="relative w-full h-48">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8"
                          onClick={() => {
                            setSelectedImage(null);
                            setImagePreview(null);
                          }}
                        >
                          ×
                        </Button>
                      </div>
                    ) : (
                      <div className="w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center bg-muted/50 hover:bg-muted transition-colors">
                        <label htmlFor="image-upload" className="cursor-pointer text-center p-4 w-full h-full flex flex-col items-center justify-center">
                          <ImagePlus className="w-8 h-8 mb-2 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Click to upload image</span>
                          <span className="text-xs text-muted-foreground mt-1">(Max size: 5MB)</span>
                        </label>
                      </div>
                    )}
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Pet Name*</Label>
                    <Input
                      id="name"
                      value={petData.name}
                      onChange={(e) => setPetData({ ...petData, name: e.target.value })}
                      required
                      placeholder="Enter pet name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="type">Type*</Label>
                    <Select
                      value={petData.type}
                      onValueChange={(value) => setPetData({ ...petData, type: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dog">Dog</SelectItem>
                        <SelectItem value="cat">Cat</SelectItem>
                        <SelectItem value="bird">Bird</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="breed">Breed</Label>
                    <Input
                      id="breed"
                      value={petData.breed}
                      onChange={(e) => setPetData({ ...petData, breed: e.target.value })}
                      placeholder="Enter breed"
                    />
                  </div>

                  <div>
                    <Label htmlFor="birthday">Birthday</Label>
                    <Input
                      id="birthday"
                      type="date"
                      value={petData.birthday}
                      onChange={(e) => setPetData({ ...petData, birthday: e.target.value })}
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={petData.gender}
                      onValueChange={(value) => setPetData({ ...petData, gender: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      value={petData.color}
                      onChange={(e) => setPetData({ ...petData, color: e.target.value })}
                      placeholder="Enter pet color"
                    />
                  </div>

                  <div>
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={petData.weight_kg}
                      onChange={(e) => setPetData({ ...petData, weight_kg: parseFloat(e.target.value) })}
                      placeholder="Enter pet weight"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="microchip">Microchip ID</Label>
                    <Input
                      id="microchip"
                      value={petData.microchip_id}
                      onChange={(e) => setPetData({ ...petData, microchip_id: e.target.value })}
                      placeholder="Enter microchip ID"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={petData.notes}
                    onChange={(e) => setPetData({ ...petData, notes: e.target.value })}
                    placeholder="Enter additional notes"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Medical Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Medical Information</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="blood_type">Blood Type</Label>
                  <Input
                    id="blood_type"
                    value={petData.medical_info.blood_type}
                    onChange={(e) => setPetData({
                      ...petData,
                      medical_info: { ...petData.medical_info, blood_type: e.target.value }
                    })}
                    placeholder="Enter blood type"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Medical Conditions</Label>
                  <div className="flex flex-wrap gap-2">
                    {petData.medical_info.conditions.map((condition, index) => (
                      <Badge key={index} variant="secondary" className="gap-2">
                        {condition}
                        <button
                          type="button"
                          onClick={() => handleRemoveArrayItem('conditions', index)}
                          className="text-xs hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <Input
                    placeholder="Add condition and press Enter"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleArrayFieldChange('conditions', (e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Allergies</Label>
                  <div className="flex flex-wrap gap-2">
                    {petData.medical_info.allergies.map((allergy, index) => (
                      <Badge key={index} variant="secondary" className="gap-2">
                        {allergy}
                        <button
                          type="button"
                          onClick={() => handleRemoveArrayItem('allergies', index)}
                          className="text-xs hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <Input
                    placeholder="Add allergy and press Enter"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleArrayFieldChange('allergies', (e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Current Medications</Label>
                  <div className="flex flex-wrap gap-2">
                    {petData.medical_info.medications.map((medication, index) => (
                      <Badge key={index} variant="secondary" className="gap-2">
                        {medication}
                        <button
                          type="button"
                          onClick={() => handleRemoveArrayItem('medications', index)}
                          className="text-xs hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <Input
                    placeholder="Add medication and press Enter"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleArrayFieldChange('medications', (e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Vaccinations</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddVaccination}
                    >
                      Add Vaccination
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {petData.medical_info.vaccinations.map((vax, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start p-4 border rounded-lg relative">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-white hover:bg-destructive/90"
                          onClick={() => handleRemoveVaccination(index)}
                        >
                          ×
                        </Button>
                        <div>
                          <Label>Name</Label>
                          <Input
                            value={vax.name}
                            onChange={(e) => {
                              const newVaccinations = [...petData.medical_info.vaccinations];
                              newVaccinations[index] = { ...vax, name: e.target.value };
                              setPetData({
                                ...petData,
                                medical_info: {
                                  ...petData.medical_info,
                                  vaccinations: newVaccinations
                                }
                              });
                            }}
                            placeholder="Vaccination name"
                          />
                        </div>
                        <div>
                          <Label>Date</Label>
                          <Input
                            type="date"
                            value={vax.date}
                            max={new Date().toISOString().split('T')[0]}
                            onChange={(e) => {
                              const newVaccinations = [...petData.medical_info.vaccinations];
                              newVaccinations[index] = { ...vax, date: e.target.value };
                              setPetData({
                                ...petData,
                                medical_info: {
                                  ...petData.medical_info,
                                  vaccinations: newVaccinations
                                }
                              });
                            }}
                          />
                        </div>
                        <div>
                          <Label>Next Due</Label>
                          <Input
                            type="date"
                            value={vax.next_due}
                            min={new Date().toISOString().split('T')[0]}
                            onChange={(e) => {
                              const newVaccinations = [...petData.medical_info.vaccinations];
                              newVaccinations[index] = { ...vax, next_due: e.target.value };
                              setPetData({
                                ...petData,
                                medical_info: {
                                  ...petData.medical_info,
                                  vaccinations: newVaccinations
                                }
                              });
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Veterinarian Information</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="vet_name">Name</Label>
                      <Input
                        id="vet_name"
                        value={petData.medical_info.veterinarian.name}
                        onChange={(e) => setPetData({
                          ...petData,
                          medical_info: {
                            ...petData.medical_info,
                            veterinarian: {
                              ...petData.medical_info.veterinarian,
                              name: e.target.value
                            }
                          }
                        })}
                        placeholder="Veterinarian name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="vet_phone">Phone</Label>
                      <Input
                        id="vet_phone"
                        value={petData.medical_info.veterinarian.phone}
                        onChange={(e) => setPetData({
                          ...petData,
                          medical_info: {
                            ...petData.medical_info,
                            veterinarian: {
                              ...petData.medical_info.veterinarian,
                              phone: e.target.value
                            }
                          }
                        })}
                        placeholder="Veterinarian phone"
                      />
                    </div>
                    <div>
                      <Label htmlFor="vet_email">Email</Label>
                      <Input
                        id="vet_email"
                        type="email"
                        value={petData.medical_info.veterinarian.email}
                        onChange={(e) => setPetData({
                          ...petData,
                          medical_info: {
                            ...petData.medical_info,
                            veterinarian: {
                              ...petData.medical_info.veterinarian,
                              email: e.target.value
                            }
                          }
                        })}
                        placeholder="Veterinarian email"
                      />
                    </div>
                    <div>
                      <Label htmlFor="vet_clinic">Clinic</Label>
                      <Input
                        id="vet_clinic"
                        value={petData.medical_info.veterinarian.clinic}
                        onChange={(e) => setPetData({
                          ...petData,
                          medical_info: {
                            ...petData.medical_info,
                            veterinarian: {
                              ...petData.medical_info.veterinarian,
                              clinic: e.target.value
                            }
                          }
                        })}
                        placeholder="Clinic name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="vet_specialization">Specialization</Label>
                      <Input
                        id="vet_specialization"
                        value={petData.medical_info.veterinarian.specialization}
                        onChange={(e) => setPetData({
                          ...petData,
                          medical_info: {
                            ...petData.medical_info,
                            veterinarian: {
                              ...petData.medical_info.veterinarian,
                              specialization: e.target.value
                            }
                          }
                        })}
                        placeholder="Specialization"
                      />
                    </div>
                    <div>
                      <Label htmlFor="vet_license_number">License Number</Label>
                      <Input
                        id="vet_license_number"
                        value={petData.medical_info.veterinarian.license_number}
                        onChange={(e) => setPetData({
                          ...petData,
                          medical_info: {
                            ...petData.medical_info,
                            veterinarian: {
                              ...petData.medical_info.veterinarian,
                              license_number: e.target.value
                            }
                          }
                        })}
                        placeholder="License Number"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="vet_address">Clinic Address</Label>
                    <Textarea
                      id="vet_address"
                      value={petData.medical_info.veterinarian.address}
                      onChange={(e) => setPetData({
                        ...petData,
                        medical_info: {
                          ...petData.medical_info,
                          veterinarian: {
                            ...petData.medical_info.veterinarian,
                            address: e.target.value
                          }
                        }
                      })}
                      placeholder="Clinic address"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="last_checkup">Last Checkup</Label>
                  <Input
                    id="last_checkup"
                    type="date"
                    value={petData.medical_info.last_checkup}
                    onChange={(e) => setPetData({
                      ...petData,
                      medical_info: {
                        ...petData.medical_info,
                        last_checkup: e.target.value
                      }
                    })}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <Label htmlFor="next_checkup">Next Checkup</Label>
                  <Input
                    id="next_checkup"
                    type="date"
                    value={petData.medical_info.next_checkup}
                    onChange={(e) => setPetData({
                      ...petData,
                      medical_info: {
                        ...petData.medical_info,
                        next_checkup: e.target.value
                      }
                    })}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <Label htmlFor="medical_notes">Medical Notes</Label>
                  <Textarea
                    id="medical_notes"
                    value={petData.medical_info.medical_notes}
                    onChange={(e) => setPetData({
                      ...petData,
                      medical_info: {
                        ...petData.medical_info,
                        medical_notes: e.target.value
                      }
                    })}
                    placeholder="Enter medical notes"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Emergency Contact */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Emergency Contact</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emergency_name">Name</Label>
                  <Input
                    id="emergency_name"
                    value={petData.emergency_contact.name}
                    onChange={(e) => setPetData({
                      ...petData,
                      emergency_contact: {
                        ...petData.emergency_contact,
                        name: e.target.value
                      }
                    })}
                    placeholder="Contact name"
                  />
                </div>
                <div>
                  <Label htmlFor="emergency_relationship">Relationship</Label>
                  <Input
                    id="emergency_relationship"
                    value={petData.emergency_contact.relationship}
                    onChange={(e) => setPetData({
                      ...petData,
                      emergency_contact: {
                        ...petData.emergency_contact,
                        relationship: e.target.value
                      }
                    })}
                    placeholder="e.g. Family member, Friend"
                  />
                </div>
                <div>
                  <Label htmlFor="emergency_phone">Phone</Label>
                  <Input
                    id="emergency_phone"
                    value={petData.emergency_contact.phone}
                    onChange={(e) => setPetData({
                      ...petData,
                      emergency_contact: {
                        ...petData.emergency_contact,
                        phone: e.target.value
                      }
                    })}
                    placeholder="Contact phone"
                  />
                </div>
                <div>
                  <Label htmlFor="emergency_email">Email</Label>
                  <Input
                    id="emergency_email"
                    type="email"
                    value={petData.emergency_contact.email}
                    onChange={(e) => setPetData({
                      ...petData,
                      emergency_contact: {
                        ...petData.emergency_contact,
                        email: e.target.value
                      }
                    })}
                    placeholder="Contact email"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="emergency_address">Address</Label>
                <Textarea
                  id="emergency_address"
                  value={petData.emergency_contact.address}
                  onChange={(e) => setPetData({
                    ...petData,
                    emergency_contact: {
                      ...petData.emergency_contact,
                      address: e.target.value
                    }
                  })}
                  placeholder="Contact address"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-pet-primary hover:bg-pet-secondary">
              {loading ? "Adding..." : "Add Pet"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}