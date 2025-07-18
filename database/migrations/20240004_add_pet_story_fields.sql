-- Add new Pet Story fields to pets table
ALTER TABLE pets
  ADD COLUMN IF NOT EXISTS personality_traits text,
  ADD COLUMN IF NOT EXISTS favorite_things text,
  ADD COLUMN IF NOT EXISTS adoption_date date;

COMMENT ON COLUMN pets.personality_traits IS 'A description of the pet''s personality, temperament, and unique traits';
COMMENT ON COLUMN pets.favorite_things IS 'A list or description of the pet''s favorite toys, treats, activities, etc';
COMMENT ON COLUMN pets.adoption_date IS 'The date when the pet was adopted';
