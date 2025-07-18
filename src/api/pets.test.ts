import { addPet } from './pets';
import { supabase } from '@/integrations/supabase/client';

describe('addPet function', () => {
  const testUserId = 'test-user-uuid';

  beforeAll(async () => {
    // Setup: create test user with free plan
    await supabase.from('users').upsert({
      id: testUserId,
      email: 'testuser@example.com',
      first_name: 'Test',
      last_name: 'User',
      plan: 'free',
    });
    // Delete existing pets for test user
    await supabase.from('pets').delete().eq('owner_id', testUserId);
  });

  afterAll(async () => {
    // Cleanup: delete test user and pets
    await supabase.from('pets').delete().eq('owner_id', testUserId);
    await supabase.from('users').delete().eq('id', testUserId);
  });

  test('should add a pet if under limit', async () => {
    const petData = {
      name: 'Test Pet 1',
      type: 'dog',
    };
    const newPet = await addPet(petData);
    expect(newPet).toHaveProperty('id');
    expect(newPet.name).toBe(petData.name);
  });

  test('should reject adding pet if limit exceeded', async () => {
    // Add pet to reach limit
    await addPet({ name: 'Test Pet 2', type: 'cat' });

    // Attempt to add another pet exceeding free plan limit (1)
    await expect(addPet({ name: 'Test Pet 3', type: 'bird' })).rejects.toThrow(
      /Pet limit exceeded/
    );
  });
});
