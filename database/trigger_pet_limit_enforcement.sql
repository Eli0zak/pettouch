-- Trigger function to enforce pet limit based on subscription plan
CREATE OR REPLACE FUNCTION enforce_pet_limit()
RETURNS TRIGGER AS $$
DECLARE
  user_plan TEXT;
  pet_limit INTEGER;
  current_pet_count INTEGER;
BEGIN
  -- Get the user's subscription plan
  SELECT plan INTO user_plan FROM users WHERE id = NEW.owner_id;

  -- Define pet limits per plan based on Subscription.tsx
  IF user_plan = 'free' THEN
    pet_limit := 1;
  ELSIF user_plan = 'premium' THEN
    pet_limit := 5;
  ELSIF user_plan = 'pro' THEN
    pet_limit := NULL; -- Unlimited
  ELSE
    pet_limit := 1; -- Default to free plan limit
  END IF;

  -- Count current pets for the user
  SELECT COUNT(*) INTO current_pet_count FROM pets WHERE owner_id = NEW.owner_id;

  -- Check if limit exceeded
  IF pet_limit IS NOT NULL AND current_pet_count >= pet_limit THEN
    RAISE EXCEPTION 'Pet limit exceeded for your subscription plan (%). Limit: %', user_plan, pet_limit;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on pets table before insert
DROP TRIGGER IF EXISTS pet_limit_trigger ON pets;

CREATE TRIGGER pet_limit_trigger
BEFORE INSERT ON pets
FOR EACH ROW
EXECUTE FUNCTION enforce_pet_limit();
