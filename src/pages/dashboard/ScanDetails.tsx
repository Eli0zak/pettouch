import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { logger } from '@/utils/logger';
import { ChevronLeft, MapPin, Calendar, Clock, Monitor, Globe } from 'lucide-react';

interface ScanDetails {
  id: string;
  petName: string;
  petId: string;
  petImage: string | null;
  tagId: string;
  timestamp: Date;
  location: string;
  coordinates?: { lat: number; lng: number } | null;
  deviceInfo: {
    browser?: string;
    os?: string;
    device?: string;
    ip?: string;
  };
}

const ScanDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [scanDetails, setScanDetails] = useState<ScanDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { t, i18n } = useTranslation();

  // Format date
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat(i18n.language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  // Format time
  const formatTime = (date: Date): string => {
    return new Intl.DateTimeFormat(i18n.language, {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Fetch scan details
  const fetchScanDetails = async () => {
    try {
      setLoading(true);
      
      // Check session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: t('error'),
          description: t('auth.login'),
          variant: "destructive",
        });
        navigate('/login');
        return;
      }

      // Get scan record
      const { data: scan, error } = await supabase
        .from('nfc_scans')
        .select('*, pet:pets(name, profile_image_url)')
        .eq('id', id)
        .single();

      if (error) {
        logger.error("Error fetching scan details", { error, scanId: id });
        throw error;
      }

      if (!scan) {
        toast({
          title: t('error'),
          description: t('common.notFound'),
          variant: "destructive",
        });
        navigate('/dashboard/scan-records');
        return;
      }

      // Transform data
      const details: ScanDetails = {
        id: scan.id,
        petName: scan.pet?.name || t('community.unknown'),
        petId: scan.pet_id || '',
        petImage: scan.pet?.profile_image_url || null,
        tagId: scan.tag_id,
        timestamp: new Date(scan.created_at),
        location: scan.location?.address || t('community.unknown'),
        coordinates: scan.location?.coordinates || null,
        deviceInfo: scan.device_info || {}
      };

      setScanDetails(details);
    } catch (error) {
      logger.error('Error fetching scan details', { error });
      toast({
        title: t('error'),
        description: t('common.error'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScanDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!scanDetails) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="text-center">
          <p className="text-gray-500">{t('common.notFound')}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate('/dashboard/scan-records')}
          >
            {t('scanHistory.details.back')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 px-4 max-w-4xl">
      {/* Header with Back Button */}
      <div className="mb-6">
        <Button
          variant="ghost"
          className="mb-4 -ml-4 text-gray-600 hover:text-gray-900"
          onClick={() => navigate('/dashboard/scan-records')}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          {t('scanHistory.details.back')}
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          {t('scanHistory.details.title')}
        </h1>
      </div>

      {/* Pet Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">
            {t('scanHistory.details.sections.pet.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            {scanDetails.petImage && (
              <img
                src={scanDetails.petImage}
                alt={scanDetails.petName}
                className="w-12 h-12 rounded-full object-cover mr-4"
              />
            )}
            <div>
              <h3 className="font-medium text-gray-900">{scanDetails.petName}</h3>
              <Button
                variant="link"
                className="px-0 text-blue-600 hover:text-blue-800"
                onClick={() => navigate(`/dashboard/pets/${scanDetails.petId}`)}
              >
                {t('scanHistory.details.sections.pet.viewProfile')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Date & Time */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">
            {t('scanHistory.details.sections.time.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{formatDate(scanDetails.timestamp)}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Clock className="h-4 w-4 mr-2" />
              <span>{formatTime(scanDetails.timestamp)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">
            {t('scanHistory.details.sections.location.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start">
            <MapPin className="h-4 w-4 mr-2 mt-1 text-gray-500" />
            <div>
              <p className="text-gray-600">{scanDetails.location}</p>
              {!scanDetails.coordinates && (
                <p className="text-sm text-gray-500 mt-2">
                  {t('scanHistory.details.sections.location.noGps')}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Device Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {t('scanHistory.details.sections.device.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {scanDetails.deviceInfo.browser && (
              <div className="flex items-center text-gray-600">
                <Monitor className="h-4 w-4 mr-2" />
                <span>
                  {t('scanHistory.details.sections.device.browser')}: {scanDetails.deviceInfo.browser}
                </span>
              </div>
            )}
            {scanDetails.deviceInfo.os && (
              <div className="flex items-center text-gray-600">
                <Monitor className="h-4 w-4 mr-2" />
                <span>
                  {t('scanHistory.details.sections.device.os')}: {scanDetails.deviceInfo.os}
                </span>
              </div>
            )}
            {scanDetails.deviceInfo.device && (
              <div className="flex items-center text-gray-600">
                <Monitor className="h-4 w-4 mr-2" />
                <span>
                  {t('scanHistory.details.sections.device.device')}: {scanDetails.deviceInfo.device}
                </span>
              </div>
            )}
            {scanDetails.deviceInfo.ip && (
              <div className="flex items-center text-gray-600">
                <Globe className="h-4 w-4 mr-2" />
                <span>
                  {t('scanHistory.details.sections.device.ip')}: {scanDetails.deviceInfo.ip}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScanDetails;
