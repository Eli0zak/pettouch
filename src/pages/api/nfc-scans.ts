import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/integrations/supabase/client';

// نموذج لبيانات المسح المستلمة
interface NFCScanData {
  tagId: string;
  location?: string;
  scannerInfo?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // GET: استرجاع سجلات المسح للمستخدم الحالي
  if (req.method === 'GET') {
    // التحقق من الجلسة
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      // استرجاع سجلات المسح للمستخدم الحالي
      const { data: scans, error } = await supabase
        .from('nfc_scans')
        .select(`
          id,
          tag_id,
          location,
          device_info,
          created_at,
          pet:pet_id (
            id,
            name,
            profile_image_url
          )
        `)
        .eq('pet.owner_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // تنسيق البيانات للعرض
      const formattedScans = scans.map(scan => ({
        id: scan.id,
        petName: scan.pet?.name || 'Unknown Pet',
        petId: scan.pet?.id,
        petImage: scan.pet?.profile_image_url,
        tagId: scan.tag_id,
        timestamp: scan.created_at,
        location: scan.location?.address || 'Unknown location',
        scannerInfo: scan.device_info?.browser || scan.device_info?.os || 'Unknown device'
      }));

      return res.status(200).json(formattedScans);
    } catch (error) {
      console.error('Error fetching NFC scans:', error);
      return res.status(500).json({ message: 'Failed to fetch scan records' });
    }
  }
  
  // POST: تسجيل عملية مسح جديدة
  if (req.method === 'POST') {
    try {
      const { tagId, location, scannerInfo } = req.body as NFCScanData;
      
      if (!tagId) {
        return res.status(400).json({ message: 'Tag ID is required' });
      }
      
      // البحث عن البطاقة NFC
      const { data: nfcTag, error: tagError } = await supabase
        .from('nfc_tags')
        .select('pet_id')
        .eq('tag_code', tagId)
        .single();
      
      if (tagError || !nfcTag) {
        return res.status(404).json({ message: 'No NFC tag found with this code' });
      }
      
      if (!nfcTag.pet_id) {
        return res.status(404).json({ message: 'This NFC tag is not associated with any pet' });
      }
      
      // تسجيل عملية المسح
      const { data: scan, error: scanError } = await supabase
        .from('nfc_scans')
        .insert({
          tag_id: tagId,
          pet_id: nfcTag.pet_id,
          location: location ? { address: location } : null,
          device_info: scannerInfo ? { browser: scannerInfo } : null,
        })
        .select()
        .single();
      
      if (scanError) {
        throw scanError;
      }
      
      // تحديث عدد مرات المسح وآخر وقت مسح للحيوان الأليف
      await supabase
        .from('pets')
        .update({
          scan_count: supabase.rpc('increment', { inc_amount: 1 }),
          last_scanned_at: new Date().toISOString()
        })
        .eq('id', nfcTag.pet_id);
      
      return res.status(201).json({ 
        message: 'Scan recorded successfully',
        scanId: scan.id
      });
    } catch (error) {
      console.error('Error recording NFC scan:', error);
      return res.status(500).json({ message: 'Failed to record scan' });
    }
  }
  
  // طرق أخرى غير مدعومة
  return res.status(405).json({ message: 'Method not allowed' });
} 