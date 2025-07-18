import React, { useState } from 'react';
import { TagInput } from './tag-input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';
import { Textarea } from './textarea';
import { useToast } from './use-toast';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  Loader2, 
  PawPrint, 
  Ruler, 
  Heart, 
  Users, 
  Camera, 
  Check, 
  X, 
  Dog, 
  Cat, 
  Bird,
  Plus 
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

// Improved style constants with consistent spacing and typography
const styles = {
  dialog: {
    content: "max-w-[800px] w-[95vw] max-h-[85vh] overflow-y-auto",
    inner: "p-4 md:p-8 space-y-6 md:space-y-8",
    header: "flex flex-col md:flex-row md:items-center md:gap-6",
  },
  typography: {
    title: "text-2xl md:text-3xl font-bold tracking-tight text-foreground",
    description: "text-sm md:text-base text-muted-foreground mt-3 leading-relaxed",
    sectionTitle: "text-xl font-semibold mb-6 text-foreground",
    label: "text-sm font-medium leading-none text-foreground mb-2 block",
  },
  layout: {
    section: "space-y-8",
    formGroup: "space-y-8",
    header: "mb-8",
    fieldContainer: "space-y-3",
  },
  stepper: {
    wrapper: "mb-6 md:mb-8 px-2 md:px-4",
    container: "flex justify-between items-start relative gap-1 md:gap-2",
    step: "flex flex-col items-center relative z-10 flex-1 px-1 md:px-2",
    icon: "w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-200 mb-2 shadow-sm",
    iconActive: "bg-primary text-primary-foreground shadow-lg scale-110",
    iconCompleted: "bg-green-500 text-white",
    iconPending: "bg-muted text-muted-foreground",
    label: "text-[10px] md:text-xs font-medium text-center max-w-[60px] md:max-w-[80px] leading-tight mt-1",
    labelActive: "text-primary font-semibold",
    labelCompleted: "text-green-600",
    labelPending: "text-muted-foreground",
    connector: "absolute top-5 left-0 right-0 h-[2px] -z-10 transition-colors duration-200",
    connectorActive: "bg-green-500",
    connectorInactive: "bg-muted",
    progress: "text-sm font-medium text-center mt-6 text-muted-foreground",
  },
  uploader: {
    container: "flex flex-col items-center justify-center w-full mb-6",
    dropzone: "w-32 h-32 rounded-full border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-all duration-200 cursor-pointer overflow-hidden relative group",
    preview: "w-full h-full object-cover rounded-full",
    placeholder: "flex flex-col items-center justify-center h-full text-muted-foreground group-hover:text-primary transition-colors",
    removeButton: "absolute -top-1 -right-1 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors shadow-sm",
  },
  chips: {
    container: "flex flex-wrap gap-2 mt-2",
    chip: "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
    chipSelected: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
    chipUnselected: "bg-muted/30 text-foreground hover:bg-muted/50",
    icon: "mr-2 h-4 w-4",
  },
  footer: {
    container: "flex flex-col-reverse md:flex-row justify-between items-center w-full gap-4 pt-4 mt-6 border-t",
    buttonGroup: "flex items-center gap-3 w-full md:w-auto",
    skipLink: "text-sm text-muted-foreground hover:text-foreground transition-colors w-full md:w-auto text-center md:text-left md:mr-auto",
  },
} as const;

// Step icons mapping
const StepIcons = {
  1: PawPrint,
  2: Ruler,
  3: Heart,
  4: Users,
} as const;

// Animation variants
const pageVariants: Variants = {
  enter: {
    x: '100%',
    opacity: 0
  },
  center: {
    x: 0,
    opacity: 1
  },
  exit: {
    x: '-100%',
    opacity: 0
  }
};

// Component Props and Types
// Types
type PetType = 'dog' | 'cat' | 'bird' | 'other';
type Gender = 'male' | 'female' | 'other';

interface AddPetDialogProps {
  onSuccess?: () => void;
}

interface PetData {
  profile_image: File | null;
  name: string;
  type: string;
  breed: string;
  gender: string;
  birthday: string;
  color: string;
  weight_kg: number | '';
  microchip_id: string;
  blood_type: string;
  medical_conditions: string;
  allergies: string;
  medications: string;
  vaccinations: Array<{ name: string; date: string; next_due: string }>;
  veterinarian_name: string;
  veterinarian_phone: string;
  veterinarian_clinic: string;
  emergency_contact_name: string;
  emergency_contact_relationship: string;
  emergency_contact_phone: string;
}

export function AddPetDialog({ onSuccess }: AddPetDialogProps) {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  const steps = [
    { id: 1, title: t('dashboard.pets.add.steps.startBasics') },
    { id: 2, title: t('dashboard.pets.add.steps.tellUsMore') },
    { id: 3, title: t('dashboard.pets.add.steps.healthMedical') },
    { id: 4, title: t('dashboard.pets.add.steps.careTeam') },
  ];

  const [petData, setPetData] = useState<PetData>({
    profile_image: null,
    name: '',
    type: '',
    breed: '',
    gender: '',
    birthday: '',
    color: '',
    weight_kg: '',
    microchip_id: '',
    blood_type: '',
    medical_conditions: '',
    allergies: '',
    medications: '',
    vaccinations: [],
    veterinarian_name: '',
    veterinarian_phone: '',
    veterinarian_clinic: '',
    emergency_contact_name: '',
    emergency_contact_relationship: '',
    emergency_contact_phone: '',
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPetData({ ...petData, profile_image: e.target.files[0] });
    }
  };

  const handleNext = async () => {
    // Validate current step
    if (currentStep === 1) {
      if (!petData.name.trim() || !petData.type) {
        toast({
          title: t('error'),
          description: t('dashboard.pets.add.errors.requiredFields'),
          variant: 'destructive',
        });
        return;
      }
    }
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleVaccinationChange = (
    index: number,
    field: keyof Pick<{ name: string; date: string; next_due: string }, 'name' | 'date' | 'next_due'>,
    value: string
  ) => {
    const newVaccinations = [...petData.vaccinations];
    newVaccinations[index] = { ...newVaccinations[index], [field]: value };
    setPetData({ ...petData, vaccinations: newVaccinations });
  };

  const addVaccination = () => {
    setPetData({
      ...petData,
      vaccinations: [...petData.vaccinations, { name: '', date: '', next_due: '' }],
    });
  };

  const removeVaccination = (index: number) => {
    const newVaccinations = petData.vaccinations.filter((_, i) => i !== index);
    setPetData({ ...petData, vaccinations: newVaccinations });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const petInsertData = {
        name: petData.name.trim(),
        type: petData.type.toLowerCase(),
        breed: petData.breed.trim() || null,
        gender: petData.gender || null,
        birthday: petData.birthday || null,
        color: petData.color || null,
        weight_kg: petData.weight_kg === '' ? null : petData.weight_kg,
        microchip_id: petData.microchip_id || null,
        owner_id: userData.user.id,
        medical_info: {
          blood_type: petData.blood_type || null,
          conditions: petData.medical_conditions
            ? petData.medical_conditions.split(',').map((s) => s.trim())
            : [],
          allergies: petData.allergies
            ? petData.allergies.split(',').map((s) => s.trim())
            : [],
          medications: petData.medications
            ? petData.medications.split(',').map((s) => s.trim())
            : [],
          vaccinations: petData.vaccinations.filter(
            (v) => v.name.trim() !== '' || v.date.trim() !== '' || v.next_due.trim() !== ''
          ),
        }
      };

      const { data: insertedPet, error: insertError } = await supabase
        .from('pets')
        .insert(petInsertData)
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      if (!insertedPet) {
        throw new Error('Failed to insert pet data');
      }

      // Upload profile image if provided
      let profile_image_url = null;
      if (petData.profile_image) {
        const fileExt = petData.profile_image.name.split('.').pop();
        const fileName = `${insertedPet.id}.${fileExt}`;
        const filePath = `pets/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('pet-images')
          .upload(filePath, petData.profile_image, { upsert: true });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('pet-images').getPublicUrl(filePath);
        profile_image_url = data.publicUrl;

        // Update pet with profile image url
        const { error: updateError } = await supabase
          .from('pets')
          .update({ profile_image_url })
          .eq('id', insertedPet.id);
          
        if (updateError) throw updateError;
      }

      toast({
        title: t('dashboard.pets.add.success.title'),
        description: t('dashboard.pets.add.success.description', { name: insertedPet.name }),
      });

      setOpen(false);
      setCurrentStep(1);
      setPetData({
        profile_image: null,
        name: '',
        type: '',
        breed: '',
        gender: '',
        birthday: '',
        color: '',
        weight_kg: '',
        microchip_id: '',
        blood_type: '',
        medical_conditions: '',
        allergies: '',
        medications: '',
        vaccinations: [],
        veterinarian_name: '',
        veterinarian_phone: '',
        veterinarian_clinic: '',
        emergency_contact_name: '',
        emergency_contact_relationship: '',
        emergency_contact_phone: '',
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error adding pet:', error);
      toast({
        title: t('dashboard.pets.add.error.title'),
        description: t('dashboard.pets.add.error.description'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button 
        onClick={() => setOpen(true)}
        className="inline-flex items-center space-x-2"
      >
        <Plus className="w-4 h-4" />
        <span>{t('dashboard.pets.addNewPet')}</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className={cn(styles.dialog.content)}>
          <div className={styles.dialog.inner}>
            <DialogHeader className={styles.layout.header}>
              <DialogTitle className={styles.typography.title}>
                {t('dashboard.pets.add.title')}
              </DialogTitle>
              <DialogDescription className={styles.typography.description}>
                {t('dashboard.pets.add.description')}
              </DialogDescription>
            </DialogHeader>

            {/* Improved Stepper Progress Indicator */}
            <div className={styles.stepper.wrapper}>
              <div className={styles.stepper.container}>
                {steps.map((step, index) => {
                  const StepIcon = StepIcons[step.id as keyof typeof StepIcons];
                  const isActive = currentStep === step.id;
                  const isCompleted = currentStep > step.id;

                  return (
                    <React.Fragment key={step.id}>
                      <div className={styles.stepper.step}>
                        <div
                          className={cn(
                            styles.stepper.icon,
                            isActive && styles.stepper.iconActive,
                            isCompleted && styles.stepper.iconCompleted,
                            !isActive && !isCompleted && styles.stepper.iconPending
                          )}
                        >
                          {isCompleted ? (
                            <Check className="w-5 h-5" />
                          ) : (
                            <StepIcon className="w-5 h-5" />
                          )}
                        </div>
                        <span className={cn(
                          styles.stepper.label,
                          isActive && styles.stepper.labelActive,
                          isCompleted && styles.stepper.labelCompleted,
                          !isActive && !isCompleted && styles.stepper.labelPending
                        )}>
                          {step.title}
                        </span>
                      </div>
                      {index < steps.length - 1 && (
                        <div 
                          className={cn(
                            styles.stepper.connector,
                            (currentStep > step.id) ? styles.stepper.connectorActive : styles.stepper.connectorInactive
                          )}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              <div className="text-center mt-6">
                <p className="text-sm font-medium text-foreground">
                  {steps[currentStep - 1].title}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Step {currentStep} of {steps.length}
                </p>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
                className={styles.layout.section}
              >
                <form onSubmit={handleSubmit} className="space-y-0">
                  {/* Step 1: Basic Information */}
                  {currentStep === 1 && (
                    <div className={styles.layout.formGroup}>
                      {/* Improved Image Uploader */}
                      <div className={styles.uploader.container}>
                        <label className={styles.uploader.dropzone}>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="sr-only"
                          />
                          {petData.profile_image ? (
                            <>
                              <img
                                src={URL.createObjectURL(petData.profile_image)}
                                alt="Pet preview"
                                className={styles.uploader.preview}
                              />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setPetData({ ...petData, profile_image: null });
                                }}
                                className={styles.uploader.removeButton}
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <div className={styles.uploader.placeholder}>
                              <Camera className="w-8 h-8 mb-2" />
                              <span className="text-xs text-center font-medium">
                                {t('dashboard.pets.add.uploadPhoto')}
                              </span>
                              <span className="text-xs text-center text-muted-foreground/70 mt-1">
                                Click to browse
                              </span>
                            </div>
                          )}
                        </label>
                        <p className="text-xs text-muted-foreground text-center mt-3">
                          Optional: Add a profile photo for your pet
                        </p>
                      </div>

                      {/* Pet Name Field */}
                      <div className={styles.layout.fieldContainer}>
                        <Label className={styles.typography.label}>
                          {t('dashboard.pets.add.name')} *
                        </Label>
                        <Input
                          value={petData.name}
                          onChange={(e) => setPetData({ ...petData, name: e.target.value })}
                          placeholder={t('dashboard.pets.add.placeholders.name')}
                          required
                          className="text-base"
                        />
                      </div>

                      {/* Pet Type Selection */}
                      <div className={styles.layout.fieldContainer}>
                        <Label className={styles.typography.label}>
                          {t('dashboard.pets.add.type')} *
                        </Label>
                        <div className={styles.chips.container}>
                          {['dog', 'cat', 'bird', 'other'].map((type) => {
                            const Icon = type === 'dog' ? Dog : type === 'cat' ? Cat : type === 'bird' ? Bird : PawPrint;
                            return (
                              <button
                                key={type}
                                type="button"
                                onClick={() => setPetData({ ...petData, type })}
                                className={cn(
                                  styles.chips.chip,
                                  petData.type === type ? styles.chips.chipSelected : styles.chips.chipUnselected
                                )}
                              >
                                <Icon className={styles.chips.icon} />
                                {t(`dashboard.pets.add.types.${type}`)}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Key Characteristics */}
                  {currentStep === 2 && (
                    <div className={styles.layout.formGroup}>
                      {/* Breed Field */}
                      <div className={styles.layout.fieldContainer}>
                        <Label className={styles.typography.label}>
                          {t('dashboard.pets.add.breed')}
                        </Label>
                        <Input
                          value={petData.breed}
                          onChange={(e) => setPetData({ ...petData, breed: e.target.value })}
                          placeholder={t('dashboard.pets.add.placeholders.breed')}
                          className="text-base"
                        />
                      </div>

                      {/* Gender Selection */}
                      <div className={styles.layout.fieldContainer}>
                        <Label className={styles.typography.label}>
                          {t('dashboard.pets.add.gender')}
                        </Label>
                        <div className={styles.chips.container}>
                          {['male', 'female'].map((gender) => (
                            <button
                              key={gender}
                              type="button"
                              onClick={() => setPetData({ ...petData, gender })}
                              className={cn(
                                styles.chips.chip,
                                petData.gender === gender ? styles.chips.chipSelected : styles.chips.chipUnselected
                              )}
                            >
                              {t(`dashboard.pets.add.genders.${gender}`)}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Birthday Field */}
                      <div className={styles.layout.fieldContainer}>
                        <Label className={styles.typography.label}>
                          {t('dashboard.pets.add.birthday')}
                        </Label>
                        <Input
                          type="date"
                          value={petData.birthday}
                          onChange={(e) => setPetData({ ...petData, birthday: e.target.value })}
                          className="text-base"
                        />
                      </div>

                      {/* Color Field */}
                      <div className={styles.layout.fieldContainer}>
                        <Label className={styles.typography.label}>
                          {t('dashboard.pets.add.color')}
                        </Label>
                        <Input
                          value={petData.color}
                          onChange={(e) => setPetData({ ...petData, color: e.target.value })}
                          placeholder={t('dashboard.pets.add.placeholders.color')}
                          className="text-base"
                        />
                      </div>

                      {/* Weight Field */}
                      <div className={styles.layout.fieldContainer}>
                        <Label className={styles.typography.label}>
                          {t('dashboard.pets.add.weight')}
                        </Label>
                        <Input
                          type="number"
                          value={petData.weight_kg}
                          onChange={(e) => setPetData({ ...petData, weight_kg: parseFloat(e.target.value) || '' })}
                          placeholder={t('dashboard.pets.add.placeholders.weight')}
                          className="text-base"
                          min="0"
                          step="0.1"
                        />
                      </div>

                      {/* Microchip ID Field */}
                      <div className={styles.layout.fieldContainer}>
                        <Label className={styles.typography.label}>
                          {t('dashboard.pets.add.microchipId')}
                        </Label>
                        <Input
                          value={petData.microchip_id}
                          onChange={(e) => setPetData({ ...petData, microchip_id: e.target.value })}
                          placeholder={t('dashboard.pets.add.placeholders.microchipId')}
                          className="text-base"
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 3: Health Profile */}
                  {currentStep === 3 && (
                    <div className={styles.layout.formGroup}>
                      {/* Blood Type Field */}
                      <div className={styles.layout.fieldContainer}>
                        <Label className={styles.typography.label}>
                          {t('dashboard.pets.add.bloodType')}
                        </Label>
                        <Input
                          value={petData.blood_type}
                          onChange={(e) => setPetData({ ...petData, blood_type: e.target.value })}
                          placeholder={t('dashboard.pets.add.placeholders.bloodType')}
                          className="text-base"
                        />
                      </div>

                      {/* Medical Conditions */}
                      <div className={styles.layout.fieldContainer}>
                        <Label className={styles.typography.label}>
                          {t('dashboard.pets.add.medicalConditions')}
                        </Label>
                        <TagInput
                          tags={petData.medical_conditions ? petData.medical_conditions.split(',').filter(Boolean) : []}
                          onChange={(tags) => setPetData({ ...petData, medical_conditions: tags.join(',') })}
                          placeholder={t('dashboard.pets.add.placeholders.medicalConditions')}
                        />
                      </div>

                      {/* Allergies */}
                      <div className={styles.layout.fieldContainer}>
                        <Label className={styles.typography.label}>
                          {t('dashboard.pets.add.allergies')}
                        </Label>
                        <TagInput
                          tags={petData.allergies ? petData.allergies.split(',').filter(Boolean) : []}
                          onChange={(tags) => setPetData({ ...petData, allergies: tags.join(',') })}
                          placeholder={t('dashboard.pets.add.placeholders.allergies')}
                        />
                      </div>

                      {/* Medications */}
                      <div className={styles.layout.fieldContainer}>
                        <Label className={styles.typography.label}>
                          {t('dashboard.pets.add.medications')}
                        </Label>
                        <TagInput
                          tags={petData.medications ? petData.medications.split(',').filter(Boolean) : []}
                          onChange={(tags) => setPetData({ ...petData, medications: tags.join(',') })}
                          placeholder={t('dashboard.pets.add.placeholders.medications')}
                        />
                      </div>

                      {/* Vaccinations */}
                      <div className={styles.layout.fieldContainer}>
                        <Label className={styles.typography.label}>
                          {t('dashboard.pets.add.vaccinations')}
                        </Label>
                        {petData.vaccinations.map((vaccination, index) => (
                          <div key={index} className="flex flex-col md:flex-row gap-2 items-start mb-4 md:mb-2">
                            <Input
                              value={vaccination.name}
                              onChange={(e) => handleVaccinationChange(index, 'name', e.target.value)}
                              placeholder={t('dashboard.pets.add.placeholders.vaccinationName')}
                              className="flex-1"
                            />
                            <Input
                              type="date"
                              value={vaccination.date}
                              onChange={(e) => handleVaccinationChange(index, 'date', e.target.value)}
                              className="w-full md:w-40"
                            />
                            <Input
                              type="date"
                              value={vaccination.next_due}
                              onChange={(e) => handleVaccinationChange(index, 'next_due', e.target.value)}
                              className="w-full md:w-40"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              onClick={() => removeVaccination(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={addVaccination}
                          className="w-full mt-2"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          {t('dashboard.pets.add.addVaccination')}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Care Team */}
                  {currentStep === 4 && (
                    <div className={styles.layout.formGroup}>
                      {/* Veterinarian Information */}
                      <div className="space-y-4">
                        <h3 className={styles.typography.sectionTitle}>
                          {t('dashboard.pets.add.veterinarianInfo')}
                        </h3>
                        <div className={styles.layout.fieldContainer}>
                          <Label className={styles.typography.label}>
                            {t('dashboard.pets.add.vetName')}
                          </Label>
                          <Input
                            value={petData.veterinarian_name}
                            onChange={(e) => setPetData({ ...petData, veterinarian_name: e.target.value })}
                            placeholder={t('dashboard.pets.add.placeholders.vetName')}
                            className="text-base"
                          />
                        </div>
                        <div className={styles.layout.fieldContainer}>
                          <Label className={styles.typography.label}>
                            {t('dashboard.pets.add.vetPhone')}
                          </Label>
                          <Input
                            value={petData.veterinarian_phone}
                            onChange={(e) => setPetData({ ...petData, veterinarian_phone: e.target.value })}
                            placeholder={t('dashboard.pets.add.placeholders.vetPhone')}
                            className="text-base"
                          />
                        </div>
                        <div className={styles.layout.fieldContainer}>
                          <Label className={styles.typography.label}>
                            {t('dashboard.pets.add.vetClinic')}
                          </Label>
                          <Input
                            value={petData.veterinarian_clinic}
                            onChange={(e) => setPetData({ ...petData, veterinarian_clinic: e.target.value })}
                            placeholder={t('dashboard.pets.add.placeholders.vetClinic')}
                            className="text-base"
                          />
                        </div>
                      </div>

                      {/* Emergency Contact Information */}
                      <div className="space-y-4 mt-8">
                        <h3 className={styles.typography.sectionTitle}>
                          {t('dashboard.pets.add.emergencyContact')}
                        </h3>
                        <div className={styles.layout.fieldContainer}>
                          <Label className={styles.typography.label}>
                            {t('dashboard.pets.add.emergencyName')}
                          </Label>
                          <Input
                            value={petData.emergency_contact_name}
                            onChange={(e) => setPetData({ ...petData, emergency_contact_name: e.target.value })}
                            placeholder={t('dashboard.pets.add.placeholders.emergencyName')}
                            className="text-base"
                          />
                        </div>
                        <div className={styles.layout.fieldContainer}>
                          <Label className={styles.typography.label}>
                            {t('dashboard.pets.add.emergencyRelationship')}
                          </Label>
                          <Input
                            value={petData.emergency_contact_relationship}
                            onChange={(e) => setPetData({ ...petData, emergency_contact_relationship: e.target.value })}
                            placeholder={t('dashboard.pets.add.placeholders.emergencyRelationship')}
                            className="text-base"
                          />
                        </div>
                        <div className={styles.layout.fieldContainer}>
                          <Label className={styles.typography.label}>
                            {t('dashboard.pets.add.emergencyPhone')}
                          </Label>
                          <Input
                            value={petData.emergency_contact_phone}
                            onChange={(e) => setPetData({ ...petData, emergency_contact_phone: e.target.value })}
                            placeholder={t('dashboard.pets.add.placeholders.emergencyPhone')}
                            className="text-base"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Footer with improved spacing and alignment */}
                  <DialogFooter className={styles.footer.container}>
                    {/* Skip button for optional steps */}
                    {currentStep > 1 && currentStep < steps.length && (
                      <button
                        type="button"
                        onClick={handleSkip}
                        className={styles.footer.skipLink}
                      >
                        {t('dashboard.pets.add.skipForNow')}
                      </button>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setOpen(false);
                        setCurrentStep(1);
                      }}
                    >
                      {t('dashboard.pets.add.cancel')}
                    </Button>

                    <div className={styles.footer.buttonGroup}>
                      {currentStep > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleBack}
                        >
                          {t('dashboard.pets.add.back')}
                        </Button>
                      )}

                      {currentStep < steps.length ? (
                        <Button type="button" onClick={handleNext}>
                          {t('dashboard.pets.add.next')}
                        </Button>
                      ) : (
                        <Button type="submit" disabled={loading}>
                          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          {t('dashboard.pets.add.finishAddPet')}
                        </Button>
                      )}
                    </div>
                  </DialogFooter>
                </form>
              </motion.div>
            </AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}