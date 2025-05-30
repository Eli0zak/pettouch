import React, { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, AlertCircle, Loader2, CreditCard, Shield, Tag, Bell } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import SubscriptionUpgradeForm from '@/components/SubscriptionUpgradeForm';
import { SubscriptionRequest } from '@/types';
import { logger } from '@/utils/logger';

const Subscription = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [currentPlan, setCurrentPlan] = useState<string>('free');
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string>('');
  const [pendingRequests, setPendingRequests] = useState<SubscriptionRequest[]>([]);
  const [showUpgradeForm, setShowUpgradeForm] = useState(false);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      
      // Check if session exists
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Session Error",
          description: "You must be logged in to access subscription features",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      setUserId(user.id);
      
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('plan')
        .eq('id', user.id)
        .single();
        
      if (userError) throw userError;
      
      setCurrentPlan(userData.plan || 'free');
      
      const { data: requestsData, error: requestsError } = await supabase
        .from('subscription_requests')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pending');
        
      if (requestsError) {
        logger.warn("Error fetching pending requests", { error: requestsError, userId: user.id });
      } else if (requestsData) {
        setPendingRequests(requestsData as unknown as SubscriptionRequest[]);
      }
    } catch (error) {
      logger.error('Error fetching subscription data', { error, userId });
      toast({
        title: 'Error',
        description: 'Failed to load your subscription details.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    
    const userChannel = supabase
      .channel('user-plan-changes')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'users',
        filter: `id=eq.${userId}` 
      }, (payload) => {
        if (payload.new && payload.new.plan !== currentPlan) {
          setCurrentPlan(payload.new.plan || 'free');
          toast({
            title: 'Subscription Updated',
            description: `Your subscription has been updated to ${payload.new.plan.charAt(0).toUpperCase() + payload.new.plan.slice(1)} Plan.`,
          });
        }
      })
      .subscribe();
      
    const requestsChannel = supabase
      .channel('subscription-requests-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'subscription_requests',
        filter: `user_id=eq.${userId}` 
      }, () => {
        fetchUserData();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(userChannel);
      supabase.removeChannel(requestsChannel);
    };
  }, [toast, userId]);

  const cancelUpgradeRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('subscription_requests')
        .delete()
        .eq('id', requestId);
        
      if (error) throw error;
      
      setPendingRequests(prevRequests => prevRequests.filter(req => req.id !== requestId));
      
      toast({
        title: 'Success',
        description: 'Your upgrade request has been cancelled.',
      });
    } catch (error) {
      logger.error('Error cancelling upgrade request', { error, requestId });
      toast({
        title: 'Error',
        description: 'Failed to cancel your upgrade request.',
        variant: 'destructive',
      });
    }
  };

  const getPlanDetails = (plan: string) => {
    switch (plan) {
      case 'free':
        return {
          name: 'Free Plan',
          icon: <Tag className="h-5 w-5" />,
          features: [
            'Manage 1 pet (name, type, breed, image)',
            'Register and activate 1 NFC tag',
            'Display pet profile via QR code',
            'Report lost pets with instant notifications',
            'Detailed NFC scan statistics',
            'Access to e-commerce store'
          ],
          price: 'Free',
          isCurrent: currentPlan === 'free'
        };
      case 'premium':
        return {
          name: 'Premium Plan',
          icon: <CreditCard className="h-5 w-5" />,
          features: [
            'Manage up to 5 pets',
            'Register up to 5 NFC tags per pet',
            'Add medical data with automated reminders',
            'Customize pet profile sharing',
            'Customize NFC tags (shapes & designs)',
            '5% discount on store purchases'
          ],
          pricing: {
            '3months': 'EGP 250 (~EGP 83/month)',
            '6months': 'EGP 450 (EGP 75/month, 10% off)',
            '1year': 'EGP 800 (EGP 67/month, 20% off)',
            'lifetime': 'EGP 5,000 (one-time)'
          },
          isCurrent: currentPlan === 'premium'
        };
      case 'pro':
        return {
          name: 'Pro Plan',
          icon: <Shield className="h-5 w-5" />,
          features: [
            'Manage unlimited pets',
            'Register unlimited NFC tags',
            'Add detailed medical notes',
            'Advanced NFC tag customization',
            '10% discount on store purchases',
            'Priority support (24-hour response)'
          ],
          pricing: {
            '3months': 'EGP 500 (~EGP 167/month)',
            '6months': 'EGP 900 (EGP 150/month, 10% off)',
            '1year': 'EGP 1,600 (EGP 133/month, 20% off)',
            'lifetime': 'EGP 10,000 (one-time)'
          },
          isCurrent: currentPlan === 'pro'
        };
      default:
        return {
          name: 'Unknown Plan',
          icon: <Bell className="h-5 w-5" />,
          features: [],
          price: '-',
          isCurrent: false
        };
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">{t('dashboard.subscription')}</h1>
        
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {['free', 'premium', 'pro'].map((plan) => {
              const planDetails = getPlanDetails(plan);
              return (
                <Card key={plan} className={`relative ${planDetails.isCurrent ? 'border-primary' : ''}`}>
                  {planDetails.isCurrent && (
                    <Badge className="absolute top-4 right-4" variant="outline">
                      Current Plan
                    </Badge>
                  )}
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      {planDetails.icon}
                      <CardTitle>{planDetails.name}</CardTitle>
                    </div>
                    <CardDescription>
                      {plan === 'free' ? (
                        'Start your PetTouch journey!'
                      ) : plan === 'premium' ? (
                        'Perfect for multi-pet owners'
                      ) : (
                        'Ideal for breeders & businesses'
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {planDetails.price && (
                      <div className="text-2xl font-bold">{planDetails.price}</div>
                    )}
                    {planDetails.pricing && (
                      <div className="space-y-2">
                        {Object.entries(planDetails.pricing).map(([duration, price]) => (
                          <div key={duration} className="text-sm">
                            <span className="font-medium">{price}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <ul className="space-y-2">
                      {planDetails.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-green-500 shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    {!planDetails.isCurrent && plan !== 'free' && (
                      <Button
                        className="w-full"
                        onClick={() => setShowUpgradeForm(true)}
                        disabled={pendingRequests.length > 0}
                      >
                        Upgrade to {planDetails.name}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}

        {pendingRequests.length > 0 && (
          <Card className="bg-muted">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Pending Upgrade Request
              </CardTitle>
            </CardHeader>
            <CardContent>
              You have a subscription upgrade request that is currently being reviewed by our team.
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => cancelUpgradeRequest(pendingRequests[0].id)}
              >
                Cancel Request
              </Button>
            </CardContent>
          </Card>
        )}

        {showUpgradeForm && (
          <Card>
            <CardHeader>
              <CardTitle>Upgrade Your Plan</CardTitle>
              <CardDescription>
                Choose your new plan and complete the payment process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SubscriptionUpgradeForm
                currentPlan={currentPlan}
                userId={userId}
                onSuccess={() => {
                  setShowUpgradeForm(false);
                  fetchUserData();
                }}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Subscription;
