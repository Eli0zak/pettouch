import React, { useEffect, useState, useMemo } from 'react';
import { AdminArticle, ArticleFilters, ArticleSortConfig, ArticleCategory } from '@/types/admin';
import { fetchArticles, deleteArticle } from '@/api/adminArticles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { Table, THead, TBody, Tr, Th, Td } from '@/components/ui/table';
import { Edit, Trash2 } from 'lucide-react';

interface ArticleListProps {
  onEdit: (article: AdminArticle) => void;
  onCreate: () => void;
}

const ArticleList: React.FC<ArticleListProps> = ({ onEdit, onCreate }) => {
  const [articles, setArticles] = useState<AdminArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ArticleCategory | undefined>(undefined);
  const [sortConfig, setSortConfig] = useState<ArticleSortConfig>({
    column: 'created_at',
    direction: 'desc',
  });

  const [categories, setCategories] = useState<ArticleCategory[]>([]);

  const loadArticles = async () => {
    setLoading(true);
    try {
      const filters: ArticleFilters = {};
      if (categoryFilter) filters.category = categoryFilter;
      if (searchQuery) filters.searchQuery = searchQuery;

      const data = await fetchArticles(filters);
      setArticles(data);

      // Extract unique categories
      const uniqueCategories = Array.from(new Set(data.map(a => a.category))).sort() as ArticleCategory[];
      setCategories(uniqueCategories);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load articles.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, [searchQuery, categoryFilter]);

  const sortedArticles = useMemo(() => {
    const sorted = [...articles];
    sorted.sort((a, b) => {
      const aValue = a[sortConfig.column];
      const bValue = b[sortConfig.column];
      
      // Handle different types of values
      if (['created_at', 'updated_at'].includes(sortConfig.column)) {
        // Date comparison
        return sortConfig.direction === 'asc'
          ? new Date(aValue as string).getTime() - new Date(bValue as string).getTime()
          : new Date(bValue as string).getTime() - new Date(aValue as string).getTime();
      } else if (typeof aValue === 'boolean') {
        // Boolean comparison
        return sortConfig.direction === 'asc'
          ? (aValue === bValue ? 0 : aValue ? 1 : -1)
          : (aValue === bValue ? 0 : aValue ? -1 : 1);
      } else {
        // String comparison (default)
        const aString = String(aValue || '');
        const bString = String(bValue || '');
        return sortConfig.direction === 'asc'
          ? aString.localeCompare(bString)
          : bString.localeCompare(aString);
      }
    });
    return sorted;
  }, [articles, sortConfig]);

  const handleSort = (column: keyof AdminArticle) => {
    if (sortConfig.column === column) {
      setSortConfig({
        column,
        direction: sortConfig.direction === 'asc' ? 'desc' : 'asc',
      });
    } else {
      setSortConfig({ column, direction: 'asc' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;
    try {
      await deleteArticle(id);
      toast({
        title: 'Deleted',
        description: 'Article deleted successfully.',
      });
      loadArticles();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete article.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Admin Article Management</h2>
        <Button onClick={onCreate} variant="default">+ Create New Article</Button>
      </div>

      <div className="flex gap-4 mb-4">
        <Input
          placeholder="Search by title..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="flex-grow"
        />
        <select
          className="h-10 w-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          value={categoryFilter || ''}
          onChange={e => setCategoryFilter(e.target.value as ArticleCategory || undefined)}
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="rounded-md border">
        <Table>
          <THead>
            <Tr>
              <Th onClick={() => handleSort('title')} className="cursor-pointer">Article Title</Th>
              <Th onClick={() => handleSort('category')} className="cursor-pointer">Category</Th>
              <Th onClick={() => handleSort('is_featured')} className="cursor-pointer">Featured</Th>
              <Th onClick={() => handleSort('created_at')} className="cursor-pointer">Created Date</Th>
              <Th>Actions</Th>
            </Tr>
          </THead>
          <TBody>
            {loading ? (
              <Tr>
                <Td colSpan={5} className="text-center py-4">Loading...</Td>
              </Tr>
            ) : sortedArticles.length === 0 ? (
              <Tr>
                <Td colSpan={5} className="text-center py-4">No articles found.</Td>
              </Tr>
            ) : (
              sortedArticles.map(article => (
                <Tr key={article.id}>
                  <Td>{article.title}</Td>
                  <Td>{article.category}</Td>
                  <Td>{article.is_featured ? '⭐' : '-'}</Td>
                  <Td>{new Date(article.created_at).toLocaleDateString()}</Td>
                  <Td className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => onEdit(article)}>
                      <Edit className="w-4 h-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(article.id)}>
                      <Trash2 className="w-4 h-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </Td>
                </Tr>
              ))
            )}
          </TBody>
        </Table>
      </div>
    </div>
  );
};

export default ArticleList;
