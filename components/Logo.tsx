import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import logoImagePng from '@/assets/pettouch.logo.png';

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  useSvg?: boolean;
  heroSize?: boolean;
}

const Logo = ({ size = 54, className, showText = true, useSvg = true, heroSize = false, asLink = true }: LogoProps & { asLink?: boolean }) => {
  const { t, isRTL } = useLanguage();
  
  const finalSize = heroSize ? 120 : size;
  
  const content = (
    <div className={cn("flex items-center gap-4", className)}>
      {useSvg ? (
        <img 
          src="/pettouch.logo.svg" 
          alt="PetTouch Logo" 
          className={cn(
            isRTL ? 'order-1' : '',
            className
          )} 
          style={{ width: finalSize, height: finalSize, objectFit: 'contain' }} 
        />
      ) : (
        <img 
          src={logoImagePng} 
          alt="PetTouch Logo" 
          className={cn(
            isRTL ? 'order-1' : '',
            className
          )} 
          style={{ width: finalSize, height: finalSize, objectFit: 'contain' }} 
        />
      )}
      {showText && (
        <span className={cn(
          "font-semibold text-3xl bg-gradient-to-r from-[#9b87f5] to-[#7E69AB] bg-clip-text text-transparent",
          isRTL ? 'order-0' : ''
        )}>
          {t('app.name')}
        </span>
      )}
    </div>
  );

  return asLink ? <Link to="/">{content}</Link> : content;
};

export default Logo;
