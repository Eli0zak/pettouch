import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import TipCard from '@/components/dashboard/TipCard';
import ReactPlayer from 'react-player';

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

const TipDetail = () => {
  const { articleId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    fetchArticle();
    loadSavedStatus();
  }, [articleId]);

  useEffect(() => {
    const awardPoints = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !article) return;

        const { data, error } = await supabase
          .rpc('award_article_points', {
            p_user_id: user.id,
            p_article_id: article.id,
            p_points: 10
          });

        if (error) throw error;

        if (data) {
          console.log('Successfully recorded article read and awarded points');
        }

      } catch (error) {
        console.error('Error awarding points:', error);
        toast({
          title: "Error",
          description: "Failed to record article read. Please try again.",
          variant: "destructive"
        });
      }
    };

    awardPoints();
  }, [article]);

  const fetchArticle = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', articleId)
        .single();

      if (error) throw error;
      
      setArticle(data);
      
      // Fetch related articles from same category
      if (data) {
        const { data: related, error: relatedError } = await supabase
          .from('articles')
          .select('*')
          .eq('category', data.category)
          .neq('id', data.id)
          .limit(3);

        if (relatedError) throw relatedError;
        setRelatedArticles(related || []);
      }
    } catch (error) {
      console.error('Error fetching article:', error);
      toast({
        title: "Error",
        description: "Failed to load article. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSavedStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_read_articles')
        .select('is_saved')
        .eq('user_id', user.id)
        .eq('article_id', articleId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setIsSaved(data?.is_saved || false);
    } catch (error) {
      console.error('Error loading saved status:', error);
    }
  };

  const handleSave = async () => {
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

      const { error } = await supabase
        .from('user_read_articles')
        .upsert({
          user_id: user.id,
          article_id: articleId,
          is_saved: !isSaved
        });

      if (error) throw error;
      
      setIsSaved(!isSaved);
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

  const handleShare = async () => {
    try {
      const shareUrl = window.location.href;
      await navigator.share({
        title: article?.title || 'Check out this pet care tip!',
        text: 'I found this helpful pet care tip on PetTouch',
        url: shareUrl,
      });
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Error sharing:', error);
      }
    }
  };

  const getReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };

  const getCTAContent = (category: string) => {
    const ctas = {
      'Health': {
        title: 'Ready to track your pet\'s health records?',
        description: 'Keep all your pet\'s medical information in one place.',
        buttonText: 'Go to Pet Profile',
        link: '/dashboard/pets'
      },
      'Training': {
        title: 'Want to connect with other pet owners?',
        description: 'Join our community and share training experiences.',
        buttonText: 'Join Community',
        link: '/dashboard/community'
      },
      'Nutrition': {
        title: 'Looking for quality pet food and supplies?',
        description: 'Browse our curated selection of pet products.',
        buttonText: 'Visit Store',
        link: '/store'
      },
      'default': {
        title: 'Want to give your pet the best care?',
        description: 'Set up your pet\'s profile for personalized care recommendations.',
        buttonText: 'Set Up Pet Profile',
        link: '/dashboard/pets'
      }
    };

    return ctas[category as keyof typeof ctas] || ctas.default;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Article not found</h1>
        <Button onClick={() => navigate('/dashboard/tips')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tips
        </Button>
      </div>
    );
  }

  const cta = getCTAContent(article.category);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back Button */}
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate('/dashboard/tips')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Tips
      </Button>

      {/* Video Player */}
      {article.video_url && (
        <div className="mb-8">
          <div className="aspect-video rounded-lg overflow-hidden bg-black">
            <ReactPlayer
              url={article.video_url}
              controls
              width="100%"
              height="100%"
              light={article.thumbnail_url}
            />
          </div>
        </div>
      )}

      {/* Article Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <span className="bg-pet-accent1/20 text-pet-primary text-sm px-3 py-1 rounded-full">
            {article.category}
          </span>
          <span className="text-gray-500 text-sm">
            {new Date(article.created_at).toLocaleDateString()} • {getReadTime(article.content)}
          </span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold mb-4">{article.title}</h1>

        {/* Actions Bar */}
        <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2"
            onClick={handleSave}
          >
            <Heart className={`h-5 w-5 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
            {isSaved ? 'Saved' : 'Save'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2"
            onClick={handleShare}
          >
            <Share2 className="h-5 w-5" />
            Share
          </Button>
        </div>
      </div>

      {/* Article Content */}
      <div 
        className="prose prose-lg max-w-none mb-12"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      {/* CTA Block */}
      <Card className="mb-12 bg-pet-accent1/10">
        <CardContent className="p-8">
          <h3 className="text-2xl font-bold mb-2">{cta.title}</h3>
          <p className="text-gray-600 mb-6">{cta.description}</p>
          <Button onClick={() => navigate(cta.link)}>
            {cta.buttonText}
          </Button>
        </CardContent>
      </Card>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedArticles.map((article) => (
              <TipCard
                key={article.id}
                id={article.id}
                title={article.title}
                description={article.content}
                category={article.category}
                thumbnailUrl={article.thumbnail_url}
                hasVideo={!!article.video_url}
                socialProofTags={article.social_proof_tags}
                isSaved={false}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TipDetail;
