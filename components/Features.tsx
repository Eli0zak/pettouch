import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

const Features: React.FC = () => {
  const { t } = useLanguage();
  const { isDark } = useTheme();

  return (
    <section className={`py-16 px-6 font-ibm-plex-sans ${isDark ? 'bg-background' : 'bg-[#F5F5F5]'}`}>
      <div className="container mx-auto space-y-20 max-w-7xl">
        {/* Section Header */}
        <header className="text-center max-w-3xl mx-auto">
          <h2 className={`text-4xl font-semibold mb-4 font-ibm-plex-sans ${isDark ? 'text-white' : 'text-[#2D2D2D]'}`}>
            {t('home.features.title')}
          </h2>
          <p className={`text-lg font-medium font-ibm-plex-sans ${isDark ? 'text-white/70' : 'text-[#2D2D2D]/70'}`}>
            {t('home.features.subtitle')}
          </p>
        </header>

        {/* Feature Block 1 */}
        <div className={`flex flex-col md:flex-row items-center rounded-2xl shadow-lg overflow-hidden ${isDark ? 'bg-card' : 'bg-white'}`}>
          {/* Text Content Left */}
          <div className="md:w-1/2 p-8 md:p-12">
            <h3 className={`text-3xl font-semibold mb-4 font-ibm-plex-sans ${isDark ? 'text-white' : 'text-[#2D2D2D]'}`}>
              {t('home.features.profile.title')}
            </h3>
            <p className={`text-base font-medium mb-6 font-ibm-plex-sans ${isDark ? 'text-white/80' : 'text-[#2D2D2D]/80'}`}>
              {t('home.features.profile.description')}
            </p>
            <button className={`px-6 py-2 rounded-lg text-white font-semibold transition font-ibm-plex-sans ${isDark ? 'bg-[#6B4EFF] hover:bg-[#5B3EEF]' : 'bg-[#6B4EFF] hover:bg-[#5B3EEF]'}`}>
              {t('home.features.profile.button')}
            </button>
          </div>
          {/* Visual Right */}
          <div className="md:w-1/2 relative flex justify-center items-center bg-[#6B4EFF] rounded-l-3xl md:rounded-l-none md:rounded-r-3xl p-8 md:p-12">
            <div className="transform rotate-6 shadow-xl rounded-3xl overflow-hidden w-64">
              <img
                src="/src/assets/cbf7dcd757ab68db.png"
                alt={t('home.features.profile.title')}
                className="w-full h-auto rounded-3xl"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        {/* Feature Block 2 */}
        <div className={`flex flex-col md:flex-row items-center rounded-2xl shadow-lg overflow-hidden ${isDark ? 'bg-card' : 'bg-white'}`}>
          {/* Text Content Left */}
          <div className="md:w-1/2 p-8 md:p-12 order-2 md:order-1">
            <h3 className={`text-3xl font-semibold mb-4 font-ibm-plex-sans ${isDark ? 'text-white' : 'text-[#2D2D2D]'}`}>
              {t('home.features.tag.title')}
            </h3>
            <p className={`text-base font-medium mb-6 font-ibm-plex-sans ${isDark ? 'text-white/80' : 'text-[#2D2D2D]/80'}`}>
              {t('home.features.tag.description')}
            </p>
            <button className={`px-6 py-2 rounded-lg text-white font-semibold transition font-ibm-plex-sans ${isDark ? 'bg-[#6B4EFF] hover:bg-[#5B3EEF]' : 'bg-[#6B4EFF] hover:bg-[#5B3EEF]'}`}>
              {t('home.features.tag.button')}
            </button>
          </div>
          {/* Visual Right */}
          <div className="md:w-1/2 relative flex justify-center items-center bg-[#6B4EFF] rounded-r-3xl p-8 md:p-12 order-1 md:order-2">
            <div className="shadow-xl rounded-3xl overflow-hidden w-64">
              <img
                src="/src/assets/cbf7dcd757ab68db.png"
                alt={t('home.features.tag.title')}
                className="w-full h-auto rounded-3xl"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        {/* Feature Block 3 */}
        <div className={`flex flex-col md:flex-row items-center rounded-2xl shadow-lg overflow-hidden ${isDark ? 'bg-card' : 'bg-white'}`}>
          {/* Text Content Left */}
          <div className="md:w-1/2 p-8 md:p-12">
            <h3 className={`text-3xl font-semibold mb-4 font-ibm-plex-sans ${isDark ? 'text-white' : 'text-[#2D2D2D]'}`}>
              {t('home.features.care.title')}
            </h3>
            <p className={`text-base font-medium mb-6 font-ibm-plex-sans ${isDark ? 'text-white/80' : 'text-[#2D2D2D]/80'}`}>
              {t('home.features.care.description')}
            </p>
            <button className={`px-6 py-2 rounded-lg text-white font-semibold transition font-ibm-plex-sans ${isDark ? 'bg-[#6B4EFF] hover:bg-[#5B3EEF]' : 'bg-[#6B4EFF] hover:bg-[#5B3EEF]'}`}>
              {t('home.features.care.button')}
            </button>
          </div>
          {/* Visual Right */}
          <div className="md:w-1/2 relative flex justify-center items-center bg-[#6B4EFF] rounded-l-3xl md:rounded-l-none md:rounded-r-3xl p-8 md:p-12">
            <div className="transform -rotate-6 shadow-xl rounded-3xl overflow-hidden w-64">
              <img
                src="/src/assets/cbf7dcd757ab68db.png"
                alt={t('home.features.care.title')}
                className="w-full h-auto rounded-3xl"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
