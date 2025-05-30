import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings as SettingsIcon, User, Lock, Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const Settings = () => {
  const { toast } = useToast();
  const { language, setLanguage, t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'ar'>(language);
  
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // In a real implementation, we would update the user's profile in Supabase here
      toast({
        title: t("success"),
        description: t("profileUpdated"),
      });
    } catch (error: any) {
      toast({
        title: t("error"),
        description: error.message || t("failedUpdate"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: t("error"),
        description: t("passwordMismatch"),
        variant: "destructive",
      });
      setLoading(false);
      return;
    }
    
    try {
      // In a real implementation, we would update the password in Supabase auth here
      toast({
        title: t("success"),
        description: t("passwordUpdated"),
      });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      toast({
        title: t("error"),
        description: error.message || t("failedPasswordUpdate"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = () => {
    setLanguage(selectedLanguage);
    toast({
      title: t("success"),
      description: t("languageUpdated"),
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t("settings.title")}</h1>
        <p className="text-gray-600">{t("settings.manage")}</p>
      </div>
      
      <Tabs defaultValue="profile" className="mb-8">
        <TabsList className="mb-6">
          <TabsTrigger value="profile" className="flex items-center">
            <User className="h-4 w-4 mr-2" />
            {t("settings.profile")}
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center">
            <Lock className="h-4 w-4 mr-2" />
            {t("settings.security")}
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center">
            <Globe className="h-4 w-4 mr-2" />
            {t("settings.preferences")}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.profileInfo")}</CardTitle>
              <CardDescription>{t("settings.updatePersonalInfo")}</CardDescription>
            </CardHeader>
            <form onSubmit={handleProfileUpdate}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">{t("settings.firstName")}</Label>
                    <Input 
                      id="firstName" 
                      value={profileData.firstName} 
                      onChange={e => setProfileData({...profileData, firstName: e.target.value})} 
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">{t("settings.lastName")}</Label>
                    <Input 
                      id="lastName" 
                      value={profileData.lastName} 
                      onChange={e => setProfileData({...profileData, lastName: e.target.value})} 
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t("settings.email")}</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={profileData.email} 
                    onChange={e => setProfileData({...profileData, email: e.target.value})} 
                    placeholder="johndoe@example.com" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t("settings.phone")}</Label>
                  <Input 
                    id="phone" 
                    value={profileData.phone} 
                    onChange={e => setProfileData({...profileData, phone: e.target.value})} 
                    placeholder="+1 (555) 123-4567" 
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={loading}>
                  {loading ? t("settings.saving") : t("settings.saveChanges")}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.passwordSection")}</CardTitle>
              <CardDescription>{t("settings.updatePasswordDesc")}</CardDescription>
            </CardHeader>
            <form onSubmit={handlePasswordChange}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">{t("settings.currentPassword")}</Label>
                  <Input 
                    id="currentPassword" 
                    type="password" 
                    value={passwordData.currentPassword} 
                    onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">{t("settings.newPassword")}</Label>
                  <Input 
                    id="newPassword" 
                    type="password" 
                    value={passwordData.newPassword} 
                    onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t("settings.confirmPassword")}</Label>
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    value={passwordData.confirmPassword} 
                    onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})} 
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={loading}>
                  {loading ? t("settings.updating") : t("settings.updatePasswordButton")}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.languagePreferences")}</CardTitle>
              <CardDescription>{t("settings.manageLanguage")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label>{t("settings.selectLanguage")}</Label>
                <RadioGroup value={selectedLanguage} onValueChange={(value) => setSelectedLanguage(value as 'en' | 'ar')}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="en" id="en" />
                    <Label htmlFor="en">{t("settings.english")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ar" id="ar" />
                    <Label htmlFor="ar">{t("settings.arabic")}</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleLanguageChange} 
                disabled={selectedLanguage === language}
              >
                {t("settings.applyLanguage")}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
