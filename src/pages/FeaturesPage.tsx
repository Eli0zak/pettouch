import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';

interface Feature {
  title: string;
  description: string;
  imageSrc: string;
  altText: string;
}

const features: Feature[] = [
  {
    title: 'Digital Pet Profiles',
    description: 'Create and manage detailed profiles for your pets, including photos, medical history, and more.',
    imageSrc: '/assets/features/digital-pet-profiles.png',
    altText: 'Digital Pet Profiles mockup'
  },
  {
    title: 'Health & Reminders',
    description: 'Keep track of your pet’s health with reminders for vaccinations, medications, and appointments.',
    imageSrc: '/assets/features/health-reminders.png',
    altText: 'Health & Reminders mockup'
  },
  {
    title: 'Pet Community Hub',
    description: 'Connect with other pet owners, share tips, and find local pet-friendly events.',
    imageSrc: '/assets/features/pet-community-hub.png',
    altText: 'Pet Community Hub mockup'
  },
  {
    title: 'Location Tracking',
    description: 'Real-time GPS tracking to keep your pet safe and easily locate them if they wander off.',
    imageSrc: 'src/assets/cbf7dcd757ab68db.png',
    altText: 'Location Tracking mockup'
  }
];

const FeaturesPage: React.FC = () => {
  const { t } = useLanguage();
  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.pageYOffset > 300) {
        setShowScroll(true);
      } else {
        setShowScroll(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <div className="container mx-auto py-12 px-6 space-y-16">
        {/* Main Header Section */}
        <header className="text-center">
          <h1 className="text-5xl font-bold mb-4 text-pet-primary">Features</h1>
          <p className="text-lg font-normal max-w-3xl mx-auto text-muted-foreground">
            Discover the key features that make PetTouch your perfect pet companion.
          </p>
        </header>

        {/* Features Display Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className="flex flex-col items-center text-center hover-scale">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <h3 className="text-xl font-semibold mb-3 text-pet-primary">{feature.title}</h3>
              <p className="text-base font-normal text-muted-foreground mb-6">{feature.description}</p>
              <img
                src={feature.imageSrc}
                alt={feature.altText}
                className="w-full h-auto rounded-md"
                loading="lazy"
              />
            </CardContent>
            </Card>
          ))}
        </section>
      </div>

      {/* Scroll-to-Top Button */}
      {showScroll && (
        <button
          onClick={scrollToTop}
          aria-label="Scroll to top"
          className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-pet-primary flex items-center justify-center shadow-lg hover:bg-pet-primary-dark transition-colors dark:bg-pet-primary dark:hover:bg-pet-primary-dark"
        >
          <ArrowUp className="text-white" size={24} />
        </button>
      )}
    </div>
  );
};

export default FeaturesPage;
