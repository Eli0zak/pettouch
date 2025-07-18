import React, { useState } from 'react';
import { AdminArticle, ArticleFormData, ArticleCategory } from '@/types/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface ArticleFormProps {
  article?: AdminArticle;
  onSubmit: (data: ArticleFormData) => Promise<void>;
  onCancel: () => void;
}

const CATEGORIES: ArticleCategory[] = ['Nutrition', 'Grooming', 'Training', 'Health', 'Safety'];

const ArticleForm: React.FC<ArticleFormProps> = ({
  article,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<ArticleFormData>({
    title: article?.title || '',
    content: article?.content || '',
    category: article?.category || 'Nutrition',
    is_featured: article?.is_featured || false,
    video_url: article?.video_url || null,
    thumbnail_url: article?.thumbnail_url || null,
    social_proof_tags: article?.social_proof_tags || [],
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <div className="flex gap-6">
        {/* Left Column - Main Content */}
        <div className="flex-1 space-y-4">
          <div>
            <Label htmlFor="title">Article Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter article title"
              required
            />
          </div>

          <div>
            <Label htmlFor="content">Content</Label>
            <textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full min-h-[400px] p-2 rounded-md border border-input bg-background"
              placeholder="Write your article content here..."
              required
            />
          </div>

          <div>
            <Label htmlFor="video_url">Video URL (Optional)</Label>
            <Input
              id="video_url"
              type="url"
              value={formData.video_url || ''}
              onChange={(e) => setFormData({ ...formData, video_url: e.target.value || null })}
              placeholder="Enter video URL"
            />
          </div>

          <div>
            <Label htmlFor="thumbnail_url">Thumbnail URL (Optional)</Label>
            <Input
              id="thumbnail_url"
              type="url"
              value={formData.thumbnail_url || ''}
              onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value || null })}
              placeholder="Enter thumbnail URL"
            />
          </div>
        </div>

        {/* Right Column - Settings */}
        <div className="w-80 space-y-6">
          <div className="rounded-lg border p-4">
            <h3 className="font-medium mb-4">Article Settings</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as ArticleCategory })}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                  required
                >
                  {CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="is_featured">Featured Article</Label>
                <Switch
                  id="is_featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                />
              </div>

              <div>
                <Label htmlFor="social_proof_tags">Social Proof Tags (comma-separated)</Label>
                <Input
                  id="social_proof_tags"
                  value={formData.social_proof_tags?.join(', ') || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    social_proof_tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                  })}
                  placeholder="Enter tags separated by commas"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : article ? 'Update Article' : 'Create Article'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default ArticleForm;
