import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  User, Mail, Phone, Calendar, Clock, MapPin, Info, Heart, 
  ArrowLeft, Building, Shield, AlertTriangle, Scan, Link as LinkIcon, Tag, QrCode, ShoppingBag
} from 'lucide-react';
import { PetAvatar } from '@/components/ui/pet-avatar';
import { useAuth } from '@/components/PageGuard';
import { Pet, NfcTag } from '@/types';
import { LinkPetToTagDialog } from '@/components/ui/link-pet-to-tag-dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { Avatar } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Json } from '@/integrations/supabase/types';
import { LocationPermissionChecker } from '@/components/ui/location-permission-checker';
import { useGeolocation } from '@/hooks/useGeolocation';
import { logger } from '@/utils/logger';

interface TagData {
  id: string;
  tag_code: string;
  pet_id: string | null;
  user_id: string | null;
  is_active: boolean;
  created_at: string;
  activated_at: string | null;
  notes: string | null;
  tag_type: string;
  status: string;
  last_updated: string;
  pet?: {
    id: string;
    name: string;
    profile_image_url: string | null;
    type: string;
    breed: string | null;
    color: string | null;
    gender: string | null;
    notes: string | null;
    birthday: string | null;
    weight_kg: number | null;
    medical_info: Json | null;
    emergency_contact: Json | null;
    veterinarian: Json | null;
    owner_id: string;
    owner?: {
      first_name: string | null;
      last_name: string | null;
      phone: string | null;
      email: string | null;
    } | null;
  } | null;
}

interface EmergencyContact {
  name?: string;
  phone?: string;
  email?: string;
}

const TagPage = () => {
  const { tagCode } = useParams<{ tagCode: string }>();
  const [tag, setTag] = useState<TagData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [claimingTag, setClaimingTag] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAuthenticated, userId } = useAuth();
  const { t } = useLanguage();
  const { requestLocationDirectly } = useGeolocation();

  // طلب إذن الموقع مباشرةً عند تحميل الصفحة
  useEffect(() => {
    // طلب إذن الموقع بتأخير قصير للتأكد من تحميل الصفحة
    const timer = setTimeout(() => {
      logger.geolocation('Requesting location permission automatically on page load');
      try {
        if (navigator.geolocation) {
          // طلب الموقع بشكل مباشر - سيظهر إشعار الإذن للمستخدم
          navigator.geolocation.getCurrentPosition(
            (position) => {
              logger.geolocation('Geolocation permission granted on page load');
            },
            (error) => {
              logger.error('Geolocation error on page load', { code: error.code, message: error.message }, 'GEOLOCATION');
            },
            { 
              enableHighAccuracy: true,
              timeout: 15000,
              maximumAge: 0
            }
          );
        }
      } catch (error) {
        logger.error('Error requesting location on page load', error, 'GEOLOCATION');
      }
    }, 1000); // تأخير 1 ثانية

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchTagAndPet = async () => {
      if (!tagCode) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      
      try {
        // Fetch tag by code - this is public data
        const { data: tagData, error: tagError } = await supabase
          .from('nfc_tags')
          .select(`
            id,
            tag_code,
            pet_id,
            user_id,
            is_active,
            created_at,
            activated_at,
            notes,
            tag_type,
            status,
            last_updated,
            pet:pet_id (
              id,
              name,
              profile_image_url,
              type,
              breed,
              color,
              gender,
              notes,
              birthday,
              weight_kg,
              medical_info,
              emergency_contact,
              veterinarian,
              owner_id,
              owner:owner_id (
                first_name,
                last_name,
                phone,
                email
              )
            )
          `)
          .eq('tag_code', tagCode)
          .single();

        if (tagError) {
          logger.error('Error fetching tag', tagError, 'TAG_FETCH');
          
          // For public access, we simply show not found for any error
          setNotFound(true);
          setLoading(false);
          return;
        }

        // Always show tag data to users, regardless of active status
        setTag(tagData as TagData);

        // If tag is linked to a pet, log scan
        if (tagData.pet) {
          // Log scan anonymously if not authenticated
          await logScan(tagCode, tagData.pet.id);
        }

        // If user is authenticated and tag has no owner yet, automatically open the link dialog
        if (isAuthenticated && userId && !tagData.user_id && !tagData.pet) {
          setIsLinkDialogOpen(true);
        }
        
        // If user is the owner of this tag but it's not linked to a pet yet,
        // automatically open the link pet dialog
        if (isAuthenticated && userId && tagData.user_id === userId && !tagData.pet) {
          setIsLinkDialogOpen(true);
        }
      } catch (error) {
        logger.error('Error fetching tag and pet data', error, 'TAG_FETCH');
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchTagAndPet();
  }, [tagCode, isAuthenticated, userId]);

  const claimTag = async () => {
    if (!userId || !tag) return;
    
    setClaimingTag(true);
    try {
      // First check if the tag is available to be claimed
      const { data: existingTag, error: checkError } = await supabase
        .from('nfc_tags')
        .select('user_id, status, is_active')
        .eq('id', tag.id)
        .single();

      if (checkError) throw checkError;

      // Check if tag is available
      if (existingTag.user_id) {
        throw new Error(t('tagPage.alreadyClaimed'));
      }

      if (!existingTag.is_active) {
        throw new Error(t('tagPage.tagInactive'));
      }

      // Update the tag with the new owner
      const { data: updatedTag, error: updateError } = await supabase
        .from('nfc_tags')
        .update({
          user_id: userId,
          status: 'active',
          last_updated: new Date().toISOString(),
          activated_at: new Date().toISOString()
        })
        .eq('id', tag.id)
        .select()
        .single();

      if (updateError) throw updateError;

      if (updatedTag) {
        setTag(prevTag => ({ ...prevTag, ...updatedTag }));
        toast({
          title: t('success'),
          description: t('tagPage.claimSuccess'),
        });
        // Open dialog to link pet immediately
        setIsLinkDialogOpen(true);
      }
    } catch (error: any) {
      logger.error('Error claiming tag', error, 'TAG_CLAIM');
      toast({
        title: t('error'),
        description: error.message || t('tagPage.claimError'),
        variant: 'destructive',
      });
    } finally {
      setClaimingTag(false);
    }
  };

  const logScan = async (tagId: string, petId: string | null) => {
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
        logger.nfcScan('Saving scan with location data', { locationInfo, tagId, petId });
        
        // تسجيل المسح في جدول nfc_scans - سيكون user_id بقيمة null للمسح المجهول
        supabase.from('nfc_scans').insert({
          tag_id: tagId,
          pet_id: petId,
          user_id: userId || null, // سيكون null للمستخدمين غير المصادق عليهم
          device_info: deviceInfo,
          location: locationInfo,
          scanner_ip: null // سيتم التقاطها بواسطة الخادم
        })
        .then(response => {
          if (response.error) {
            logger.error('Error inserting scan record', response.error, 'NFC_SCAN');
          } else {
            logger.nfcScan('Scan record inserted successfully');
          }
        });
      };

      try {
        logger.geolocation('Checking if geolocation is available');
        if (navigator.geolocation) {
          logger.geolocation('Requesting geolocation access for scan logging');
          
          // استخدام الوعود (Promise) بدلاً من مراجع رد النداء (callbacks)
          // تسجيل البيانات أولاً بدون موقع، ثم تحديث في حالة نجاح الحصول على الموقع
          saveToDatabase(null);
          
          // طلب تحديد الموقع
          navigator.geolocation.getCurrentPosition(
            (position) => {
              logger.geolocation('Geolocation access granted for scan', { 
                lat: position.coords.latitude, 
                lng: position.coords.longitude,
                accuracy: position.coords.accuracy 
              });
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
              logger.geolocation('Updating scan with location data');
              saveToDatabase(locationData);
            },
            (error) => {
              logger.error('Geolocation error in scan', { code: error.code, message: error.message }, 'GEOLOCATION');
              let errorMessage = "تعذر الوصول إلى بيانات الموقع";
              
              if (error.code === 1) {
                errorMessage = "تم رفض إذن الوصول للموقع. يرجى السماح بالوصول من إعدادات المتصفح";
                toast({
                  title: t('tagPage.locationError'),
                  description: errorMessage,
                  variant: "destructive",
                });
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
          logger.geolocation('Browser does not support geolocation');
          locationData = {
            address: "موقع غير محدد",
            error: "المتصفح لا يدعم خاصية تحديد الموقع"
          };
          
          // حفظ البيانات بدون معلومات الموقع
          saveToDatabase(locationData);
        }
      } catch (locationError: any) {
        logger.error('Location access issue', locationError, 'GEOLOCATION');
        
        // توفير رسائل خطأ أكثر تفصيلاً بناءً على رمز الخطأ
        let errorMessage = "تعذر الوصول إلى بيانات الموقع";
        
        if (locationError.code === 1) {
          errorMessage = "تم رفض إذن الوصول للموقع. يرجى السماح بالوصول من إعدادات المتصفح";
          toast({
            title: t('tagPage.locationError'),
            description: errorMessage,
            variant: "destructive",
          });
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
      logger.error('Error logging scan', error, 'NFC_SCAN');
      // عدم إظهار أخطاء لتسجيل المسح للمستخدمين
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

  const handleRefresh = async () => {
    setLoading(true);
    try {
      if (tag) {
        const { data: refreshedTag, error } = await supabase
          .from('nfc_tags')
          .select(`
            id,
            tag_code,
            pet_id,
            user_id,
            is_active,
            created_at,
            activated_at,
            notes,
            tag_type,
            status,
            last_updated,
            pet:pet_id (
              id,
              name,
              profile_image_url,
              type,
              breed,
              color,
              gender,
              notes,
              birthday,
              weight_kg,
              medical_info,
              emergency_contact,
              veterinarian,
              owner_id,
              owner:owner_id (
                first_name,
                last_name,
                phone,
                email
              )
            )
          `)
          .eq('id', tag.id)
          .single();
          
        if (error) throw error;
        
        setTag(refreshedTag as TagData);
        if (refreshedTag.pet) {
          // Log scan anonymously if not authenticated
          await logScan(refreshedTag.tag_code, refreshedTag.pet.id);
        }
      }
    } catch (error) {
      logger.error('Error refreshing tag data', error, 'TAG_REFRESH');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return t('N/A');
    return new Date(dateString).toLocaleDateString();
  };

  if (loading || claimingTag) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner size="lg" text={claimingTag ? t('tagPage.claimingTag') : t('tagPage.loadingTag')} />
        </div>
      </Layout>
    );
  }

  if (notFound || !tag) {
    return (
      <Layout>
        <div className="container mx-auto py-10 px-4">
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-10">
              <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
              <h2 className="text-2xl font-bold mb-2">{t('tagPage.tagNotFound')}</h2>
              <p className="text-gray-600 mb-6">{t('tagPage.tagNotFoundDesc')}</p>
              <div className="flex flex-col items-center gap-4">
                <Link to="/" className="mt-2">
                  <Button variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" /> {t('tagPage.backToHome')}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // If tag exists but is not linked to a pet OR has no owner (unowned tag)
  if (!tag.pet_id || !tag.pet || !tag.user_id) {
    return (
      <Layout>
        <div className="container mx-auto py-10 px-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                {t('tagPage.nfcTag')} - {tag.tag_code}
              </CardTitle>
              <CardDescription>
                {!tag.user_id ? t('tagPage.unownedTag') : t('tagPage.notLinkedYet')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isAuthenticated ? (
                <>
                  {tag.user_id === userId ? (
                    <div className="bg-muted/30 p-4 rounded-md">
                      <h3 className="font-medium mb-2">{t('tagPage.linkThisTag')}</h3>
                      <p className="text-muted-foreground mb-4">
                        {t('tagPage.linkTagDescription')}
                      </p>
                      <Button
                        onClick={() => setIsLinkDialogOpen(true)}
                        className="w-full"
                        size="lg"
                      >
                        <LinkIcon className="mr-2 h-4 w-4" /> {t('tagPage.linkPetToTag')}
                      </Button>
                      
                      {/* Link Pet Dialog */}
                      <LinkPetToTagDialog
                        tagCode={tag.tag_code}
                        tagId={tag.id}
                        open={isLinkDialogOpen}
                        onOpenChange={setIsLinkDialogOpen}
                        onSuccess={handleRefresh}
                      />
                    </div>
                  ) : !tag.user_id ? (
                    <div className="bg-muted/30 p-4 rounded-md">
                      <h3 className="font-medium mb-2">{t('tagPage.claimAndLinkTag')}</h3>
                      <p className="text-muted-foreground mb-4">
                        {t('tagPage.unownedTagDescription')}
                      </p>
                      <Button
                        onClick={() => setIsLinkDialogOpen(true)}
                        className="w-full"
                        size="lg"
                      >
                        <LinkIcon className="mr-2 h-4 w-4" />
                        {t('tagPage.claimAndLinkPet')}
                      </Button>
                      
                      {/* Link Pet Dialog */}
                      <LinkPetToTagDialog
                        tagCode={tag.tag_code}
                        tagId={tag.id}
                        open={isLinkDialogOpen}
                        onOpenChange={setIsLinkDialogOpen}
                        onSuccess={handleRefresh}
                      />
                    </div>
                  ) : (
                    <div className="bg-muted/30 p-4 rounded-md">
                      <p className="text-muted-foreground text-sm mb-2">
                        {t('tagPage.tagOwnedByOther')}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-6">
                  <Scan className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-medium mb-2">{t('tagPage.tagMessage')}</h3>
                  <p className="text-muted-foreground mb-4">
                    {!tag.user_id ? t('tagPage.unownedTagMessage') : t('tagPage.tagNotLinkedMessage')}
                  </p>
                  <div className="flex flex-col items-center gap-3">
                    <Link to={`/auth?redirect=/tag/${tagCode}`}>
                      <Button>
                        {t('tagPage.signIn')}
                      </Button>
                    </Link>
                    <Link to="/">
                      <Button variant="outline">
                        {t('tagPage.backToHome')}
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // If tag is linked to a pet, show pet profile
  const petName = tag.pet.name || t('tagPage.unknown');
  const emergencyContact: EmergencyContact = (tag.pet.emergency_contact as EmergencyContact) || {};
  
  return (
    <Layout>
      <div className="container mx-auto py-10 px-4">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3">
            <Card>
              <CardContent className="flex flex-col items-center p-6">
                <div className="mb-4 relative">
                  <PetAvatar 
                    src={tag.pet.profile_image_url} 
                    fallback={petName.charAt(0)} 
                    size="xl"
                    petType={tag.pet.type}
                    className="w-32 h-32"
                  />
                  <Badge className="absolute bottom-0 right-0 bg-pet-primary">
                    {tag.pet.type}
                  </Badge>
                </div>
                <h1 className="text-2xl font-bold">{petName}</h1>
                <p className="text-muted-foreground">{tag.pet.breed || tag.pet.type}</p>
                
                <div className="w-full mt-6">
                  <Link to={`/pet/${tag.pet.id}`}>
                    <Button className="w-full">
                      {t('tagPage.viewFullProfile')}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:w-2/3">
            <Card>
              <CardHeader>
                <CardTitle>{t('tagPage.petInfo')}</CardTitle>
                <CardDescription>
                  {t('tagPage.basicDetails')} {petName}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{t('tagPage.gender')}:</span>
                    <span>{tag.pet.gender || t('N/A')}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{t('tagPage.birthday')}:</span>
                    <span>{formatDate(tag.pet.birthday)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{t('tagPage.color')}:</span>
                    <span>{tag.pet.color || t('N/A')}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{t('tagPage.weight')}:</span>
                    <span>{tag.pet.weight_kg ? `${tag.pet.weight_kg} kg` : t('N/A')}</span>
                  </div>
                </div>
                
                {tag.pet.notes && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-medium mb-2 flex items-center gap-2">
                        <Info className="h-4 w-4" /> {t('tagPage.notes')}
                      </h3>
                      <p className="text-muted-foreground">{tag.pet.notes}</p>
                    </div>
                  </>
                )}
                
                {tag.pet.medical_info && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-medium mb-2 flex items-center gap-2">
                        <Shield className="h-4 w-4" /> {t('tagPage.medicalNotes')}
                      </h3>
                      <p className="text-muted-foreground">{String(tag.pet.medical_info)}</p>
                    </div>
                  </>
                )}
                
                {emergencyContact && Object.keys(emergencyContact).length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-medium mb-2 flex items-center gap-2">
                        <Phone className="h-4 w-4" /> {t('tagPage.emergencyContact')}
                      </h3>
                      <div className="space-y-2">
                        {emergencyContact.name && (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{emergencyContact.name}</span>
                          </div>
                        )}
                        {emergencyContact.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{emergencyContact.phone}</span>
                          </div>
                        )}
                        {emergencyContact.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{emergencyContact.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TagPage;
