import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface LostFoundInteractionModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  postTitle: string;
  interactionType: 'found' | 'know';
  onSuccess?: () => void;
}

export const LostFoundInteractionModal: React.FC<LostFoundInteractionModalProps> = ({
  isOpen,
  onClose,
  postId,
  postTitle,
  interactionType,
  onSuccess
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      // Get current user if logged in
      const { data: { user } } = await supabase.auth.getUser();
      
      // Create interaction record
      const { error } = await supabase
        .from('lost_found_interactions')
        .insert({
          post_id: postId,
          interaction_type: interactionType,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
          user_id: user?.id || null
        });

      if (error) throw error;

      // Notify original reporter
      const { data: postData, error: postError } = await supabase
        .from('lost_found_posts')
        .select('user_id, title')
        .eq('id', postId)
        .single();

      if (!postError && postData?.user_id) {
        await supabase
          .from('notifications')
          .insert({
            user_id: postData.user_id,
            title: `New interaction on your post: ${postData.title}`,
            message: `${formData.name} has interacted with your lost/found pet report.`,
            link: `/community-reports#post-${postId}`,
            read: false,
            created_at: new Date().toISOString()
          });
      }

      toast({
        title: "Interaction Submitted",
        description: "Your message has been sent to the reporter. They will contact you soon.",
      });

      // Reset form and close modal
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: ''
      });
      onClose();
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error submitting interaction:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit your interaction",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {interactionType === 'found' ? 'I Found This Pet' : 'I Know This Pet'}
          </DialogTitle>
          <DialogDescription>
            {interactionType === 'found'
              ? 'Please provide your contact information and any details about finding the pet.'
              : 'Please provide your contact information and any information you have about the pet.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Your Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter your phone number (optional)"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder={interactionType === 'found'
                ? 'Please provide details about where and when you found the pet, and its current condition.'
                : 'Please provide any information you have about this pet or its possible whereabouts.'
              }
              required
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleSubmit}
            disabled={!formData.name || !formData.email || !formData.message}
          >
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
