import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./dialog";
import { Button } from "./button";
import { Label } from "./label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";
import { LoadingSpinner } from './loading-spinner';
import { PetAvatar } from './pet-avatar';
import { useNavigate } from 'react-router-dom';
import { Link as LinkIcon } from 'lucide-react';
import { Pet } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

interface LinkPetToTagDialogProps {
  tagCode: string;
  tagId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function LinkPetToTagDialog({ tagCode, tagId, open, onOpenChange, onSuccess }: LinkPetToTagDialogProps) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useLanguage();

  // طلب إذن الموقع عند فتح نافذة الحوار
  useEffect(() => {
    if (open) {
      // طلب إذن الموقع مباشرة عند فتح النافذة
      const timer = setTimeout(() => {
        console.log('Requesting location permission when dialog opens...');
        try {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                console.log('Geolocation permission granted in dialog on open');
              },
              (error) => {
                console.error('Geolocation error in dialog on open:', error.code, error.message);
              },
              { 
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0
              }
            );
          }
        } catch (error) {
          console.error('Error requesting location in dialog on open:', error);
        }
      }, 500); // تأخير نصف ثانية

      return () => clearTimeout(timer);
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      fetchUserPets();
    }
  }, [open]);

  const fetchUserPets = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('owner_id', user.id);

      if (error) throw error;
      setPets(data || []);
      
      // If there's only one pet, select it automatically
      if (data && data.length === 1) {
        setSelectedPetId(data[0].id);
      }
    } catch (error: any) {
      console.error('Error fetching pets:', error);
      toast({
        title: t("error"),
        description: error.message || t("Failed to load your pets"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLinkPet = async () => {
    if (!selectedPetId) {
      toast({
        title: t("error"),
        description: t("nfcTags.linkDialog.selectError"),
        variant: "destructive",
      });
      return;
    }

    setLinking(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Update tag with selected pet
      const { error } = await supabase
        .from('nfc_tags')
        .update({ 
          pet_id: selectedPetId,
          user_id: user.id,
          status: 'assigned',
          last_updated: new Date().toISOString()
        })
        .eq('id', tagId);

      if (error) throw error;

      // Log scan
      await logScan(tagId, selectedPetId, user.id);

      toast({
        title: t("success"),
        description: t("nfcTags.linkDialog.success"),
      });

      if (onSuccess) {
        onSuccess();
      }

      // Close dialog and redirect to pet profile
      onOpenChange(false);
      navigate(`/pet/${selectedPetId}`);
    } catch (error: any) {
      toast({
        title: t("error"),
        description: error.message || t("nfcTags.linkDialog.error"),
        variant: "destructive",
      });
    } finally {
      setLinking(false);
    }
  };

  const logScan = async (tagId: string, petId: string, userId: string) => {
    try {
      // الحصول على معلومات الجهاز التفصيلية
      const deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        browser: getBrowserInfo(),
        os: getOperatingSystem(),
        device: getDeviceType(),
      };

      // محاولة الحصول على الموقع إذا كان متاحاً
      let locationData = null;
      
      // تعريف وظيفة لتسجيل البيانات في قاعدة البيانات مع أو بدون بيانات الموقع
      const saveToDatabase = (locationInfo: any = null) => {
        console.log('Saving tag link with location data:', locationInfo);
        
        // تسجيل المسح في جدول nfc_scans
        supabase.from('nfc_scans').insert({
          tag_id: tagId,
          pet_id: petId,
          user_id: userId,
          device_info: deviceInfo,
          location: locationInfo,
          scanner_ip: null // سيتم التقاطها بواسطة الخادم
        })
        .then(response => {
          if (response.error) {
            console.error('Error inserting scan record from dialog:', response.error);
          } else {
            console.log('Scan record from dialog inserted successfully');
          }
        });
      };

      try {
        console.log('Checking if geolocation is available in dialog...');
        if (navigator.geolocation) {
          console.log('Requesting geolocation access from dialog...');
          
          // تسجيل البيانات أولاً بدون موقع
          saveToDatabase(null);
          
          // طلب تحديد الموقع
          navigator.geolocation.getCurrentPosition(
            (position) => {
              console.log('Geolocation access granted in dialog:', position);
              locationData = {
                coordinates: {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
                },
                accuracy: position.coords.accuracy,
                timestamp: position.timestamp,
                address: "تم تحديد الموقع"
              };
              
              // تحديث سجل المسح بمعلومات الموقع
              saveToDatabase(locationData);
            },
            (error) => {
              console.error('Geolocation error in dialog:', error.code, error.message);
              let errorMessage = "تعذر الوصول إلى بيانات الموقع";
              
              if (error.code === 1) {
                errorMessage = "تم رفض إذن الوصول للموقع. يرجى السماح بالوصول من إعدادات المتصفح";
              } else if (error.code === 2) {
                errorMessage = "تعذر تحديد الموقع. تأكد من تفعيل خدمة GPS وأنك متصل بالإنترنت";
              } else if (error.code === 3) {
                errorMessage = "انتهت مهلة طلب الموقع. حاول مرة أخرى";
              }
            },
            {
              enableHighAccuracy: true,
              timeout: 15000, // زيادة المهلة إلى 15 ثانية
              maximumAge: 0
            }
          );
        } else {
          console.log('Browser does not support geolocation');
          locationData = {
            address: "موقع غير محدد",
            error: "المتصفح لا يدعم خاصية تحديد الموقع"
          };
          
          // حفظ البيانات بدون معلومات الموقع
          saveToDatabase(locationData);
        }
      } catch (locationError: any) {
        console.error('Location access issue in dialog:', locationError);
        
        // توفير رسائل خطأ أكثر تفصيلاً بناءً على رمز الخطأ
        let errorMessage = "تعذر الوصول إلى بيانات الموقع";
        
        if (locationError.code === 1) {
          errorMessage = "تم رفض إذن الوصول للموقع. يرجى السماح بالوصول من إعدادات المتصفح";
        } else if (locationError.code === 2) {
          errorMessage = "تعذر تحديد الموقع. تأكد من تفعيل خدمة GPS وأنك متصل بالإنترنت";
        } else if (locationError.code === 3) {
          errorMessage = "انتهت مهلة طلب الموقع. حاول مرة أخرى";
        }
        
        // عدم فشل العملية بأكملها إذا كان الموقع غير متاح
        locationData = {
          address: "موقع غير محدد",
          error: errorMessage
        };
        
        // حفظ البيانات مع معلومات خطأ الموقع
        saveToDatabase(locationData);
      }
    } catch (error) {
      console.error('Error logging scan:', error);
    }
  };

  // Helper function to get browser info
  const getBrowserInfo = () => {
    const ua = navigator.userAgent;
    let browserName = "Unknown";
    
    if (ua.indexOf("Firefox") > -1) {
      browserName = "Firefox";
    } else if (ua.indexOf("SamsungBrowser") > -1) {
      browserName = "Samsung Browser";
    } else if (ua.indexOf("Opera") > -1 || ua.indexOf("OPR") > -1) {
      browserName = "Opera";
    } else if (ua.indexOf("Trident") > -1) {
      browserName = "Internet Explorer";
    } else if (ua.indexOf("Edge") > -1) {
      browserName = "Edge";
    } else if (ua.indexOf("Chrome") > -1) {
      browserName = "Chrome";
    } else if (ua.indexOf("Safari") > -1) {
      browserName = "Safari";
    }
    
    return browserName;
  };

  // Helper function to get OS info
  const getOperatingSystem = () => {
    const ua = navigator.userAgent;
    let os = "Unknown";
    
    if (ua.indexOf("Win") > -1) {
      os = "Windows";
    } else if (ua.indexOf("Mac") > -1) {
      os = "MacOS";
    } else if (ua.indexOf("Linux") > -1) {
      os = "Linux";
    } else if (ua.indexOf("Android") > -1) {
      os = "Android";
    } else if (ua.indexOf("like Mac") > -1) {
      os = "iOS";
    }
    
    return os;
  };

  // Helper function to determine device type
  const getDeviceType = () => {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return "Tablet";
    }
    if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
      return "Mobile";
    }
    return "Desktop";
  };

  const handleAddNewPet = () => {
    // Close this dialog and navigate to the pets page
    onOpenChange(false);
    navigate('/dashboard/pets');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("nfcTags.linkDialog.title")}</DialogTitle>
          <DialogDescription>
            {t("nfcTags.linkDialog.description", { tagCode })}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" text={t("nfcTags.linkDialog.loadingPets")} />
          </div>
        ) : pets.length > 0 ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="pet-select">{t("nfcTags.linkDialog.selectPet")}</Label>
              <Select value={selectedPetId} onValueChange={setSelectedPetId}>
                <SelectTrigger id="pet-select">
                  <SelectValue placeholder={t("nfcTags.linkDialog.choosePet")} />
                </SelectTrigger>
                <SelectContent>
                  {pets.map(pet => (
                    <SelectItem key={pet.id} value={pet.id}>
                      <div className="flex items-center gap-2">
                        <PetAvatar 
                          src={pet.profile_image_url} 
                          fallback={pet.name.charAt(0)} 
                          size="sm"
                          petType={pet.type}
                        />
                        <span>{pet.name} ({pet.type})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-between items-center pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleAddNewPet}
              >
                {t("nfcTags.linkDialog.addNewPet")}
              </Button>
              <Button 
                onClick={handleLinkPet} 
                disabled={!selectedPetId || linking}
                className="bg-pet-primary hover:bg-pet-secondary"
              >
                {linking ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" /> {t("nfcTags.linkDialog.linking")}
                  </>
                ) : (
                  <>
                    <LinkIcon className="mr-2 h-4 w-4" /> {t("nfcTags.linkDialog.linkPet")}
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="mb-4">{t("nfcTags.linkDialog.noPets")}</p>
            <Button onClick={handleAddNewPet} className="bg-pet-primary hover:bg-pet-secondary">
              {t("nfcTags.linkDialog.addFirstPet")}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 