import { createClient } from '@supabase/supabase-js';

// استبدل القيم دي بقيم مشروعك من Supabase
const supabaseUrl = 'https://etlzuamrufdhslnjicxi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0bHp1YW1ydWZkaHNsbmppY3hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxNDQwNTUsImV4cCI6MjA2MTcyMDA1NX0.IaAz5dpS6ImvZHBL43lywa43aDmcxYbeWlsQ9T-Fj2E';

// إنشاء عميل Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export { supabase };