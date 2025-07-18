import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tags } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { logger } from '@/utils/logger';

const MyTagsCard = ({ onManageTags }: { onManageTags: () => void }) => {
  const [activeTagsCount, setActiveTagsCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchActiveTagsCount = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setError('User not logged in');
        setActiveTagsCount(0);
        setLoading(false);
        return;
      }

      const { count, error } = await supabase
        .from('nfc_tags')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id)
        .eq('is_active', true);

      if (error) {
        throw error;
      }

      setActiveTagsCount(count || 0);
      setError(null);
    } catch (err) {
      logger.error('Error fetching active NFC tags count', { error: err });
      setError('Failed to load active tags count');
      setActiveTagsCount(0);
      toast({
        title: 'Error',
        description: 'Failed to load active NFC tags count',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveTagsCount();
  }, []);

  return (
    <div className="rounded-lg p-6 bg-gradient-to-br from-primary/5 to-transparent border border-primary/10 hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center">
          <Tags className="mr-2 w-6 h-6 text-primary" />
          My NFC Tags
        </h2>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          activeTagsCount > 0 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
        }`}>
          {loading ? 'Loading...' : `${activeTagsCount} Active`}
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-muted-foreground">
          {loading ? (
            'Loading tags...'
          ) : error ? (
            'Error loading tags'
          ) : activeTagsCount === 0 ? (
            "No active tags. Add your first NFC tag to get started!"
          ) : (
            `You have ${activeTagsCount} active tag${activeTagsCount !== 1 ? 's' : ''} linked to your pets.`
          )}
        </p>

        <Button 
          variant="outline" 
          onClick={onManageTags}
          className="w-full justify-center hover:bg-primary/5 transition-colors"
          disabled={loading}
        >
          {activeTagsCount === 0 ? 'Add Your First Tag' : 'Manage Tags'}
        </Button>
      </div>
    </div>
  );
};

export default MyTagsCard;
