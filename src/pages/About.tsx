import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

const About = () => {
  const { t } = useLanguage();
  
  return (
    <div className="container mx-auto py-12 px-6">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">
          {t('about.title')} <span className="text-pet-primary">{t('app.name')}</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {t('about.mission')}
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        <div>
          <img 
            src="https://images.unsplash.com/photo-1721322800607-8c38375eef04" 
            alt={t('about.imageAlt')} 
            className="rounded-xl shadow-lg w-full h-auto object-cover"
          />
        </div>
        <div className="flex flex-col justify-center">
          <h2 className="text-2xl font-bold mb-4 text-pet-secondary">
            {t('about.story.title')}
          </h2>
          <p className="mb-4 text-muted-foreground">
            {t('about.story.p1')}
          </p>
          <p className="mb-4 text-muted-foreground">
            {t('about.story.p2')}
          </p>
        </div>
      </div>
      
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-8 text-center text-pet-secondary">
          {t('about.values.title')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="hover-scale">
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-2 text-pet-primary">
                {t('about.values.welfare')}
              </h3>
              <p className="text-muted-foreground">
                {t('about.values.welfare.desc')}
              </p>
            </CardContent>
          </Card>
          
          <Card className="hover-scale">
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-2 text-pet-primary">
                {t('about.values.community')}
              </h3>
              <p className="text-muted-foreground">
                {t('about.values.community.desc')}
              </p>
            </CardContent>
          </Card>
          
          <Card className="hover-scale">
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-2 text-pet-primary">
                {t('about.values.innovation')}
              </h3>
              <p className="text-muted-foreground">
                {t('about.values.innovation.desc')}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4 text-pet-secondary">
          {t('about.join')}
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
          {t('about.join.desc')}
        </p>
      </div>
    </div>
  );
};

export default About;
