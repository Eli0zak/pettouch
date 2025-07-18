import { supabase } from '@/integrations/supabase/client';
import { AdminArticle, ArticleFormData, ArticleFilters } from '@/types/admin';

// Helper function to check if user is admin
const isAdmin = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  
  const { data } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();
    
  return data?.role === 'admin';
};

// Fetch all articles with filters
export const fetchArticles = async (filters?: ArticleFilters) => {
  if (!await isAdmin()) {
    throw new Error('Unauthorized: Admin access required');
  }

  let query = supabase
    .from('articles')
    .select('*')
    .order('created_at', { ascending: false });

  // Apply filters
  if (filters) {
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    if (filters.isFeatured !== undefined) {
      query = query.eq('is_featured', filters.isFeatured);
    }
    if (filters.searchQuery) {
      query = query.or(`title.ilike.%${filters.searchQuery}%,content.ilike.%${filters.searchQuery}%`);
    }
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as AdminArticle[];
};

// Create new article
export const createArticle = async (articleData: ArticleFormData) => {
  if (!await isAdmin()) {
    throw new Error('Unauthorized: Admin access required');
  }
  
  const { data, error } = await supabase
    .from('articles')
    .insert({
      ...articleData,
    })
    .select()
    .single();

  if (error) throw error;
  return data as AdminArticle;
};

// Update existing article
export const updateArticle = async (id: string, articleData: Partial<ArticleFormData>) => {
  if (!await isAdmin()) {
    throw new Error('Unauthorized: Admin access required');
  }
  
  const { data, error } = await supabase
    .from('articles')
    .update({
      ...articleData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as AdminArticle;
};

// Delete article
export const deleteArticle = async (id: string) => {
  if (!await isAdmin()) {
    throw new Error('Unauthorized: Admin access required');
  }

  const { error } = await supabase
    .from('articles')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Get categories
export const getCategories = async () => {
  if (!await isAdmin()) {
    throw new Error('Unauthorized: Admin access required');
  }

  // Return predefined categories from schema
  return ['Nutrition', 'Grooming', 'Training', 'Health', 'Safety'];
};
