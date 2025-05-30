import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar } from "@/components/ui/avatar";
import { MapPin, Calendar, Clock, User, ArrowRight, Map, Smartphone, Globe, Tag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";
import LocationMap from '@/components/LocationMap';

interface ScanDetails {
  id: string;
  petName: string;
  petId: string;
  petImage: string | null;
  tagId: string;
  timestamp: string;
  location: string;
  coordinates?: { lat: number; lng: number } | null;
  scannerInfo: string;
  deviceDetails?: {
    browser?: string;
    os?: string;
    device?: string;
    ip?: string;
  } | null;
}

const ScanDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [scanDetails, setScanDetails] = useState<ScanDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // دالة تنسيق التاريخ
  const formatDate = (dateString: string): string => {
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(dateString));
  };

  // دالة تنسيق الوقت
  const formatTime = (dateString: string): string => {
    return new Intl.DateTimeFormat('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  // جلب تفاصيل المسح
  useEffect(() => {
    const fetchScanDetails = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          toast({
            title: "غير مصرح",
            description: "يجب تسجيل الدخول لعرض تفاصيل المسح",
            variant: "destructive",
          });
          navigate('/login');
          return;
        }

        const { data: scan, error } = await supabase
          .from('nfc_scans')
          .select(`
            id,
            tag_id,
            location,
            device_info,
            scanner_ip,
            created_at,
            pet:pet_id (
              id,
              name,
              profile_image_url,
              owner_id
            )
          `)
          .eq('id', id)
          .single();

        if (error || !scan) {
          throw new Error('سجل المسح غير موجود');
        }

        // التحقق من أن المستخدم هو صاحب الحيوان الأليف
        if (scan.pet?.owner_id !== session.user.id) {
          toast({
            title: "رفض الوصول",
            description: "ليس لديك صلاحية لعرض سجل المسح هذا",
            variant: "destructive",
          });
          navigate('/dashboard/scan-records');
          return;
        }

        setScanDetails({
          id: scan.id,
          petName: scan.pet?.name || 'حيوان أليف غير معروف',
          petId: scan.pet?.id,
          petImage: scan.pet?.profile_image_url,
          tagId: scan.tag_id,
          timestamp: scan.created_at,
          location: scan.location?.address || 'موقع غير معروف',
          coordinates: scan.location?.coordinates || null,
          scannerInfo: (scan.device_info?.browser && scan.device_info?.os) ? 
                      `${scan.device_info.browser} / ${scan.device_info.os} / ${scan.device_info.device || 'غير معروف'}` : 
                      'جهاز غير معروف',
          deviceDetails: {
            browser: scan.device_info?.browser,
            os: scan.device_info?.os,
            device: scan.device_info?.device,
            ip: scan.scanner_ip
          }
        });
      } catch (error) {
        console.error('Error fetching scan details:', error);
        toast({
          title: "خطأ",
          description: "فشل في تحميل تفاصيل المسح. يرجى المحاولة مرة أخرى لاحقاً.",
          variant: "destructive",
        });
        navigate('/dashboard/scan-records');
      } finally {
        setLoading(false);
      }
    };

    fetchScanDetails();
  }, [id, navigate, toast]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8 flex items-center">
          <Button variant="ghost" className="ml-2" onClick={() => navigate('/dashboard/scan-records')}>
            <ArrowRight className="h-4 w-4 ml-2" />
            رجوع
          </Button>
          <Skeleton className="h-8 w-48" />
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
            <div className="flex items-center">
              <Skeleton className="h-12 w-12 rounded-full ml-4" />
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-b pb-4">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-3 w-48" />
              </div>
              <div className="border-b pb-4">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-3 w-48" />
              </div>
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!scanDetails) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h2 className="text-2xl font-bold mb-4">سجل المسح غير موجود</h2>
        <p className="mb-4">سجل المسح الذي تبحث عنه غير موجود أو ليس لديك صلاحية لعرضه.</p>
        <Button onClick={() => navigate('/dashboard/scan-records')}>
          <ArrowRight className="h-4 w-4 ml-2" />
          الرجوع إلى سجلات المسح
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 flex items-center">
        <Button variant="ghost" className="ml-2" onClick={() => navigate('/dashboard/scan-records')}>
          <ArrowRight className="h-4 w-4 ml-2" />
          رجوع
        </Button>
        <h1 className="text-3xl font-bold">تفاصيل المسح</h1>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="mb-4">معلومات الحيوان الأليف</CardTitle>
          <div className="flex items-center">
            {scanDetails.petImage ? (
              <Avatar className="h-12 w-12 ml-4">
                <img src={scanDetails.petImage} alt={scanDetails.petName} />
              </Avatar>
            ) : (
              <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center ml-4">
                <span className="text-gray-500">🐾</span>
              </div>
            )}
            <div>
              <h3 className="font-medium">{scanDetails.petName}</h3>
              <Button 
                variant="link" 
                className="p-0 h-auto text-sm text-blue-600" 
                onClick={() => navigate(`/dashboard/pets/${scanDetails.petId}`)}
              >
                عرض ملف الحيوان الأليف
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h3 className="font-medium mb-2 flex items-center">
                <Calendar className="h-4 w-4 ml-2 text-gray-500" />
                التاريخ والوقت
              </h3>
              <div className="flex flex-col md:flex-row md:items-center text-gray-600">
                <div className="flex items-center ml-6">
                  <Calendar className="h-4 w-4 ml-1 text-gray-400" />
                  <span>{formatDate(scanDetails.timestamp)}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 ml-1 text-gray-400" />
                  <span>{formatTime(scanDetails.timestamp)}</span>
                </div>
              </div>
            </div>
            
            <div className="border-b pb-4">
              <h3 className="font-medium mb-2 flex items-center">
                <MapPin className="h-4 w-4 ml-2 text-gray-500" />
                الموقع
              </h3>
              <p className="text-gray-600 mb-2">
                {scanDetails.location}
              </p>
              {scanDetails.coordinates && (
                <div className="space-y-2">
                  <LocationMap 
                    coordinates={scanDetails.coordinates} 
                    locationName={scanDetails.location}
                    height="300px"
                  />
                  <p className="text-xs text-gray-500 text-center mt-1">
                    الإحداثيات: {scanDetails.coordinates.lat.toFixed(6)}, {scanDetails.coordinates.lng.toFixed(6)}
                  </p>
                </div>
              )}
            </div>
            
            <div className="border-b pb-4">
              <h3 className="font-medium mb-2 flex items-center">
                <Tag className="h-4 w-4 ml-2 text-gray-500" />
                معلومات البطاقة
              </h3>
              <div className="flex items-center text-gray-600">
                <Tag className="h-4 w-4 ml-1 text-gray-400" />
                <span className="font-mono">{scanDetails.tagId}</span>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2 flex items-center">
                <Smartphone className="h-4 w-4 ml-2 text-gray-500" />
                معلومات الجهاز
              </h3>
              {scanDetails.deviceDetails && (
                <div className="space-y-2 text-gray-600">
                  {scanDetails.deviceDetails.browser && (
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 ml-1 text-gray-400" />
                      <span>المتصفح: {scanDetails.deviceDetails.browser}</span>
                    </div>
                  )}
                  {scanDetails.deviceDetails.os && (
                    <div className="flex items-center">
                      <Smartphone className="h-4 w-4 ml-1 text-gray-400" />
                      <span>نظام التشغيل: {scanDetails.deviceDetails.os}</span>
                    </div>
                  )}
                  {scanDetails.deviceDetails.device && (
                    <div className="flex items-center">
                      <Smartphone className="h-4 w-4 ml-1 text-gray-400" />
                      <span>الجهاز: {scanDetails.deviceDetails.device}</span>
                    </div>
                  )}
                  {scanDetails.deviceDetails.ip && (
                    <div className="flex items-center">
                      <User className="h-4 w-4 ml-1 text-gray-400" />
                      <span>IP: {scanDetails.deviceDetails.ip}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScanDetails; 