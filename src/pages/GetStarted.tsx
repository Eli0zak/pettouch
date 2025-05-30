import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Shield, Zap, Star } from 'lucide-react';

const GetStarted = () => {
  const { t } = useLanguage();

  const plans = [
    {
      key: 'basic',
      icon: <Shield className="h-8 w-8 text-pet-primary" />,
      price: '0',
      features: ['getStarted.basic.feature1', 'getStarted.basic.feature2', 'getStarted.basic.feature3']
    },
    {
      key: 'comfort',
      icon: <Zap className="h-8 w-8 text-pet-primary" />,
      price: '9.99',
      features: ['getStarted.comfort.feature1', 'getStarted.comfort.feature2', 'getStarted.comfort.feature3', 'getStarted.comfort.feature4']
    },
    {
      key: 'rescue',
      icon: <Star className="h-8 w-8 text-pet-primary" />,
      price: '19.99',
      features: ['getStarted.rescue.feature1', 'getStarted.rescue.feature2', 'getStarted.rescue.feature3', 'getStarted.rescue.feature4', 'getStarted.rescue.feature5']
    }
  ];

  return (
    <div className="container mx-auto py-12 px-6">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">{t('getStarted.title')}</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {t('getStarted.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {plans.map((plan) => (
          <Card key={plan.key} className="relative hover:shadow-lg transition-shadow">
            {plan.key === 'comfort' && (
              <div className="absolute -top-4 left-0 right-0 flex justify-center">
                <span className="bg-pet-primary text-white px-4 py-1 rounded-full text-sm">
                  {t('getStarted.popular')}
                </span>
              </div>
            )}
            
            <CardHeader>
              <div className="mb-4">{plan.icon}</div>
              <CardTitle>{t(`getStarted.${plan.key}.title`)}</CardTitle>
              <CardDescription>
                <div className="mt-4 text-3xl font-bold">
                  ${plan.price}
                  <span className="text-base font-normal text-muted-foreground">
                    /{t('getStarted.monthly')}
                  </span>
                </div>
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <span className="mr-2 text-pet-primary">✓</span>
                    {t(feature)}
                  </li>
                ))}
              </ul>
            </CardContent>
            
            <CardFooter>
              <Link to="/signup" className="w-full">
                <Button 
                  className="w-full" 
                  variant={plan.key === 'comfort' ? 'default' : 'outline'}
                >
                  {t('getStarted.chooseThis')}
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">{t('getStarted.questions')}</h2>
        <p className="text-muted-foreground mb-8">
          {t('getStarted.contact')}
        </p>
        <Button asChild variant="outline">
          <Link to="/contact">{t('getStarted.contactUs')}</Link>
        </Button>
      </div>
    </div>
  );
};

export default GetStarted;
