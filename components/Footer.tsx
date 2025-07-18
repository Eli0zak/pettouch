import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Facebook, Instagram, Mail, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

const Footer = () => {
  const { t } = useLanguage();
  const { isDark } = useTheme();

  const handleSubscribe = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = (e.target as HTMLFormElement).email.value;
    if (email) {
      // In a real app, we'd send this to a backend API
      toast({
        title: t('footer.subscribedTitle'),
        description: t('footer.subscribedMessage'),
      });
      (e.target as HTMLFormElement).reset();
    }
  };

  return (
    <footer className={`pt-16 pb-6 border-t ${isDark ? 'bg-background border-gray-800' : 'bg-background border-gray-200'}`}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* About */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className={`font-semibold text-lg font-ibm-plex-sans ${isDark ? 'text-white' : 'text-[#2D2D2D]'}`}>
              {t('footer.about')}
            </h3>
            <p className={`text-sm font-ibm-plex-sans ${isDark ? 'text-white/70' : 'text-[#2D2D2D]/70'}`}>
              {t('footer.aboutDescription')}
            </p>
            <div className="flex space-x-4">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className={`${isDark ? 'text-white/60 hover:text-white' : 'text-[#2D2D2D]/60 hover:text-[#2D2D2D]'}`}>
                <Twitter size={20} />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className={`${isDark ? 'text-white/60 hover:text-white' : 'text-[#2D2D2D]/60 hover:text-[#2D2D2D]'}`}>
                <Facebook size={20} />
                <span className="sr-only">Facebook</span>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className={`${isDark ? 'text-white/60 hover:text-white' : 'text-[#2D2D2D]/60 hover:text-[#2D2D2D]'}`}>
                <Instagram size={20} />
                <span className="sr-only">Instagram</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className={`font-semibold text-lg font-ibm-plex-sans ${isDark ? 'text-white' : 'text-[#2D2D2D]'}`}>
              {t('footer.quickLinks')}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className={`text-sm flex items-center gap-1 font-ibm-plex-sans ${isDark ? 'text-white/70 hover:text-white' : 'text-[#2D2D2D]/70 hover:text-[#2D2D2D]'}`}>
                  <ChevronRight size={16} />
                  <span>{t('footer.about')}</span>
                </Link>
              </li>
              <li>
                <Link to="/store" className={`text-sm flex items-center gap-1 font-ibm-plex-sans ${isDark ? 'text-white/70 hover:text-white' : 'text-[#2D2D2D]/70 hover:text-[#2D2D2D]'}`}>
                  <ChevronRight size={16} />
                  <span>{t('footer.shop')}</span>
                </Link>
              </li>
              <li>
                <Link to="/features" className={`text-sm flex items-center gap-1 font-ibm-plex-sans ${isDark ? 'text-white/70 hover:text-white' : 'text-[#2D2D2D]/70 hover:text-[#2D2D2D]'}`}>
                  <ChevronRight size={16} />
                  <span>{t('footer.features')}</span>
                </Link>
              </li>
              <li>
                <Link to="/community-reports" className={`text-sm flex items-center gap-1 font-ibm-plex-sans ${isDark ? 'text-white/70 hover:text-white' : 'text-[#2D2D2D]/70 hover:text-[#2D2D2D]'}`}>
                  <ChevronRight size={16} />
                  <span>{t('footer.communityReports')}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className={`font-semibold text-lg font-ibm-plex-sans ${isDark ? 'text-white' : 'text-[#2D2D2D]'}`}>
              {t('footer.resources')}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/get-started" className={`text-sm flex items-center gap-1 font-ibm-plex-sans ${isDark ? 'text-white/70 hover:text-white' : 'text-[#2D2D2D]/70 hover:text-[#2D2D2D]'}`}>
                  <ChevronRight size={16} />
                  <span>{t('footer.getStarted')}</span>
                </Link>
              </li>
              <li>
                <Link to="/learn-more" className={`text-sm flex items-center gap-1 font-ibm-plex-sans ${isDark ? 'text-white/70 hover:text-white' : 'text-[#2D2D2D]/70 hover:text-[#2D2D2D]'}`}>
                  <ChevronRight size={16} />
                  <span>{t('footer.learnMore')}</span>
                </Link>
              </li>
              <li>
                <a href="#" className={`text-sm flex items-center gap-1 font-ibm-plex-sans ${isDark ? 'text-white/70 hover:text-white' : 'text-[#2D2D2D]/70 hover:text-[#2D2D2D]'}`}>
                  <ChevronRight size={16} />
                  <span>{t('footer.help')}</span>
                </a>
              </li>
              <li>
                <a href="#" className={`text-sm flex items-center gap-1 font-ibm-plex-sans ${isDark ? 'text-white/70 hover:text-white' : 'text-[#2D2D2D]/70 hover:text-[#2D2D2D]'}`}>
                  <ChevronRight size={16} />
                  <span>{t('footer.faq')}</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className={`font-semibold text-lg font-ibm-plex-sans ${isDark ? 'text-white' : 'text-[#2D2D2D]'}`}>
              Get Practical Pet-Care Tips
            </h3>
            <p className={`text-sm font-ibm-plex-sans ${isDark ? 'text-white/70' : 'text-[#2D2D2D]/70'}`}>
              Join 10,000+ smart owners. Get one highly useful tip delivered to your inbox each week.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
              <Input 
                type="email" 
                name="email" 
                placeholder="Enter your email" 
                required 
                className={`flex-grow font-ibm-plex-sans ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
              />
              <Button 
                type="submit"
                className={`${
                  isDark 
                    ? 'bg-[#6B4EFF] hover:bg-[#5B3EEF]' 
                    : 'bg-[#6B4EFF] hover:bg-[#5B3EEF]'
                } text-white font-semibold font-ibm-plex-sans`}
              >
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        {/* Divider */}
        <div className={`border-t ${isDark ? 'border-gray-800' : 'border-gray-200'} my-8`}></div>

        {/* Bottom section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className={`text-sm font-ibm-plex-sans ${isDark ? 'text-white/60' : 'text-[#2D2D2D]/60'}`}>
            &copy; {new Date().getFullYear()} PetTouch. {t('footer.allRightsReserved')}
          </p>
          <div className="flex space-x-6">
            <Link to="/privacy" className={`text-sm font-ibm-plex-sans ${isDark ? 'text-white/60 hover:text-white' : 'text-[#2D2D2D]/60 hover:text-[#2D2D2D]'}`}>
              {t('footer.privacy')}
            </Link>
            <Link to="/terms" className={`text-sm font-ibm-plex-sans ${isDark ? 'text-white/60 hover:text-white' : 'text-[#2D2D2D]/60 hover:text-[#2D2D2D]'}`}>
              {t('footer.terms')}
            </Link>
            <Link to="/contact" className={`text-sm font-ibm-plex-sans ${isDark ? 'text-white/60 hover:text-white' : 'text-[#2D2D2D]/60 hover:text-[#2D2D2D]'}`}>
              {t('footer.contact')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
