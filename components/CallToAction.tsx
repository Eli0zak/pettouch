import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

const CallToAction = () => {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  
  return (
    <section className={`py-16 px-6 ${isDark ? 'bg-[#5B3EEF]' : 'bg-[#6B4EFF]'}`}>
      <div className="container mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-semibold text-white mb-6 font-ibm-plex-sans">
          {t('home.cta.title')}
        </h2>
        <p className="text-white/90 max-w-2xl mx-auto mb-8 font-ibm-plex-sans text-lg">
          {t('home.cta.description')}
        </p>
        <div className="flex justify-center">
          <Link to="/get-started">
            <Button 
              size="lg" 
              className={`${
                isDark 
                  ? 'bg-[#FF9900] hover:bg-[#cc7a00]' 
                  : 'bg-[#FF9900] hover:bg-[#cc7a00]'
              } text-white px-12 py-6 text-lg font-semibold font-ibm-plex-sans rounded-lg transition-colors duration-200`}
            >
              {t('home.cta.button')}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
