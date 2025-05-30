import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Users, Heart, ScanLine, UserCheck } from 'lucide-react';

const Statistics = () => {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  
  const stats = [
    {
      icon: <Users className={isDark ? "h-8 w-8 text-accent" : "h-8 w-8 text-pet-primary"} />,
      number: "10,000+",
      label: t('stats.users')
    },
    {
      icon: <Heart className={isDark ? "h-8 w-8 text-accent" : "h-8 w-8 text-pet-primary"} />,
      number: "25,000+",
      label: t('stats.pets')
    },
    {
      icon: <ScanLine className={isDark ? "h-8 w-8 text-accent" : "h-8 w-8 text-pet-primary"} />,
      number: "100,000+",
      label: t('stats.scans')
    },
    {
      icon: <UserCheck className={isDark ? "h-8 w-8 text-accent" : "h-8 w-8 text-pet-primary"} />,
      number: "1,000+",
      label: t('stats.reunited')
    }
  ];

  return (
    <section className={isDark ? "py-16 px-6 bg-background" : "py-16 px-6 bg-gradient-to-br from-white to-pet-accent2/30"}>
      <div className="container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="flex justify-center mb-4">{stat.icon}</div>
              <div className={isDark ? "text-3xl font-bold mb-2 text-foreground" : "text-3xl font-bold mb-2"}>{stat.number}</div>
              <div className={isDark ? "text-sm text-muted-foreground" : "text-sm text-muted-foreground"}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Statistics;
