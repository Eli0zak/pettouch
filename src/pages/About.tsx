import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, PawPrint } from 'lucide-react';
import TeamMember from '@/components/about/TeamMember';
import ValueCard from '@/components/about/ValueCard';
import mainImage from '@/assets/main.png';
import catImage from '@/assets/cat.png';

const About = () => {
  const { isDark } = useTheme();
  const { t } = useLanguage();

  // Placeholder data - replace with actual content
  const teamMembers = [
    {
      name: t("about.team.sarah.name"),
      petName: t("about.team.sarah.petName"),
      role: t("about.team.sarah.role"),
      bio: t("about.team.sarah.bio"),
      image: mainImage,
      petImage: catImage
    },
    {
      name: t("about.team.michael.name"),
      petName: t("about.team.michael.petName"),
      role: t("about.team.michael.role"),
      bio: t("about.team.michael.bio"),
      image: mainImage,
      petImage: catImage
    },
    {
      name: t("about.team.emily.name"),
      petName: t("about.team.emily.petName"),
      role: t("about.team.emily.role"),
      bio: t("about.team.emily.bio"),
      image: mainImage,
      petImage: catImage
    }
  ];

  const values = [
    {
      title: t("about.values.careConnection.title"),
      visual: (
        <img
          src={mainImage}
          alt={t("about.values.careConnection.imageAlt")}
          className="w-full h-full object-cover"
        />
      ),
      description: t("about.values.careConnection.desc")
    },
    {
      title: t("about.values.technology.title"),
      visual: (
        <div className="relative w-full h-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
          <img
            src={catImage}
            alt={t("about.values.technology.imageAlt")}
            className="w-3/4 h-3/4 object-contain"
          />
        </div>
      ),
      description: t("about.values.technology.desc")
    },
    {
      title: t("about.values.community.title"),
      visual: (
        <div className="grid grid-cols-2 gap-1 w-full h-full">
          <img src={mainImage} alt={t("about.values.community.image1Alt")} className="w-full h-full object-cover" />
          <img src={catImage} alt={t("about.values.community.image2Alt")} className="w-full h-full object-cover" />
          <img src={mainImage} alt={t("about.values.community.image3Alt")} className="w-full h-full object-cover" />
          <img src={catImage} alt={t("about.values.community.image4Alt")} className="w-full h-full object-cover" />
        </div>
      ),
      description: t("about.values.community.desc")
    }
  ];

  const steps = [
    {
      number: "01",
      title: t("about.steps.profile.title"),
      description: t("about.steps.profile.desc")
    },
    {
      number: "02",
      title: t("about.steps.tag.title"),
      description: t("about.steps.tag.desc")
    },
    {
      number: "03",
      title: t("about.steps.care.title"),
      description: t("about.steps.care.desc")
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className={cn(
        "py-20 px-6",
        isDark ? "bg-background" : "bg-[#F5F5F5]"
      )}>
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className={cn(
              "text-5xl md:text-6xl font-semibold mb-6 font-ibm-plex-sans",
              isDark ? "text-white" : "text-[#2D2D2D]"
            )}>
              {t("about.title")}
            </h1>
            <p className={cn(
              "text-lg md:text-xl mb-8 leading-relaxed font-ibm-plex-sans",
              isDark ? "text-white/80" : "text-[#2D2D2D]/80"
            )}>
              {t("about.story.p1")}
            </p>
            <p className={cn(
              "text-lg md:text-xl mb-8 leading-relaxed font-ibm-plex-sans",
              isDark ? "text-white/80" : "text-[#2D2D2D]/80"
            )}>
              {t("about.story.p2")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Meet Our Pack Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-7xl">
          <motion.h2
            className={cn(
              "text-3xl md:text-4xl font-semibold mb-12 text-center font-ibm-plex-sans",
              isDark ? "text-white" : "text-[#2D2D2D]"
            )}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {t("about.team.title")}
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <TeamMember key={index} {...member} />
            ))}
          </div>
        </div>
      </section>

      {/* Values in Action Section */}
      <section className={cn(
        "py-16 px-6",
        isDark ? "bg-background" : "bg-[#F5F5F5]"
      )}>
        <div className="container mx-auto max-w-7xl">
          <motion.h2
            className={cn(
              "text-3xl md:text-4xl font-semibold mb-12 text-center font-ibm-plex-sans",
              isDark ? "text-white" : "text-[#2D2D2D]"
            )}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {t("about.values.title")}
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <ValueCard key={index} {...value} />
            ))}
          </div>
        </div>
      </section>

      {/* Path to Peace of Mind Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-7xl">
          <motion.h2
            className={cn(
              "text-3xl md:text-4xl font-semibold mb-12 text-center font-ibm-plex-sans",
              isDark ? "text-white" : "text-[#2D2D2D]"
            )}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {t("about.join.title")}
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                className={cn(
                  "p-6 rounded-2xl relative",
                  isDark ? "bg-card" : "bg-white",
                  "shadow-lg"
                )}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <span className={cn(
                  "text-6xl font-bold opacity-10 absolute top-4 right-4",
                  isDark ? "text-white" : "text-[#2D2D2D]"
                )}>
                  {step.number}
                </span>
                <h3 className={cn(
                  "text-xl font-semibold mb-4 font-ibm-plex-sans",
                  isDark ? "text-white" : "text-[#2D2D2D]"
                )}>
                  {step.title}
                </h3>
                <p className={cn(
                  "text-base leading-relaxed font-ibm-plex-sans",
                  isDark ? "text-white/80" : "text-[#2D2D2D]/80"
                )}>
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className={cn(
        "py-20 px-6",
        isDark ? "bg-background" : "bg-[#F5F5F5]"
      )}>
        <div className="container mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className={cn(
              "text-3xl md:text-4xl font-semibold mb-6 font-ibm-plex-sans",
              isDark ? "text-white" : "text-[#2D2D2D]"
            )}>
              {t("about.join.title")}
            </h2>
            <p className={cn(
              "text-lg mb-8 font-ibm-plex-sans",
              isDark ? "text-white/80" : "text-[#2D2D2D]/80"
            )}>
              {t("about.join.desc")}
            </p>
            <Link to="/get-started">
              <Button 
                className="bg-[#FF9900] hover:bg-[#cc7a00] text-white rounded-lg px-8 py-6 text-lg font-semibold font-ibm-plex-sans"
                size="lg"
              >
                <span className="flex items-center gap-2">
                  {t("cta.getStarted")}
                  <ArrowRight className="h-5 w-5" />
                </span>
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;
