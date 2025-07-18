-- جدول المستخدمين (في حالة لم يكن موجوداً بالفعل)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    first_name TEXT,
    last_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    address JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    language TEXT DEFAULT 'ar',
    notification_settings JSONB,
    plan TEXT DEFAULT 'free',
    role TEXT DEFAULT 'user'
);

-- جدول الحيوانات الأليفة (في حالة لم يكن موجوداً بالفعل)
CREATE TABLE IF NOT EXISTS public.pets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    breed TEXT,
    color TEXT,
    gender TEXT,
    birthday DATE,
    weight_kg NUMERIC,
    microchip_id TEXT,
    notes TEXT,
    profile_image_url TEXT,
    qr_code_url TEXT,
    owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    medical_info JSONB,
    veterinarian JSONB,
    emergency_contact JSONB,
    scan_count INTEGER DEFAULT 0,
    last_scanned_at TIMESTAMP WITH TIME ZONE
);

-- جدول بطاقات NFC
CREATE TABLE IF NOT EXISTS public.nfc_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tag_code TEXT NOT NULL UNIQUE,
    pet_id UUID REFERENCES public.pets(id) ON DELETE SET NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    activated_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    tag_type TEXT DEFAULT 'standard',
    status TEXT DEFAULT 'unassigned', -- unassigned, assigned, lost, disabled
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول سجلات مسح بطاقات NFC
CREATE TABLE IF NOT EXISTS public.nfc_scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tag_id TEXT NOT NULL,
    pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE,
    location JSONB, -- يحتوي على معلومات الموقع مثل العنوان والإحداثيات {coordinates: {lat, lng}, address, accuracy, timestamp}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    device_info JSONB, -- معلومات عن الجهاز {userAgent, platform, language, browser, os, device}
    scanner_ip TEXT,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    CONSTRAINT nfc_scans_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.nfc_tags(tag_code) ON DELETE CASCADE
);

-- إنشاء المؤشرات للتحسين الأداء
CREATE INDEX IF NOT EXISTS nfc_tags_user_id_idx ON public.nfc_tags USING btree (user_id);
CREATE INDEX IF NOT EXISTS nfc_tags_pet_id_idx ON public.nfc_tags USING btree (pet_id);
CREATE INDEX IF NOT EXISTS nfc_tags_tag_code_idx ON public.nfc_tags USING btree (tag_code);
CREATE INDEX IF NOT EXISTS nfc_scans_tag_id_idx ON public.nfc_scans USING btree (tag_id);
CREATE INDEX IF NOT EXISTS nfc_scans_pet_id_idx ON public.nfc_scans USING btree (pet_id);
CREATE INDEX IF NOT EXISTS nfc_scans_created_at_idx ON public.nfc_scans USING btree (created_at);
CREATE INDEX IF NOT EXISTS nfc_scans_user_id_idx ON public.nfc_scans USING btree (user_id);

-- إنشاء دالة تحديث التواريخ (إذا لم تكن موجودة)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- تأكد من تحديث حقول التواريخ تلقائياً
CREATE TRIGGER update_nfc_tags_updated_at
BEFORE UPDATE ON public.nfc_tags
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- إنشاء دالة لزيادة عداد المسح للحيوان الأليف
CREATE OR REPLACE FUNCTION increment_scan_count(animal_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE pets
    SET 
        scan_count = COALESCE(scan_count, 0) + 1,
        last_scanned_at = NOW()
    WHERE id = animal_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- إنشاء trigger لتحديث عداد المسح تلقائيًا عند إضافة سجل مسح جديد
CREATE OR REPLACE FUNCTION update_pet_scan_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.pet_id IS NOT NULL THEN
        PERFORM increment_scan_count(NEW.pet_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إضافة trigger لتشغيل الدالة بعد إضافة سجل مسح جديد
DROP TRIGGER IF EXISTS update_pet_scan_stats_trigger ON public.nfc_scans;
CREATE TRIGGER update_pet_scan_stats_trigger
AFTER INSERT ON public.nfc_scans
FOR EACH ROW
EXECUTE FUNCTION update_pet_scan_stats();

-- إنشاء قواعد الوصول (RLS - Row Level Security) لضمان خصوصية البيانات

-- تمكين RLS على جدول بطاقات NFC
ALTER TABLE public.nfc_tags ENABLE ROW LEVEL SECURITY;

-- قاعدة للسماح للجميع بقراءة بطاقات NFC (وصول عام)
CREATE POLICY nfc_tags_public_read_policy ON public.nfc_tags
    FOR SELECT
    USING (true);

-- قاعدة للسماح للمستخدمين برؤية بطاقات NFC الخاصة بهم فقط (للتعديل والحذف)
CREATE POLICY nfc_tags_user_policy ON public.nfc_tags
    FOR ALL
    USING (user_id = auth.uid());

-- قاعدة للسماح للمشرفين بإدارة كاملة لجميع البطاقات
CREATE POLICY nfc_tags_admin_policy ON public.nfc_tags
    FOR ALL
    USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- قاعدة للسماح بإنشاء بطاقات NFC غير مرتبطة (للإعداد الأولي)
CREATE POLICY nfc_tags_insert_policy ON public.nfc_tags
    FOR INSERT
    WITH CHECK (user_id IS NULL OR user_id = auth.uid() OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- تمكين RLS على جدول سجلات المسح
ALTER TABLE public.nfc_scans ENABLE ROW LEVEL SECURITY;

-- قاعدة للسماح للجميع بإضافة سجلات مسح جديدة (للسماح بمسح البطاقات من قبل أي شخص)
CREATE POLICY nfc_scans_insert_policy ON public.nfc_scans
    FOR INSERT
    WITH CHECK (true);

-- قاعدة للسماح للمستخدمين برؤية سجلات مسح الحيوانات الأليفة الخاصة بهم فقط
CREATE POLICY nfc_scans_pet_owner_policy ON public.nfc_scans
    FOR SELECT
    USING ((SELECT owner_id FROM pets WHERE id = pet_id) = auth.uid());

-- قاعدة للسماح للمشرفين برؤية جميع سجلات المسح
CREATE POLICY nfc_scans_admin_policy ON public.nfc_scans
    FOR ALL
    USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- تمكين RLS على جدول الحيوانات الأليفة
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;

-- قاعدة للسماح للجميع بقراءة معلومات الحيوانات الأليفة (وصول عام)
CREATE POLICY pets_public_read_policy ON public.pets
    FOR SELECT
    USING (true);

-- قاعدة للسماح للمستخدمين بإدارة الحيوانات الأليفة الخاصة بهم فقط
CREATE POLICY pets_user_policy ON public.pets
    FOR ALL
    USING (owner_id = auth.uid());

-- قاعدة للسماح للمشرفين بإدارة كاملة لجميع الحيوانات الأليفة
CREATE POLICY pets_admin_policy ON public.pets
    FOR ALL
    USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- قاعدة للسماح بالوصول العام لبيانات الحيوان من خلال مسح بطاقة NFC
CREATE POLICY pets_public_nfc_access_policy ON public.pets
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.nfc_tags
            WHERE nfc_tags.pet_id = pets.id
            AND nfc_tags.is_active = true
            AND nfc_tags.status = 'assigned'
        )
    ); 