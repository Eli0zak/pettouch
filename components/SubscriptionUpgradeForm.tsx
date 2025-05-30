import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Loader2 } from 'lucide-react';

interface SubscriptionUpgradeFormProps {
  currentPlan: string;
  userId: string;
  onSuccess?: () => void;
}

const SubscriptionUpgradeForm: React.FC<SubscriptionUpgradeFormProps> = ({
  currentPlan,
  userId,
  onSuccess
}) => {
  const [requestedPlan, setRequestedPlan] = useState<string>('premium');
  const [duration, setDuration] = useState<string>('3months');
  const [paymentMethod, setPaymentMethod] = useState<string>('instapay');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [transactionProofUrl, setTransactionProofUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { toast } = useToast();

  const planPricing = {
    premium: {
      '3months': 'EGP 250',
      '6months': 'EGP 450',
      '1year': 'EGP 800',
      'lifetime': 'EGP 5,000'
    },
    pro: {
      '3months': 'EGP 500',
      '6months': 'EGP 900',
      '1year': 'EGP 1,600',
      'lifetime': 'EGP 10,000'
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Check authentication first
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to submit a subscription request",
        variant: "destructive"
      });
      return;
    }

    if (!phoneNumber) {
      toast({
        title: "Validation Error",
        description: "Phone number is required for payment verification",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Insert the subscription request with proper status field
      // Store duration and amount in the notes field since they're not in the schema
      const amountValue = planPricing[requestedPlan as keyof typeof planPricing][duration as keyof typeof planPricing['premium']];
      const formattedNotes = `Duration: ${duration}, Amount: ${amountValue}${notes ? `, Notes: ${notes}` : ''}`;
      
      const { error, data } = await supabase
        .from('subscription_requests')
        .insert({
          user_id: userId,
          current_plan: currentPlan,
          requested_plan: requestedPlan,
          payment_method: paymentMethod,
          phone_number: phoneNumber,
          notes: formattedNotes,
          transaction_proof_url: transactionProofUrl || null,
          status: 'pending'
        })
        .select();
        
      if (error) {
        // Add more detailed error handling
        if (error.code === '42501') {
          throw new Error('Permission denied. Please make sure you are logged in and have permission to create subscription requests.');
        } else {
          throw new Error(`Database error: ${error.message}`);
        }
      }

      console.log('Subscription request submitted:', data);
      
      toast({
        title: "Request Submitted",
        description: "Your subscription upgrade request has been submitted. Our team will review it shortly.",
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error: any) {
      console.error('Error submitting subscription request:', error);
      toast({
        title: "Error",
        description: `Failed to submit request: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) {
        toast({
          title: "Error",
          description: "Please select a file to upload",
          variant: "destructive"
        });
        return;
      }
      
      const file = e.target.files[0];
      const maxSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      
      if (file.size > maxSize) {
        toast({
          title: "Error",
          description: "File size must be less than 5MB",
          variant: "destructive"
        });
        return;
      }
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Error",
          description: "Only JPG, PNG and PDF files are allowed",
          variant: "destructive"
        });
        return;
      }
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `upgrade-proofs/${fileName}`;
      
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('subscription-uploads')
        .upload(filePath, file);
      
      if (uploadError) {
        throw new Error(uploadError.message || 'Error uploading file');
      }
      
      if (!uploadData) {
        throw new Error('Upload successful but no data returned');
      }
      
      const { data: urlData, error: urlError } = await supabase.storage
        .from('subscription-uploads')
        .getPublicUrl(filePath);
      
      if (urlError || !urlData) {
        throw new Error('Failed to get public URL for uploaded file');
      }
      
      setTransactionProofUrl(urlData.publicUrl);
      
      toast({
        title: "Success",
        description: "Payment proof uploaded successfully",
      });
      
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to upload file',
        variant: "destructive"
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Select New Plan</Label>
          <RadioGroup 
            value={requestedPlan}
            onValueChange={setRequestedPlan}
            className="grid gap-4 pt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="premium" id="premium" />
              <Label htmlFor="premium">Premium Plan</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pro" id="pro" />
              <Label htmlFor="pro">Pro Plan</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label>Subscription Duration</Label>
          <Select value={duration} onValueChange={setDuration}>
            <SelectTrigger>
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">3 Months</SelectItem>
              <SelectItem value="6months">6 Months (10% off)</SelectItem>
              <SelectItem value="1year">1 Year (20% off)</SelectItem>
              <SelectItem value="lifetime">Lifetime</SelectItem>
            </SelectContent>
          </Select>
          <div className="text-sm font-medium text-primary mt-2">
            Price: {planPricing[requestedPlan as keyof typeof planPricing][duration as keyof typeof planPricing['premium']]}
          </div>
        </div>

        <Card className="bg-muted">
          <CardContent className="pt-6">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="space-y-1 text-sm">
                <p className="font-medium">Payment Instructions</p>
                <p className="text-muted-foreground">
                  Please complete the payment using one of the methods below and upload the proof of payment to proceed.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-2">
          <Label>Payment Method</Label>
          <RadioGroup 
            value={paymentMethod}
            onValueChange={setPaymentMethod}
            className="grid gap-4 pt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="instapay" id="instapay" />
              <Label htmlFor="instapay">InstaPay</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="vodafone" id="vodafone" />
              <Label htmlFor="vodafone">Vodafone Cash</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="orange" id="orange" />
              <Label htmlFor="orange">Orange Money</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="etisalat" id="etisalat" />
              <Label htmlFor="etisalat">Etisalat Flous</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="wepay" id="wepay" />
              <Label htmlFor="wepay">WePay</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone_number">Phone Number *</Label>
          <Input
            id="phone_number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Enter your phone number for payment verification"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="transaction_proof">Payment Proof *</Label>
          <Input
            id="transaction_proof"
            type="file"
            onChange={handleFileUpload}
            accept="image/png, image/jpeg, application/pdf"
            required
          />
          {transactionProofUrl && (
            <div className="text-sm text-green-600">Payment proof uploaded successfully</div>
          )}
          <p className="text-xs text-muted-foreground">
            Please upload a clear screenshot showing the transaction details (ID, date, amount)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Additional Notes (Optional)</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional information about your subscription request"
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting || !transactionProofUrl}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          'Submit Upgrade Request'
        )}
      </Button>
    </form>
  );
};

export default SubscriptionUpgradeForm;
