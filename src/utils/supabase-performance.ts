import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export const queryWithPerformance = async <T>(
  queryName: string,
  queryFn: () => Promise<T>
): Promise<T> => {
  const startTime = performance.now();
  try {
    const result = await queryFn();
    const duration = performance.now() - startTime;
    logger.info(`Query: ${queryName}`, { duration });
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    logger.error(`Query failed: ${queryName}`, { duration, error });
    throw error;
  }
};

// Helper functions for common Supabase queries with performance tracking
export const performanceWrappedQueries = {
  async fetchUserData(userId: string) {
    return queryWithPerformance('fetchUserData', async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data;
    });
  },

  async fetchPetsWithImages(userId: string) {
    return queryWithPerformance('fetchPetsWithImages', async () => {
      const { data, error } = await supabase
        .from('pets')
        .select(`
          *,
          pet_images (
            id,
            image_url,
            is_primary
          )
        `)
        .eq('owner_id', userId);
      
      if (error) throw error;
      return data;
    });
  },

  async fetchProductsWithFilters(filters: any) {
    return queryWithPerformance('fetchProductsWithFilters', async () => {
      let query = supabase.from('store_products').select('*');
      
      if (filters.category) {
        query = query.eq('category_id', filters.category);
      }
      
      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }
      
      if (filters.minPrice) {
        query = query.gte('price', filters.minPrice);
      }
      
      if (filters.maxPrice) {
        query = query.lte('price', filters.maxPrice);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    });
  }
};
