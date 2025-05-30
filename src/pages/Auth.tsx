import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import Layout from '@/components/Layout';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Check if user is already logged in and redirect
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate('/dashboard');
      }
    };
    checkUser();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isLogin) {
        // Handle login
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        toast({
          title: t('common.success'),
          description: t('auth.loginSuccess'),
        });
        navigate('/dashboard');
      } else {
        // Handle registration
        if (!firstName || !lastName || !phone) {
          throw new Error(t('form.required'));
        }
        
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              phone: phone
            }
          }
        });
        
        if (error) throw error;
        
        toast({
          title: t('common.success'),
          description: t('auth.signupSuccess'),
        });
      }
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message || t('common.error'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-16 px-4">
        <div className="max-w-md mx-auto bg-card rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-[#9b87f5] to-[#7E69AB] bg-clip-text text-transparent inline-block w-full">
            {isLogin ? t('auth.login') : t('auth.createAccount')}
          </h1>
          
          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">{t('settings.email')}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('placeholder.email')}
                required
              />
            </div>
            
            {!isLogin && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">{t('settings.firstName')}</Label>
                    <Input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder={t('placeholder.firstName')}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">{t('settings.lastName')}</Label>
                    <Input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder={t('placeholder.lastName')}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">{t('settings.phone')}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t('placeholder.phone')}
                    required
                  />
                </div>
              </>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="password">{t('settings.newPassword')}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('placeholder.password')}
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className={cn(
                "w-full relative group overflow-hidden",
                loading ? "opacity-80" : ""
              )}
              style={{ 
                background: "#9b87f5",
                color: "white"
              }}
              disabled={loading}
            >
              <span className="relative z-10">
                {loading ? t('auth.processing') : isLogin ? t('auth.login') : t('auth.signup')}
              </span>
              <div 
                className="absolute inset-0 bg-gradient-to-r from-[#9b87f5] to-[#7E69AB] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <button 
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-[#9b87f5] hover:text-[#7E69AB] hover:underline transition-colors"
            >
              {isLogin ? t('auth.noAccount') : t('auth.alreadyHaveAccount')}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Auth;
