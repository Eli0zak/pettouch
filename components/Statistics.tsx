import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Users, Heart, ScanLine, UserCheck } from 'lucide-react';

const Statistics = () => {
  const { t } = useLanguage();
  const { isDark } = useTheme();

  const stats = [
    {
      icon: <Users className={isDark ? "h-8 w-8 text-accent" : "h-8 w-8 text-[#6B4EFF]"} />,
      number: "10,000+",
      label: t('stats.users')
    },
    {
      icon: <Heart className={isDark ? "h-8 w-8 text-accent" : "h-8 w-8 text-[#6B4EFF]"} />,
      number: "25,000+",
      label: t('stats.pets')
    },
    {
      icon: <ScanLine className={isDark ? "h-8 w-8 text-accent" : "h-8 w-8 text-[#6B4EFF]"} />,
      number: "100,000+",
      label: t('stats.scans')
    },
    {
      icon: <UserCheck className={isDark ? "h-8 w-8 text-accent" : "h-8 w-8 text-[#6B4EFF]"} />,
      number: "1,000+",
      label: t('stats.reunited')
    }
  ];

  return (
    <section className={isDark ? "py-16 px-6 bg-background" : "py-16 px-6 bg-[#F5F5F5]"}>
      <div className="container mx-auto font-ibm-plex-sans">
        <h2 className={`text-3xl font-semibold mb-8 text-center ${isDark ? 'text-white' : 'text-[#2D2D2D]'}`}>
          {t('home.stats.title')}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="flex justify-center mb-4">{stat.icon}</div>
              <div className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-[#2D2D2D]'}`}>
                {stat.number}
              </div>
              <div className={`text-sm ${isDark ? 'text-white/60' : 'text-[#2D2D2D]/60'}`}>
                {stat.label}
              </div>
              {stat.label === t('stats.reunited') && (
                <a 
                  href="/max-story" 
                  className={`text-sm mt-1 inline-block hover:underline ${
                    isDark ? 'text-[#FF9900] hover:text-[#cc7a00]' : 'text-[#FF9900] hover:text-[#cc7a00]'
                  }`}
                >
                  {t('home.stats.readStory')} &gt;
                </a>
              )}
            </div>
          ))}
        </div>
        
        {/* Success Stories Section */}
        <div className="mt-16 text-center">
          <h3 className={`text-2xl font-semibold mb-4 font-ibm-plex-sans ${isDark ? 'text-white' : 'text-[#2D2D2D]'}`}>
            {t('home.stats.stories.title')}
          </h3>
          <p className={`text-base mb-8 max-w-2xl mx-auto font-ibm-plex-sans ${isDark ? 'text-white/70' : 'text-[#2D2D2D]/70'}`}>
            {t('home.stats.stories.subtitle')}
          </p>
          <div className="flex flex-wrap justify-center gap-8">
            <div className="group cursor-pointer">
              <div className="relative overflow-hidden rounded-xl mb-3">
                <img 
                  src="/src/assets/user1.jpg" 
                  alt={t('home.stats.reunionTime')} 
                  className={`w-32 h-32 object-cover transition-transform duration-300 group-hover:scale-110 ${isDark ? 'opacity-90' : ''}`}
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${isDark ? 'from-black/60' : 'from-black/40'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              </div>
              <p className={`text-sm font-medium font-ibm-plex-sans ${isDark ? 'text-white/90' : 'text-[#2D2D2D]'}`}>Sarah & Max</p>
              <p className={`text-xs font-ibm-plex-sans ${isDark ? 'text-white/60' : 'text-[#2D2D2D]/60'}`}>{t('home.stats.reunionTime')}</p>
            </div>
            <div className="group cursor-pointer">
              <div className="relative overflow-hidden rounded-xl mb-3">
                <img 
                  src="/src/assets/user2.jpg" 
                  alt={t('home.stats.vaccineTracking')} 
                  className={`w-32 h-32 object-cover transition-transform duration-300 group-hover:scale-110 ${isDark ? 'opacity-90' : ''}`}
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${isDark ? 'from-black/60' : 'from-black/40'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              </div>
              <p className={`text-sm font-medium font-ibm-plex-sans ${isDark ? 'text-white/90' : 'text-[#2D2D2D]'}`}>Tom & Luna</p>
              <p className={`text-xs font-ibm-plex-sans ${isDark ? 'text-white/60' : 'text-[#2D2D2D]/60'}`}>{t('home.stats.vaccineTracking')}</p>
            </div>
            <div className="group cursor-pointer">
              <div className="relative overflow-hidden rounded-xl mb-3">
                <img 
                  src="/src/assets/user3.jpg" 
                  alt={t('home.stats.peaceOfMind')} 
                  className={`w-32 h-32 object-cover transition-transform duration-300 group-hover:scale-110 ${isDark ? 'opacity-90' : ''}`}
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${isDark ? 'from-black/60' : 'from-black/40'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              </div>
              <p className={`text-sm font-medium font-ibm-plex-sans ${isDark ? 'text-white/90' : 'text-[#2D2D2D]'}`}>Emma & Bella</p>
              <p className={`text-xs font-ibm-plex-sans ${isDark ? 'text-white/60' : 'text-[#2D2D2D]/60'}`}>{t('home.stats.peaceOfMind')}</p>
            </div>
          </div>
          <button className={`mt-8 text-sm font-medium font-ibm-plex-sans ${isDark ? 'text-[#FF9900] hover:text-[#cc7a00]' : 'text-[#FF9900] hover:text-[#cc7a00]'}`}>
            {t('home.stats.readMore')}
          </button>
        </div>
      </div>
    </section>
  );
};

export default Statistics;
