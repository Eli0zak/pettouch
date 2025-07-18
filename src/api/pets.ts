import { supabase } from '@/integrations/supabase/client';

const PLAN_PET_LIMITS: Record<string, number> = {
  free: 1,
  premium: 5,
  pro: Infinity,
};

export async function addPet(petData: any) {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Fetch user's current subscription plan
    const { data: userData, error: userDataError } = await supabase
      .from('users')
      .select('plan')
      .eq('id', user.id)
      .single();

    if (userDataError || !userData) {
      throw new Error('Failed to fetch user subscription plan');
    }

    const userPlan = userData.plan || 'free';
    const petLimit = PLAN_PET_LIMITS[userPlan] ?? 1;

    // Count current pets of the user
    const { count: petCount, error: countError } = await supabase
      .from('pets')
      .select('id', { count: 'exact', head: true })
      .eq('owner_id', user.id);

    if (countError) {
      throw new Error('Failed to count user pets');
    }

    if ((petCount ?? 0) >= petLimit) {
      throw new Error(`Pet limit exceeded for your subscription plan (${userPlan})`);
    }

    // Insert new pet
    const { data: newPet, error: insertError } = await supabase
      .from('pets')
      .insert([{ ...petData, owner_id: user.id }])
      .select()
      .single();

    if (insertError) {
      throw new Error('Failed to add pet');
    }

    return newPet;
  } catch (error) {
    throw error;
  }
}
