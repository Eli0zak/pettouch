import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Filter } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { logger } from '@/utils/logger';
import ScanRecordCard from '@/components/ui/ScanRecordCard';

// Model for scan record display
interface ScanRecord {
  id: string;
  petName: string;
  petId: string;
  petImage: string | null;
  tagId: string;
  timestamp: Date;
  location: string;
  coordinates?: { lat: number; lng: number } | null;
  scannerInfo?: string;
}

const ScanRecords = () => {
  const navigate = useNavigate();
  const [scanRecords, setScanRecords] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPetId, setSelectedPetId] = useState<string>('all');
  const [availablePets, setAvailablePets] = useState<{ id: string, name: string }[]>([]);
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

  // Fetch scan records from API
  const fetchScanRecords = async () => {
    try {
      setLoading(true);
      
      // Check session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: t('error'),
          description: t('access.loginRequired'),
          variant: "destructive",
        });
        navigate('/login');
        return;
      }
      
      logger.info("Fetching scan records for user", { userId: session.user.id });
      
      // First get all NFC tags owned by the user
      const { data: userTags, error: tagsError } = await supabase
        .from('nfc_tags')
        .select('id, tag_code, pet_id')
        .eq('user_id', session.user.id);
        
      if (tagsError) {
        logger.error("Error fetching user tags", { error: tagsError, userId: session.user.id });
        throw tagsError;
      }
      
      logger.info("User tags", { userTags, count: userTags?.length || 0 });
      
      if (!userTags || userTags.length === 0) {
        logger.info("No tags found for user", { userId: session.user.id });
        setScanRecords([]);
        setLoading(false);
        return;
      }
      
      // Get the tag_codes (not ids) for the query
      const tagCodes = userTags.map(tag => tag.tag_code);
      
      // Now get all scans for these tags using tag_code
      const { data: scans, error } = await supabase
        .from('nfc_scans')
        .select(`
          id,
          tag_id,
          location,
          device_info,
          created_at,
          scanner_ip,
          pet_id
        `)
        .in('tag_id', tagCodes)
        .order('created_at', { ascending: false });
      
      if (error) {
        logger.error("Error fetching scans", { error, tagCodes });
        throw error;
      }
      
      logger.info("Scans found", { scans, count: scans?.length || 0 });
      
      if (!scans || scans.length === 0) {
        logger.info("No scans found", { tagCodes });
        setScanRecords([]);
        setLoading(false);
        return;
      }
      
      // Get pet info for all pets involved in the scans
      const petIds = [...new Set(scans.filter(scan => scan.pet_id).map(scan => scan.pet_id))];
      
      let petsMap: Record<string, any> = {};
      
      if (petIds.length > 0) {
        const { data: pets, error: petsError } = await supabase
          .from('pets')
          .select('id, name, profile_image_url')
          .in('id', petIds);
          
        if (petsError) {
          logger.error("Error fetching pets", { error: petsError, petIds });
        } else if (pets) {
          petsMap = pets.reduce((acc, pet) => {
            acc[pet.id] = pet;
            return acc;
          }, {} as Record<string, any>);
        }
      }
      
      // Transform to required model
      const formattedRecords: ScanRecord[] = scans.map((scan: any) => {
        const pet = scan.pet_id ? petsMap[scan.pet_id] : null;
        
        // Extract device info in a more detailed way
        let deviceInfo = '';
        if (scan.device_info) {
          const deviceParts = [];
          
          // Get browser info
          if (scan.device_info.browser) {
            deviceParts.push(scan.device_info.browser);
          }
          
          // Get OS info
          if (scan.device_info.os) {
            deviceParts.push(scan.device_info.os);
          }
          
          // Get device type
          if (scan.device_info.device) {
            deviceParts.push(scan.device_info.device);
          }
          
          deviceInfo = deviceParts.join(' / ') || t('community.unknown');
        } else {
          deviceInfo = t('community.unknown');
        }
        
        // Extract location in a more detailed way
        let locationInfo = '';
        let coordinates = null;
        
        if (scan.location) {
          if (scan.location.address) {
            locationInfo = scan.location.address;
            coordinates = scan.location.coordinates || null;
          } else if (scan.location.city && scan.location.country) {
            locationInfo = `${scan.location.city}, ${scan.location.country}`;
          } else if (scan.location.coordinates) {
            locationInfo = `${scan.location.coordinates.lat.toFixed(4)}, ${scan.location.coordinates.lng.toFixed(4)}`;
            coordinates = scan.location.coordinates;
          } else {
            locationInfo = t('community.unknown');
          }
        } else {
          locationInfo = t('community.unknown');
        }
        
        return {
          id: scan.id,
          petName: pet?.name || t('community.unknown'),
          petId: scan.pet_id || '',
          petImage: pet?.profile_image_url || null,
          tagId: scan.tag_id,
          timestamp: new Date(scan.created_at),
          location: locationInfo,
          coordinates,
          scannerInfo: deviceInfo
        };
      });
      
      logger.info("Formatted records", { formattedRecords, count: formattedRecords.length });
      
      setScanRecords(formattedRecords);
      
      // Fetch available pets for filtering (all pets owned by user)
      const { data: userPets, error: userPetsError } = await supabase
        .from('pets')
        .select('id, name')
        .eq('owner_id', session.user.id);
      
      if (!userPetsError && userPets) {
        setAvailablePets(userPets);
      }
    } catch (error) {
      logger.error('Error fetching scan records', { error });
      toast({
        title: t('error'),
        description: t('common.error'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter records by time period
  const filterRecordsByPeriod = (period: 'today' | 'week' | 'month') => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Filter by pet if selected
    let filtered = scanRecords;
    if (selectedPetId !== 'all') {
      filtered = filtered.filter(record => record.petId === selectedPetId);
    }
    
    // Filter by time period
    return filtered.filter(record => {
      const recordDate = new Date(record.timestamp);
      
      if (period === 'today') {
        return recordDate >= today;
      } else if (period === 'week') {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        return recordDate >= weekStart;
      } else if (period === 'month') {
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        return recordDate >= monthStart;
      }
      
      return true;
    });
  };

  // Load data when component mounts
  useEffect(() => {
    fetchScanRecords();
  }, []);

  // Handle click on scan record
  const handleScanClick = (scanId: string) => {
    navigate(`/dashboard/scan-details/${scanId}`);
  };

  // Filter records by pet
  const filterRecordsByPet = (records: ScanRecord[]) => {
    if (selectedPetId === 'all') {
      return records;
    }
    
    return records.filter(record => record.petId === selectedPetId);
  };

  // Render scan records
  const renderScanRecords = (records: ScanRecord[]) => {
    const filteredRecords = filterRecordsByPet(records);
    
    if (loading) {
      return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">{t('common.loading')}</p>
        </div>
      );
    }
    
    if (filteredRecords.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t('scanHistory.empty.title')}
          </h3>
          <p className="text-gray-500 max-w-sm mx-auto">
            {t('scanHistory.empty.description')}
          </p>
        </div>
      );
    }
    
    return (
      <div className="space-y-3">
        {filteredRecords.map((record) => (
          <ScanRecordCard
            key={record.id}
            id={record.id}
            petName={record.petName}
            petImage={record.petImage}
            timestamp={record.timestamp}
            location={record.location}
            coordinates={record.coordinates}
            onClick={handleScanClick}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-4 px-4 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          {t('scanHistory.title')}
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          {t('scanHistory.description')}
        </p>
      </div>
      
      {/* Pet Filter */}
      {availablePets.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              {t('store.filters')}:
            </span>
          </div>
          <Select value={selectedPetId} onValueChange={setSelectedPetId}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder={t('nfcTags.linkDialog.choosePet')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('community.filters.all')}</SelectItem>
              {availablePets.map(pet => (
                <SelectItem key={pet.id} value={pet.id}>
                  {pet.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      {/* Time Period Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="all" className="text-xs sm:text-sm">
            {t('scanHistory.filters.all')}
          </TabsTrigger>
          <TabsTrigger value="today" className="text-xs sm:text-sm">
            {t('scanHistory.filters.today')}
          </TabsTrigger>
          <TabsTrigger value="week" className="text-xs sm:text-sm">
            {t('scanHistory.filters.week')}
          </TabsTrigger>
          <TabsTrigger value="month" className="text-xs sm:text-sm">
            {t('scanHistory.filters.month')}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-0">
          {renderScanRecords(scanRecords)}
        </TabsContent>
        
        <TabsContent value="today" className="mt-0">
          {renderScanRecords(filterRecordsByPeriod('today'))}
        </TabsContent>
        
        <TabsContent value="week" className="mt-0">
          {renderScanRecords(filterRecordsByPeriod('week'))}
        </TabsContent>
        
        <TabsContent value="month" className="mt-0">
          {renderScanRecords(filterRecordsByPeriod('month'))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScanRecords; 