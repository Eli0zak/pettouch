import React, { useState, useEffect } from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { Button } from './button';
import { Alert, AlertDescription, AlertTitle } from './alert';
import { MapPin, AlertTriangle, Check, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export function LocationPermissionChecker() {
  const [permissionState, setPermissionState] = useState<string | null>(null);
  const { requestLocation, requestLocationDirectly, checkPermission, loading, locationData } = useGeolocation();
  const { t } = useLanguage();
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const checkCurrentPermission = async () => {
      console.log('Checking initial permission state...');
      const state = await checkPermission();
      setPermissionState(state);
    };
    
    checkCurrentPermission();
  }, [checkPermission]);

  const handleRequestPermission = async () => {
    setChecking(true);
    console.log('Requesting location permission from button click...');
    try {
      // استخدام الطريقة المباشرة لطلب الموقع
      requestLocationDirectly();
      
      // انتظار لحظة ثم إعادة التحقق من حالة الإذن
      setTimeout(async () => {
        const newState = await checkPermission();
        setPermissionState(newState);
        setChecking(false);
      }, 2000);
    } catch (error) {
      console.error('Error requesting permission:', error);
      setChecking(false);
    }
  };

  // إظهار حالة التحميل أثناء البدء
  if (!permissionState) {
    return (
      <Alert className="bg-gray-50 border-gray-200">
        <Loader2 className="h-4 w-4 animate-spin" />
        <AlertTitle>{t('locationChecker.checkingPermission')}</AlertTitle>
        <AlertDescription>
          {t('locationChecker.pleaseWait')}
        </AlertDescription>
      </Alert>
    );
  }

  // إذا تم تحديد الموقع بنجاح
  if (locationData && locationData.coordinates) {
    return (
      <Alert className="bg-green-50 border-green-200">
        <Check className="h-4 w-4 text-green-600" />
        <AlertTitle>{t('locationChecker.locationGrantedSuccess')}</AlertTitle>
        <AlertDescription>
          <div className="text-xs mt-1">
            {t('locationChecker.coordinates')}: {locationData.coordinates.lat.toFixed(4)}, {locationData.coordinates.lng.toFixed(4)}
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // إذا تم منح الإذن لكن لم يتم تحديد الموقع بعد
  if (permissionState === 'granted') {
    return (
      <Alert className="bg-green-50 border-green-200">
        <Check className="h-4 w-4 text-green-600" />
        <AlertTitle>{t('locationChecker.permissionGranted')}</AlertTitle>
        <AlertDescription>
          <div>{t('locationChecker.locationEnabled')}</div>
          <Button 
            variant="outline" 
            size="sm"
            className="mt-2"
            onClick={handleRequestPermission}
            disabled={checking}
          >
            {checking ? 
              <><Loader2 className="h-3 w-3 mr-2 animate-spin" /> {t('locationChecker.updatingLocation')}</> : 
              t('locationChecker.updateLocation')}
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // إذا تم رفض الإذن
  if (permissionState === 'denied') {
    return (
      <Alert className="bg-red-50 border-red-200">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertTitle>{t('locationChecker.permissionDenied')}</AlertTitle>
        <AlertDescription>
          <p>{t('locationChecker.enableInstructions')}</p>
          <p className="text-xs text-gray-500 mt-2">
            {t('locationChecker.enableInChrome')}
          </p>
          <Button 
            variant="outline" 
            size="sm"
            className="mt-2"
            onClick={handleRequestPermission}
          >
            {t('locationChecker.tryAgain')}
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // الحالة الافتراضية (الإذن لم يحدد بعد - prompt)
  return (
    <Alert className="bg-amber-50 border-amber-200">
      <MapPin className="h-4 w-4 text-amber-600" />
      <AlertTitle>{t('locationChecker.locationPermission')}</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>{t('locationChecker.permissionNeeded')}</p>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleRequestPermission}
          disabled={checking}
          className="flex items-center"
        >
          {checking ? 
            <><Loader2 className="h-3 w-3 mr-2 animate-spin" /> {t('locationChecker.checking')}</> : 
            t('locationChecker.enableLocation')}
        </Button>
      </AlertDescription>
    </Alert>
  );
} 