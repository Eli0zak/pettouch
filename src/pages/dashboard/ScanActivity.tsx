import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, MapPin, Calendar, Clock, User } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { NfcScan } from '@/types';

// نموذج لبيانات المسح المعروضة
interface ScanRecord {
  id: string;
  petName: string;
  petId: string;
  petImage: string | null;
  tagId: string;
  timestamp: Date;
  location: string;
  scannerInfo?: string;
}

const ScanActivity = () => {
  const navigate = useNavigate();
  // نموذج لبيانات المسح - سيتم استبدالها بالبيانات الفعلية من API
  const [scanRecords, setScanRecords] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();
  
  // دالة تنسيق التاريخ
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  // دالة تنسيق الوقت
  const formatTime = (date: Date): string => {
    return new Intl.DateTimeFormat('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // جلب بيانات المسح من API
  const fetchScanRecords = async () => {
    try {
      setLoading(true);
      
      // التحقق من الجلسة
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Unauthorized",
          description: "You must be logged in to view scan activity",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }
      
      // Get pets owned by the user
      const { data: userPets, error: petsError } = await supabase
        .from('pets')
        .select('id')
        .eq('owner_id', session.user.id);
        
      if (petsError) {
        console.error("Error fetching user pets:", petsError);
        throw petsError;
      }
      
      if (!userPets || userPets.length === 0) {
        console.log("No pets found for user");
        setScanRecords([]);
        setLoading(false);
        return;
      }
      
      const petIds = userPets.map(pet => pet.id);
      
      // استرجاع سجلات المسح للمستخدم الحالي
      const { data: scans, error } = await supabase
        .from('nfc_scans')
        .select(`
          id,
          tag_id,
          location,
          device_info,
          created_at,
          pet_id
        `)
        .in('pet_id', petIds)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching scans:", error);
        throw error;
      }
      
      if (!scans || scans.length === 0) {
        console.log("No scans found");
        setScanRecords([]);
        setLoading(false);
        return;
      }
      
      // Get pet details for all scans
      const { data: pets, error: petDetailsError } = await supabase
        .from('pets')
        .select('id, name, profile_image_url')
        .in('id', petIds);
        
      if (petDetailsError) {
        console.error("Error fetching pet details:", petDetailsError);
        throw petDetailsError;
      }
      
      const petsMap = pets.reduce((acc, pet) => {
        acc[pet.id] = pet;
        return acc;
      }, {} as Record<string, any>);
      
      // تحويل البيانات إلى النموذج المطلوب
      const formattedRecords: ScanRecord[] = scans.map((scan: any) => {
        const pet = scan.pet_id ? petsMap[scan.pet_id] : null;
        return {
          id: scan.id,
          petName: pet?.name || 'Unknown Pet',
          petId: scan.pet_id || '',
          petImage: pet?.profile_image_url || null,
          tagId: scan.tag_id,
          timestamp: new Date(scan.created_at),
          location: scan.location?.address || 'Unknown location',
          scannerInfo: scan.device_info?.browser || scan.device_info?.os || 'Unknown device'
        };
      });
      
      setScanRecords(formattedRecords);
    } catch (error) {
      console.error('Error fetching scan records:', error);
      toast({
        title: "Error",
        description: "Failed to load scan records. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // تصفية السجلات حسب الفترة الزمنية
  const filterRecordsByPeriod = (period: 'today' | 'week' | 'month') => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return scanRecords.filter(record => {
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

  // تحميل البيانات عند تحميل المكون
  useEffect(() => {
    fetchScanRecords();
  }, []);

  // معالجة النقر على سجل المسح
  const handleScanClick = (scanId: string) => {
    navigate(`/dashboard/scan-details/${scanId}`);
  };

  // تنسيق عرض السجلات
  const renderScanRecords = (records: ScanRecord[]) => {
    if (loading) {
      return (
        <div className="text-center py-8 text-gray-500">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading scan records...</p>
        </div>
      );
    }
    
    if (records.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <Activity className="mx-auto h-10 w-10 mb-4 text-gray-400" />
          <p>No NFC scan activity detected.</p>
          <p className="mt-2">When someone scans your pet's NFC tag, the activity will appear here.</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {records.map((record) => (
          <div 
            key={record.id} 
            className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={() => handleScanClick(record.id)}
          >
            <div>
              <h3 className="font-medium">{record.petName}</h3>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{formatDate(record.timestamp)}</span>
                <Clock className="h-4 w-4 mr-1 ml-3" />
                <span>{formatTime(record.timestamp)}</span>
              </div>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{record.location}</span>
              </div>
              {record.scannerInfo && (
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <User className="h-4 w-4 mr-1" />
                  <span>{record.scannerInfo}</span>
                </div>
              )}
            </div>
            <Badge className="mt-2 md:mt-0">NFC Tag</Badge>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Scan Activity</h1>
        <p className="text-gray-600">Track when and where your pets' NFC tags have been scanned</p>
      </div>
      
      <Tabs defaultValue="all" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Scans</TabsTrigger>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="week">This Week</TabsTrigger>
          <TabsTrigger value="month">This Month</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Scan Records</CardTitle>
            </CardHeader>
            <CardContent>
              {renderScanRecords(scanRecords)}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="today">
          <Card>
            <CardHeader>
              <CardTitle>Today's Scan Records</CardTitle>
            </CardHeader>
            <CardContent>
              {renderScanRecords(filterRecordsByPeriod('today'))}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="week">
          <Card>
            <CardHeader>
              <CardTitle>This Week's Scan Records</CardTitle>
            </CardHeader>
            <CardContent>
              {renderScanRecords(filterRecordsByPeriod('week'))}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="month">
          <Card>
            <CardHeader>
              <CardTitle>This Month's Scan Records</CardTitle>
            </CardHeader>
            <CardContent>
              {renderScanRecords(filterRecordsByPeriod('month'))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScanActivity;
