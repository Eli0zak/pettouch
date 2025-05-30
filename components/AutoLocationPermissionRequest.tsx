import React, { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { MapPin } from 'lucide-react';
import { Button } from './ui/button';

const AutoLocationPermissionRequest: React.FC = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [showButton, setShowButton] = useState(true);
  
  useEffect(() => {
    // التحقق من حالة الإذن الحالية
    const checkPermissionStatus = async () => {
      try {
        // في حال كان المتصفح يدعم واجهة permissions API
        if (navigator.permissions && navigator.permissions.query) {
          const result = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
          
          if (result.state === 'granted') {
            // الإذن ممنوح بالفعل، يمكن إخفاء الزر
            setShowButton(false);
          }
        }
      } catch (error) {
        console.error('Error checking permission:', error);
      }
    };
    
    checkPermissionStatus();
    
    // محاولة طلب الموقع بشكل تلقائي بعد فترة قصيرة من تحميل الصفحة
    const timer = setTimeout(() => {
      requestLocationWithConsent();
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // طلب الموقع مع رسالة توضيحية
  const requestLocationWithConsent = () => {
    if (!navigator.geolocation) {
      toast({
        title: t('location.notSupported'),
        description: t('location.browserNoSupport'),
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: t('location.requestingPermission'),
      description: t('location.permissionExplanation'),
      action: (
        <Button 
          variant="default"
          onClick={requestLocation}
          className="bg-pet-primary hover:bg-pet-secondary"
        >
          {t('location.allowAccess')}
        </Button>
      ),
    });
  };
  
  // طلب الموقع فعلياً
  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // تم الحصول على الموقع بنجاح
          toast({
            title: t('location.accessGranted'),
            description: t('location.thankYou'),
            variant: "default",
          });
          setShowButton(false);
        },
        (error) => {
          // حدث خطأ أثناء طلب الموقع
          let message = '';
          
          switch (error.code) {
            case 1:
              message = t('location.permissionDenied');
              break;
            case 2:
              message = t('location.locationUnavailable');
              break;
            case 3:
              message = t('location.timeout');
              break;
            default:
              message = t('location.unknownError');
          }
          
          toast({
            title: t('location.error'),
            description: message,
            variant: "destructive",
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    }
  };
  
  if (!showButton) return null;
  
  return (
    <div className="fixed bottom-20 md:bottom-6 right-6 z-50">
      <Button
        onClick={requestLocation}
        className="bg-pet-primary hover:bg-pet-secondary text-white shadow-lg rounded-full p-3 h-auto flex items-center gap-2"
      >
        <MapPin className="h-5 w-5" />
        <span className="hidden md:inline">{t('location.enableLocation')}</span>
      </Button>
    </div>
  );
};

export default AutoLocationPermissionRequest; 