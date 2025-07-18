import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { addPet } from '@/api/pets';
import UpgradePrompt from '@/components/UpgradePrompt';

const AddPet = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState('');
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [currentPlan, setCurrentPlan] = useState('free');
  const [maxPets, setMaxPets] = useState(1);

  const PLAN_PET_LIMITS: Record<string, number> = {
    free: 1,
    premium: 5,
    pro: Infinity,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await addPet({ name: petName, type: petType });
      toast({
        title: 'Success',
        description: 'Pet added successfully',
      });
      navigate('/dashboard/pets');
    } catch (error: any) {
      if (error.message.includes('Pet limit exceeded')) {
        // Extract plan name and limit from error message if possible
        setShowUpgradePrompt(true);
        // Optionally set currentPlan and maxPets based on error or user data
        // For demo, using free plan and 1 pet limit
        setCurrentPlan('free');
        setMaxPets(1);
      } else {
        toast({
          title: 'Error',
          description: error.message || 'Failed to add pet',
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-md">
      <h1 className="text-2xl font-bold mb-6">Add New Pet</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="petName" className="block mb-1 font-medium">
            Pet Name
          </label>
          <input
            id="petName"
            type="text"
            value={petName}
            onChange={(e) => setPetName(e.target.value)}
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="petType" className="block mb-1 font-medium">
            Pet Type
          </label>
          <input
            id="petType"
            type="text"
            value={petType}
            onChange={(e) => setPetType(e.target.value)}
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <button
          type="submit"
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark"
        >
          Add Pet
        </button>
      </form>

      {showUpgradePrompt && (
        <UpgradePrompt
          maxPets={maxPets}
          currentPlan={currentPlan}
          onClose={() => setShowUpgradePrompt(false)}
        />
      )}
    </div>
  );
};

export default AddPet;
