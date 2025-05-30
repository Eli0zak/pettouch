import { supabase } from '@/integrations/supabase/client';

// نموذج بيانات المسح
interface ScanData {
  tagId: string;
  location?: {
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  deviceInfo?: {
    browser?: string;
    os?: string;
    device?: string;
    userAgent?: string;
  };
}

/**
 * تسجيل عملية مسح جديدة
 * @param {ScanData} scanData - بيانات المسح
 * @returns {Promise<{success: boolean, scanId?: string, error?: string}>}
 */
export const recordNfcScan = async (scanData: ScanData): Promise<{success: boolean, scanId?: string, error?: string}> => {
  try {
    const { tagId, location, deviceInfo } = scanData;
    
    if (!tagId) {
      return { success: false, error: 'رمز البطاقة مطلوب' };
    }
    
    // البحث عن البطاقة NFC
    const { data: nfcTag, error: tagError } = await supabase
      .from('nfc_tags')
      .select('pet_id, is_active')
      .eq('tag_code', tagId)
      .single();
    
    if (tagError || !nfcTag) {
      return { success: false, error: 'لا توجد بطاقة NFC بهذا الرمز' };
    }
    
    if (!nfcTag.is_active) {
      return { success: false, error: 'بطاقة NFC غير نشطة' };
    }
    
    if (!nfcTag.pet_id) {
      return { success: false, error: 'بطاقة NFC غير مرتبطة بأي حيوان أليف' };
    }
    
    // تسجيل عملية المسح
    const { data: scan, error: scanError } = await supabase
      .from('nfc_scans')
      .insert({
        tag_id: tagId,
        pet_id: nfcTag.pet_id,
        location: location || null,
        device_info: deviceInfo || null,
      })
      .select('id')
      .single();
    
    if (scanError) {
      throw scanError;
    }
    
    // تحديث عدد مرات المسح وآخر وقت مسح للحيوان الأليف
    await supabase.rpc('increment_scan_count', { animal_id: nfcTag.pet_id });
    
    return { 
      success: true,
      scanId: scan.id 
    };
  } catch (error) {
    console.error('Error recording NFC scan:', error);
    return { 
      success: false, 
      error: 'فشل في تسجيل عملية المسح' 
    };
  }
};

/**
 * جلب سجلات المسح للمستخدم الحالي
 * @param {Object} options - خيارات الاستعلام
 * @param {string} [options.petId] - معرف الحيوان الأليف (اختياري)
 * @param {number} [options.limit] - عدد النتائج المطلوبة
 * @param {number} [options.offset] - بداية النتائج
 * @returns {Promise<{scans: any[], count: number, error?: string}>}
 */
export const fetchUserScans = async (options: {
  petId?: string;
  limit?: number;
  offset?: number;
  period?: 'day' | 'week' | 'month' | 'all';
}): Promise<{scans: any[], count: number, error?: string}> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return { scans: [], count: 0, error: 'يجب تسجيل الدخول لعرض سجلات المسح' };
    }
    
    let query = supabase
      .from('nfc_scans')
      .select(`
        id,
        tag_id,
        location,
        device_info,
        created_at,
        scanner_ip,
        pet:pet_id (
          id,
          name,
          profile_image_url,
          owner_id
        )
      `, { count: 'exact' });
    
    // تصفية حسب صاحب الحيوان الأليف
    query = query.eq('pet.owner_id', session.user.id);
    
    // تصفية حسب الحيوان الأليف إذا تم تحديده
    if (options.petId) {
      query = query.eq('pet_id', options.petId);
    }
    
    // تصفية حسب الفترة الزمنية
    if (options.period && options.period !== 'all') {
      const now = new Date();
      let startDate: Date;
      
      switch (options.period) {
        case 'day':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - now.getDay());
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          startDate = new Date(0); // تاريخ قديم جداً
      }
      
      query = query.gte('created_at', startDate.toISOString());
    }
    
    // إضافة الترتيب والحد والإزاحة
    query = query
      .order('created_at', { ascending: false })
      .limit(options.limit || 50)
      .offset(options.offset || 0);
    
    const { data: scans, error, count } = await query;
    
    if (error) {
      throw error;
    }
    
    return { 
      scans: scans || [], 
      count: count || 0 
    };
  } catch (error) {
    console.error('Error fetching NFC scans:', error);
    return { 
      scans: [], 
      count: 0, 
      error: 'فشل في جلب سجلات المسح'
    };
  }
};

/**
 * جلب تفاصيل عملية مسح محددة
 * @param {string} scanId - معرف المسح
 * @returns {Promise<{scan?: any, error?: string}>}
 */
export const fetchScanDetails = async (scanId: string): Promise<{scan?: any, error?: string}> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return { error: 'يجب تسجيل الدخول لعرض تفاصيل المسح' };
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
      .eq('id', scanId)
      .single();
    
    if (error) {
      throw error;
    }
    
    // التحقق من أن المستخدم هو صاحب الحيوان الأليف
    if (scan.pet.owner_id !== session.user.id) {
      return { error: 'ليس لديك صلاحية لعرض تفاصيل هذا المسح' };
    }
    
    return { scan };
  } catch (error) {
    console.error('Error fetching scan details:', error);
    return { error: 'فشل في جلب تفاصيل المسح' };
  }
};

/**
 * جلب إحصائيات المسح للمستخدم
 * @returns {Promise<{statistics?: any, error?: string}>}
 */
export const fetchScanStatistics = async (): Promise<{statistics?: any, error?: string}> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return { error: 'يجب تسجيل الدخول لعرض إحصائيات المسح' };
    }
    
    // الحصول على إجمالي عدد عمليات المسح
    const { count: totalScans, error: countError } = await supabase
      .from('nfc_scans')
      .select('id', { count: 'exact', head: true })
      .eq('pet.owner_id', session.user.id);
    
    if (countError) {
      throw countError;
    }
    
    // الحصول على عدد عمليات المسح في آخر 30 يوم
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { count: recentScans, error: recentError } = await supabase
      .from('nfc_scans')
      .select('id', { count: 'exact', head: true })
      .eq('pet.owner_id', session.user.id)
      .gte('created_at', thirtyDaysAgo.toISOString());
    
    if (recentError) {
      throw recentError;
    }
    
    // الحصول على عدد عمليات المسح لكل حيوان أليف
    const { data: petsData, error: petsError } = await supabase
      .from('pets')
      .select('id, name, scan_count')
      .eq('owner_id', session.user.id)
      .order('scan_count', { ascending: false });
    
    if (petsError) {
      throw petsError;
    }
    
    // تنسيق البيانات في شكل مناسب
    const statistics = {
      totalScans: totalScans || 0,
      recentScans: recentScans || 0,
      scansPerPet: petsData || []
    };
    
    return { statistics };
  } catch (error) {
    console.error('Error fetching scan statistics:', error);
    return { error: 'فشل في جلب إحصائيات المسح' };
  }
}; 