import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import PetForm from '@/components/PetForm';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PetData {
  id: string;
  name: string;
  type: string;
  breed: string;
  birthday: string;
  image_url: string | null;
  owner_id: string;
}

const EditPet = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [petData, setPetData] = useState<PetData | null>(null);

  useEffect(() => {
    const fetchPet = async () => {
      try {
        if (!id) {
          navigate('/pets');
          return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/auth');
          return;
        }

        const { data, error } = await supabase
          .from('pets')
          .select('*')
          .eq('id', id)
          .eq('owner_id', user.id)
          .single();

        if (error) throw error;

        if (!data) {
          toast({
            title: "Pet not found",
            description: "The pet you're trying to edit doesn't exist or you don't have permission to edit it.",
            variant: "destructive"
          });
          navigate('/pets');
          return;
        }

        setPetData(data as PetData);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
        navigate('/pets');
      } finally {
        setLoading(false);
      }
    };

    fetchPet();
  }, [id, navigate, toast]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <LoadingSpinner size="lg" text="Loading pet details..." />
        </div>
      </Layout>
    );
  }

  if (!petData) {
    return null;
  }

  return (
    <Layout>
      <motion.div
        className="container mx-auto py-4 md:py-8 px-4 max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 md:h-12 md:w-12"
            onClick={() => navigate('/pets')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Edit Pet</h1>
            <p className="text-sm text-gray-500 mt-1">
              Editing {petData.name}
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-card rounded-lg shadow-sm p-4 md:p-6">
          <PetForm 
            initialData={petData}
            onSuccess={() => {
              toast({
                title: "Pet updated",
                description: "Your pet's information has been updated successfully."
              });
              navigate('/pets');
            }}
          />
        </div>
      </motion.div>
    </Layout>
  );
};

export default EditPet;
