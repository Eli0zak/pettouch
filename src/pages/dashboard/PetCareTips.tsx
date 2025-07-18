
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { BookOpen, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import TipCard from '@/components/dashboard/TipCard';
import { toast } from '@/components/ui/use-toast';

interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  video_url: string | null;
  thumbnail_url: string;
  social_proof_tags: string[];
  created_at: string;
}

const PetCareTips = () => {
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [savedArticles, setSavedArticles] = useState<Set<string>>(new Set());

  const tipCategories = [
    "Nutrition", "Grooming", "Training", "Health", "Safety"
  ];

  useEffect(() => {
    fetchArticles();
    loadSavedArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast({
        title: "Error",
        description: "Failed to load articles. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSavedArticles = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_read_articles')
        .select('article_id')
        .eq('user_id', user.id)
        .eq('is_saved', true);

      if (error) throw error;
      setSavedArticles(new Set(data?.map(item => item.article_id)));
    } catch (error) {
      console.error('Error loading saved articles:', error);
    }
  };

  const handleSaveArticle = async (articleId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to save articles.",
          variant: "destructive"
        });
        return;
      }

      const isSaved = savedArticles.has(articleId);
      const newSavedArticles = new Set(savedArticles);

      if (isSaved) {
        newSavedArticles.delete(articleId);
      } else {
        newSavedArticles.add(articleId);
      }

      const { error } = await supabase
        .from('user_read_articles')
        .upsert({
          user_id: user.id,
          article_id: articleId,
          is_saved: !isSaved
        });

      if (error) throw error;
      setSavedArticles(newSavedArticles);

      toast({
        title: isSaved ? "Removed from Saved" : "Saved Successfully",
        description: isSaved ? "Article removed from your saved items." : "Article saved for later reading.",
      });
    } catch (error) {
      console.error('Error saving article:', error);
      toast({
        title: "Error",
        description: "Failed to save article. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleShare = async (articleId: string) => {
    try {
      const shareUrl = `${window.location.origin}/dashboard/tips/${articleId}`;
      await navigator.share({
        title: 'Check out this pet care tip!',
        text: 'I found this helpful pet care tip on PetTouch',
        url: shareUrl,
      });
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Error sharing:', error);
      }
    }
  };

  const filteredArticles = articles.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Pet Care Tips</h1>
        <p className="text-gray-600">Expert advice for keeping your pets happy and healthy</p>
      </div>
      
      {/* Search and Filter Section */}
      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="text"
            placeholder="Search tips..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === 'all' ? "default" : "outline"}
            className="rounded-full"
            onClick={() => setSelectedCategory('all')}
          >
            All
          </Button>
          {tipCategories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              className="rounded-full"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      {filteredArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <TipCard
              key={article.id}
              id={article.id}
              title={article.title}
              description={article.content}
              category={article.category}
              thumbnailUrl={article.thumbnail_url}
              hasVideo={!!article.video_url}
              socialProofTags={article.social_proof_tags}
              isSaved={savedArticles.has(article.id)}
              onSave={() => handleSaveArticle(article.id)}
              onShare={() => handleShare(article.id)}
            />
          ))}
        </div>
      ) : (
        <Card className="mb-8">
          <CardContent className="text-center py-8">
            <BookOpen className="mx-auto h-10 w-10 mb-4 text-gray-400" />
            <p className="text-gray-500">No tips available at the moment.</p>
            <p className="text-gray-500 mt-2">Check back soon for helpful pet care advice!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PetCareTips;
