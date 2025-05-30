import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

export interface LocationData {
  coordinates?: {
    lat: number;
    lng: number;
  };
  accuracy?: number;
  timestamp?: number;
  address?: string;
  error?: string;
}

export function useGeolocation() {
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const checkPermission = async () => {
    try {
      console.log('Checking geolocation permission...');
      
      // التحقق من توفر واجهة الأذونات (غير متوفرة في كل المتصفحات)
      if (navigator.permissions && navigator.permissions.query) {
        console.log('Using Permissions API to check geolocation status');
        const permissionStatus = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
        console.log('Permission status:', permissionStatus.state);
        return permissionStatus.state;
      }
      
      // إرجاع للمتصفحات التي لا تدعم واجهة الأذونات
      if (navigator.geolocation) {
        console.log('Browser supports geolocation, but Permissions API not available');
        return 'prompt'; // لا يمكن التحديد، نفترض الحاجة للسؤال
      }
      
      console.log('Browser does not support geolocation');
      return 'denied';
    } catch (err) {
      console.error('Error checking geolocation permission:', err);
      return 'unknown';
    }
  };

  const requestLocationDirectly = () => {
    console.log('Requesting location directly...');
    
    if (!navigator.geolocation) {
      console.error('Geolocation API not available');
      toast({
        title: "خطأ في تحديد الموقع",
        description: "متصفحك لا يدعم خدمة تحديد الموقع",
        variant: "destructive",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('Got position directly:', position);
        const data = {
          coordinates: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
          address: "تم تحديد الموقع"
        };
        setLocationData(data);
        setError(null);
      },
      (err) => {
        console.error('Direct geolocation error:', err);
        handleGeolocationError(err);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  const handleGeolocationError = (err: any) => {
    let errorMessage = "تعذر الوصول إلى بيانات الموقع";
    
    console.error('Geolocation error details:', {
      code: err.code,
      message: err.message,
      PERMISSION_DENIED: err.code === 1,
      POSITION_UNAVAILABLE: err.code === 2,
      TIMEOUT: err.code === 3
    });
    
    if (err.code === 1) {
      errorMessage = "تم رفض إذن الوصول للموقع. يرجى السماح بالوصول من إعدادات المتصفح";
      toast({
        title: "خطأ في تحديد الموقع",
        description: errorMessage,
        variant: "destructive",
      });
    } else if (err.code === 2) {
      errorMessage = "تعذر تحديد الموقع. تأكد من تفعيل خدمة GPS وأنك متصل بالإنترنت";
      toast({
        title: "تعذر تحديد الموقع",
        description: errorMessage,
        variant: "destructive",
      });
    } else if (err.code === 3) {
      errorMessage = "انتهت مهلة طلب الموقع. حاول مرة أخرى";
      toast({
        title: "طلب الموقع استغرق وقتاً طويلاً",
        description: errorMessage,
        variant: "destructive",
      });
    }
    
    setError(errorMessage);
  };

  const requestLocation = async (): Promise<LocationData> => {
    console.log('Starting location request process...');
    setLoading(true);
    setError(null);
    
    try {
      if (!navigator.geolocation) {
        throw new Error('Browser does not support geolocation');
      }
      
      const permissionState = await checkPermission();
      console.log('Current geolocation permission state:', permissionState);
      
      if (permissionState === 'denied') {
        throw { 
          code: 1, 
          message: 'Location permission denied' 
        };
      }
      
      console.log('Requesting geolocation with Promise...');
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log('Position obtained successfully:', {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy
            });
            resolve(position);
          },
          (error) => {
            console.error('Geolocation error in promise:', error);
            reject(error);
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
          }
        );
      });
      
      const data = {
        coordinates: {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        },
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp,
        address: "تم تحديد الموقع (يمكن استخدام خدمة Geocoding للحصول على العنوان)"
      };
      
      console.log('Setting location data:', data);
      setLocationData(data);
      return data;
    } catch (err: any) {
      console.error('Error getting location:', err);
      
      handleGeolocationError(err);
      
      return {
        address: "موقع غير محدد",
        error: error || "تعذر الوصول إلى بيانات الموقع"
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    locationData,
    loading,
    error,
    requestLocation,
    requestLocationDirectly,
    checkPermission
  };
} 