export type ArticleCategory = 'Nutrition' | 'Grooming' | 'Training' | 'Health' | 'Safety';

export interface Article {
  id: string;
  title: string;
  content: string;
  category: ArticleCategory;
  video_url: string | null;
  thumbnail_url: string | null;
  is_featured: boolean;
  social_proof_tags: string[];
  created_at: string;
  updated_at: string;
}

export interface AdminArticle extends Article {}

export interface ArticleFilters {
  category?: ArticleCategory;
  searchQuery?: string;
  isFeatured?: boolean;
}

export interface ArticleFormData {
  title: string;
  content: string;
  category: ArticleCategory;
  video_url?: string | null;
  thumbnail_url?: string | null;
  is_featured?: boolean;
  social_proof_tags?: string[];
}

export interface ArticleSortConfig {
  column: keyof AdminArticle;
  direction: 'asc' | 'desc';
}
