-- جدول صور الحيوانات الأليفة
CREATE TABLE IF NOT EXISTS public.pet_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    caption TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- إنشاء المؤشرات للتحسين الأداء
CREATE INDEX IF NOT EXISTS pet_images_pet_id_idx ON public.pet_images USING btree (pet_id);
CREATE INDEX IF NOT EXISTS pet_images_is_primary_idx ON public.pet_images USING btree (is_primary);
CREATE INDEX IF NOT EXISTS pet_images_user_id_idx ON public.pet_images USING btree (user_id);

-- تمكين RLS على جدول صور الحيوانات الأليفة
ALTER TABLE public.pet_images ENABLE ROW LEVEL SECURITY;

-- قاعدة للسماح للجميع بقراءة صور الحيوانات الأليفة (وصول عام)
CREATE POLICY pet_images_public_read_policy ON public.pet_images
    FOR SELECT
    USING (true);

-- قاعدة للسماح للمستخدمين بإدارة صور الحيوانات الأليفة الخاصة بهم فقط
CREATE POLICY pet_images_user_policy ON public.pet_images
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.pets
            WHERE pets.id = pet_images.pet_id
            AND pets.owner_id = auth.uid()
        )
    );

-- قاعدة للسماح للمشرفين بإدارة كاملة لجميع صور الحيوانات الأليفة
CREATE POLICY pet_images_admin_policy ON public.pet_images
    FOR ALL
    USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- إنشاء دالة تحديث التواريخ
CREATE OR REPLACE FUNCTION update_pet_images_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- تأكد من تحديث حقول التواريخ تلقائياً
CREATE TRIGGER update_pet_images_updated_at
BEFORE UPDATE ON public.pet_images
FOR EACH ROW
EXECUTE FUNCTION update_pet_images_updated_at();

-- إنشاء دالة للتأكد من وجود صورة رئيسية واحدة فقط لكل حيوان
CREATE OR REPLACE FUNCTION ensure_one_primary_image()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_primary THEN
        UPDATE public.pet_images
        SET is_primary = FALSE
        WHERE pet_id = NEW.pet_id AND id != NEW.id AND is_primary = TRUE;
        
        -- تحديث حقل profile_image_url في جدول pets
        UPDATE public.pets
        SET profile_image_url = NEW.image_url
        WHERE id = NEW.pet_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إضافة trigger لتشغيل الدالة عند تحديث أو إدراج صورة
CREATE TRIGGER ensure_one_primary_image_trigger
AFTER INSERT OR UPDATE OF is_primary ON public.pet_images
FOR EACH ROW
WHEN (NEW.is_primary = TRUE)
EXECUTE FUNCTION ensure_one_primary_image();

-- إنشاء دالة للتأكد من وجود صورة رئيسية واحدة على الأقل لكل حيوان
CREATE OR REPLACE FUNCTION set_default_primary_image()
RETURNS TRIGGER AS $$
BEGIN
    -- إذا لم تكن هناك صورة رئيسية لهذا الحيوان، اجعل هذه الصورة رئيسية
    IF NOT EXISTS (SELECT 1 FROM public.pet_images WHERE pet_id = NEW.pet_id AND is_primary = TRUE) THEN
        NEW.is_primary := TRUE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إضافة trigger لتشغيل الدالة عند إدراج صورة جديدة
CREATE TRIGGER set_default_primary_image_trigger
BEFORE INSERT ON public.pet_images
FOR EACH ROW
EXECUTE FUNCTION set_default_primary_image();

-- إنشاء دالة للتعامل مع حذف الصورة الرئيسية
CREATE OR REPLACE FUNCTION handle_primary_image_deletion()
RETURNS TRIGGER AS $$
BEGIN
    -- إذا كانت الصورة المحذوفة هي الصورة الرئيسية
    IF OLD.is_primary THEN
        -- حاول تعيين صورة أخرى كصورة رئيسية
        UPDATE public.pet_images
        SET is_primary = TRUE
        WHERE pet_id = OLD.pet_id
        AND id != OLD.id
        ORDER BY created_at DESC
        LIMIT 1;
        
        -- إذا لم تكن هناك صور أخرى، قم بتحديث profile_image_url في جدول pets إلى NULL
        IF NOT FOUND THEN
            UPDATE public.pets
            SET profile_image_url = NULL
            WHERE id = OLD.pet_id;
        END IF;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- إضافة trigger لتشغيل الدالة عند حذف صورة
CREATE TRIGGER handle_primary_image_deletion_trigger
AFTER DELETE ON public.pet_images
FOR EACH ROW
EXECUTE FUNCTION handle_primary_image_deletion(); 