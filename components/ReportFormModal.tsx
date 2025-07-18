import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { uploadLostFoundImage } from '@/lib/upload-helper';
import { Switch } from '@/components/ui/switch';

interface ReportFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const governments = [
  'Alexandria', 'Aswan', 'Asyut', 'Beheira', 'Beni Suef', 'Cairo', 'Dakahlia',
  'Damietta', 'Faiyum', 'Gharbia', 'Giza', 'Ismailia', 'Kafr El Sheikh',
  'Luxor', 'Matrouh', 'Minya', 'Monufia', 'New Valley', 'North Sinai',
  'Port Said', 'Qalyubia', 'Qena', 'Red Sea', 'Sharqia', 'Sohag',
  'South Sinai', 'Suez'
];

// Mapping of governments to their areas
const governmentAreas: Record<string, string[]> = {
  cairo: ['Sahel', 'Shubra', 'Heliopolis', 'Maadi', 'Nasr City'],
  alexandria: ['Smouha', 'Gleem', 'Stanley', 'Roushdy'],
  giza: ['Dokki', 'Mohandessin', 'Haram', '6th October'],
  // Add other governments and their areas as needed
};

export const ReportFormModal: React.FC<ReportFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    reportType: '',
    petType: '',
    petBreed: '',
    petColor: '',
    petName: '',
    petGender: '',
    petAge: '',
    lastSeenLocation: '',
    lastSeenDate: '',
    description: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    hideContact: false,
    government: 'all',
    area: 'all'
  });
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type and size
      const validTypes = ['image/jpeg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid File",
          description: "Please upload a JPEG or PNG image.",
          variant: "destructive"
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File Too Large",
          description: "Image size must be less than 5MB.",
          variant: "destructive"
        });
        return;
      }
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Validate required fields
      if (!formData.reportType || !formData.petType || !formData.lastSeenLocation || !formData.description || !formData.contactName || !formData.contactEmail || formData.government === 'all' || formData.area === 'all') {
        toast({
          title: "Missing Fields",
          description: "Please fill in all required fields.",
          variant: "destructive"
        });
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.contactEmail)) {
        toast({
          title: "Invalid Email",
          description: "Please enter a valid email address.",
          variant: "destructive"
        });
        return;
      }

      // Get user (optional, for public submissions user may be null)
      const { data: { user } } = await supabase.auth.getUser();

      const postData = {
        title: `${formData.reportType === 'lost' ? 'Lost' : 'Found'} ${formData.petType}: ${formData.petBreed || 'Unknown Breed'}`,
        type: formData.reportType as 'lost' | 'found',
        pet_type: formData.petType,
        pet_breed: formData.petBreed || null,
        pet_color: formData.petColor || null,
        pet_name: formData.petName || null,
        pet_gender: formData.petGender || null,
        pet_age: formData.petAge ? parseInt(formData.petAge) : null,
        last_seen_location: formData.lastSeenLocation,
        last_seen_date: formData.lastSeenDate || null,
        description: formData.description,
        contact_email: formData.hideContact ? null : formData.contactEmail,
        contact_phone: formData.hideContact ? null : formData.contactPhone,
        status: 'open',
        user_id: user?.id || null, // Always null for public submissions
        government: formData.government,
        area: formData.area
      };

      const { data, error } = await supabase
        .from('lost_found_posts')
        .insert(postData)
        .select()
        .single();

      if (error) {
        console.error("Supabase insert error:", error);
        throw new Error(error.message || "Failed to submit report");
      }

      if (image && data) {
        try {
          const imageUrl = await uploadLostFoundImage(image, data.id);
          if (imageUrl) {
            const { error: updateError } = await supabase
              .from('lost_found_posts')
              .update({ image_url: imageUrl })
              .eq('id', data.id);
            if (updateError) {
              console.error("Supabase update error:", updateError);
              throw new Error(updateError.message || "Failed to update image URL");
            }
          }
        } catch (imageError: any) {
          console.error("Image upload error:", imageError);
          // Delete the inserted post if image upload fails
          await supabase.from('lost_found_posts').delete().eq('id', data.id);
          throw new Error(imageError.message || "Failed to upload image");
        }
      }

      toast({
        title: "Report Submitted",
        description: "Your report has been successfully submitted."
      });

      // Reset form
      setFormData({
        reportType: '',
        petType: '',
        petBreed: '',
        petColor: '',
        petName: '',
        petGender: '',
        petAge: '',
        lastSeenLocation: '',
        lastSeenDate: '',
        description: '',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        hideContact: false,
        government: '',
        area: ''
      });
      setImage(null);
      setImagePreview(null);
      onClose();
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error submitting report:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit report",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // List of governments in Egypt
  const governments = [
    'Alexandria', 'Aswan', 'Asyut', 'Beheira', 'Beni Suef', 'Cairo', 'Dakahlia',
    'Damietta', 'Faiyum', 'Gharbia', 'Giza', 'Ismailia', 'Kafr El Sheikh',
    'Luxor', 'Matrouh', 'Minya', 'Monufia', 'New Valley', 'North Sinai',
    'Port Said', 'Qalyubia', 'Qena', 'Red Sea', 'Sharqia', 'Sohag',
    'South Sinai', 'Suez'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sticky top-0 bg-background z-10 pb-4 border-b">
          <DialogTitle>
            {t('community.submitReport')}
          </DialogTitle>
          <DialogDescription>
            {t('community.reportDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          <div className="space-y-6">
            <div className="grid gap-2">
              <Label>{t('community.reportType')} *</Label>
              <Select
                value={formData.reportType}
                onValueChange={(value) => handleSelectChange('reportType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('community.selectReportType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lost">{t('community.lostPet')}</SelectItem>
                  <SelectItem value="found">{t('community.foundPet')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>{t('community.petType')} *</Label>
              <Select
                value={formData.petType}
                onValueChange={(value) => handleSelectChange('petType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('community.selectPetType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dog">{t('community.dog')}</SelectItem>
                  <SelectItem value="cat">{t('community.cat')}</SelectItem>
                  <SelectItem value="bird">{t('community.bird')}</SelectItem>
                  <SelectItem value="other">{t('community.other')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{t('community.petBreed')}</Label>
                <Input
                  name="petBreed"
                  value={formData.petBreed}
                  onChange={handleInputChange}
                  placeholder={t('community.enterBreed')}
                />
              </div>
              <div className="grid gap-2">
                <Label>{t('community.petColor')}</Label>
                <Input
                  name="petColor"
                  value={formData.petColor}
                  onChange={handleInputChange}
                  placeholder={t('community.enterColor')}
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{t('community.petName')}</Label>
                <Input
                  name="petName"
                  value={formData.petName}
                  onChange={handleInputChange}
                  placeholder={t('community.enterPetName')}
                />
              </div>
              <div className="grid gap-2">
                <Label>{t('community.petAge')}</Label>
                <Input
                  name="petAge"
                  type="number"
                  value={formData.petAge}
                  onChange={handleInputChange}
                  placeholder={t('community.enterAge')}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>{t('community.petGender')}</Label>
              <Select
                value={formData.petGender}
                onValueChange={(value) => handleSelectChange('petGender', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('community.selectGender')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">{t('community.male')}</SelectItem>
                  <SelectItem value="female">{t('community.female')}</SelectItem>
                  <SelectItem value="unknown">{t('community.unknown')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>{t('community.government')} *</Label>
              <Select
                value={formData.government}
                onValueChange={(value) => {
                  handleSelectChange('government', value);
                  setFormData(prev => ({ ...prev, area: 'all' }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('community.selectGovernment')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('community.selectGovernment')}</SelectItem>
                  {governments.map((gov) => (
                    <SelectItem key={gov} value={gov.toLowerCase()}>
                      {gov}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>{t('community.area')} *</Label>
              <Select
                value={formData.area}
                onValueChange={(value) => handleSelectChange('area', value)}
                disabled={formData.government === 'all'}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('community.selectArea')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('community.selectArea')}</SelectItem>
                  {(governmentAreas[formData.government] || []).map((area) => (
                    <SelectItem key={area.toLowerCase()} value={area.toLowerCase()}>
                      {area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>{t('community.lastSeenLocation')} *</Label>
              <Input
                name="lastSeenLocation"
                value={formData.lastSeenLocation}
                onChange={handleInputChange}
                placeholder={t('community.enterLocation')}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label>{t('community.lastSeenDate')}</Label>
              <Input
                name="lastSeenDate"
                type="date"
                value={formData.lastSeenDate}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid gap-2">
              <Label>{t('community.description')} *</Label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder={t('community.enterDescription')}
                required
                className="min-h-[100px]"
              />
            </div>

            <div className="grid gap-2">
              <Label>{t('community.photo')}</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-40 rounded-md object-cover"
                  />
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-4">{t('community.contactInformation')}</h4>
              
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label>{t('community.name')} *</Label>
                  <Input
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleInputChange}
                    placeholder={t('community.enterName')}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label>{t('community.email')} *</Label>
                  <Input
                    name="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                    placeholder={t('community.enterEmail')}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label>{t('community.phone')}</Label>
                  <Input
                    name="contactPhone"
                    type="tel"
                    value={formData.contactPhone}
                    onChange={handleInputChange}
                    placeholder={t('community.enterPhone')}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="sticky bottom-0 bg-background pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? t('common.submitting') : t('common.submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};