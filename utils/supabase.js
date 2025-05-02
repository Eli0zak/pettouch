import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL'; // استبدل YOUR_SUPABASE_URL برابط مشروعك
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'; // استبدل YOUR_SUPABASE_ANON_KEY بمفتاحك

export const supabase = createClient(supabaseUrl, supabaseAnonKey);