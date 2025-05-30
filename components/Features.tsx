import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { File, Image, MapPin, MessageSquare, Bell, Settings } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Features = () => {
  const { t } = useLanguage();
  
  const features = [
    {
      icon: <File className="h-12 w-12 text-[#9b87f5]" />,
      key: 'profiles'
    },
    {
      icon: <Image className="h-12 w-12 text-[#9b87f5]" />,
      key: 'qr'
    },
    {
      icon: <MapPin className="h-12 w-12 text-[#9b87f5]" />,
      key: 'tracking'
    },
    {
      icon: <MessageSquare className="h-12 w-12 text-[#9b87f5]" />,
      key: 'community'
    },
    {
      icon: <Settings className="h-12 w-12 text-[#9b87f5]" />,
      key: 'tips'
    }
  ];

  return (
    <section className="py-16 px-6">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-[#9b87f5] to-[#7E69AB] bg-clip-text text-transparent inline-block">
            {t('features.title')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('features.subtitle')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3 text-[#7E69AB]">
                  {t(`features.${feature.key}.title`)}
                </h3>
                <p className="text-muted-foreground">
                  {t(`features.${feature.key}.description`)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
