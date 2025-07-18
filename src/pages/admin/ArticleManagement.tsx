import React, { useState } from 'react';
import ArticleList from '@/components/admin/articles/ArticleList';
import ArticleForm from '@/components/admin/articles/ArticleForm';
import { AdminArticle, ArticleFormData } from '@/types/admin';
import { createArticle, updateArticle } from '@/api/adminArticles';
import { toast } from '@/components/ui/use-toast';

function ArticleManagement(): JSX.Element {
  const [editingArticle, setEditingArticle] = useState<AdminArticle | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateClick = () => {
    setEditingArticle(null);
    setIsCreating(true);
  };

  const handleEditClick = (article: AdminArticle) => {
    setEditingArticle(article);
    setIsCreating(false);
  };

  const handleCancel = () => {
    setEditingArticle(null);
    setIsCreating(false);
  };

  const handleSubmit = async (data: ArticleFormData) => {
    try {
      if (editingArticle) {
        await updateArticle(editingArticle.id, data);
        toast({ title: 'Article updated successfully' });
      } else {
        await createArticle(data);
        toast({ title: 'Article created successfully' });
      }
      setEditingArticle(null);
      setIsCreating(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save article',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      {!editingArticle && !isCreating && (
        <ArticleList onEdit={handleEditClick} onCreate={handleCreateClick} />
      )}
      {(editingArticle || isCreating) && (
        <ArticleForm
          article={editingArticle || undefined}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}

export default ArticleManagement;
