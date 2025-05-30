
import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Facebook, Instagram, Mail, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

const Footer = () => {
  const { t } = useLanguage();

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
    <footer className="bg-background pt-16 pb-6 border-t">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* About */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-bold text-lg">{t('footer.about')}</h3>
            <p className="text-muted-foreground text-sm">
              {t('footer.aboutDescription')}
            </p>
            <div className="flex space-x-4">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                <Twitter size={20} />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                <Facebook size={20} />
                <span className="sr-only">Facebook</span>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                <Instagram size={20} />
                <span className="sr-only">Instagram</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1">
                  <ChevronRight size={16} />
                  <span>{t('footer.about')}</span>
                </Link>
              </li>
              <li>
                <Link to="/store" className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1">
                  <ChevronRight size={16} />
                  <span>{t('footer.shop')}</span>
                </Link>
              </li>
              <li>
                <Link to="/features" className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1">
                  <ChevronRight size={16} />
                  <span>{t('footer.features')}</span>
                </Link>
              </li>
              <li>
                <Link to="/community-reports" className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1">
                  <ChevronRight size={16} />
                  <span>{t('footer.communityReports')}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg">{t('footer.resources')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/get-started" className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1">
                  <ChevronRight size={16} />
                  <span>{t('footer.getStarted')}</span>
                </Link>
              </li>
              <li>
                <Link to="/learn-more" className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1">
                  <ChevronRight size={16} />
                  <span>{t('footer.learnMore')}</span>
                </Link>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1">
                  <ChevronRight size={16} />
                  <span>{t('footer.help')}</span>
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1">
                  <ChevronRight size={16} />
                  <span>{t('footer.faq')}</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="font-bold text-lg">{t('footer.newsletter')}</h3>
            <p className="text-sm text-muted-foreground">{t('footer.newsletterDescription')}</p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
              <Input 
                type="email" 
                name="email" 
                placeholder={t('footer.emailPlaceholder')} 
                required 
                className="flex-grow"
              />
              <Button type="submit">{t('footer.subscribe')}</Button>
            </form>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-muted/50 my-8"></div>

        {/* Bottom section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} PetTouch. {t('footer.allRightsReserved')}
          </p>
          <div className="flex space-x-6">
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
              {t('footer.privacy')}
            </Link>
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground">
              {t('footer.terms')}
            </Link>
            <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground">
              {t('footer.contact')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
