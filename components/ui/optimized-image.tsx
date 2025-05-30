import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fallbackSrc?: string;
  loadingComponent?: React.ReactNode;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className,
  fallbackSrc = '/placeholder.svg',
  loadingComponent,
  priority = false,
  onLoad,
  onError,
}) => {
  const [isLoading, setIsLoading] = useState(!priority);
  const [error, setError] = useState(false);
  const [imageSrc, setImageSrc] = useState(priority ? src : fallbackSrc);

  useEffect(() => {
    // إذا كانت الصورة ذات أولوية، فلا داعي للتحميل المتأخر
    if (priority) {
      setImageSrc(src);
      return;
    }

    // التحقق مما إذا كانت الصورة مرئية في العرض
    const checkIfVisible = () => {
      // تحميل الصورة عند تمرير المستخدم إلى موقعها
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setImageSrc(src);
            setIsLoading(true);
            observer.disconnect();
          }
        });
      }, { rootMargin: '200px 0px' }); // تحميل مسبق 200px قبل الوصول

      const element = document.getElementById(`optimized-image-${src.replace(/[^a-zA-Z0-9]/g, '')}`);
      if (element) {
        observer.observe(element);
      }

      return () => observer.disconnect();
    };

    const cleanup = checkIfVisible();
    return cleanup;
  }, [src, priority]);

  const handleLoad = () => {
    setIsLoading(false);
    setError(false);
    if (onLoad) onLoad();
  };

  const handleError = () => {
    setIsLoading(false);
    setError(true);
    setImageSrc(fallbackSrc);
    if (onError) onError();
  };

  return (
    <div
      id={`optimized-image-${src.replace(/[^a-zA-Z0-9]/g, '')}`}
      className={cn(
        "relative overflow-hidden",
        className
      )}
      style={{ width, height }}
    >
      {isLoading && loadingComponent ? (
        loadingComponent
      ) : isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
          <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-pet-primary"></div>
        </div>
      ) : null}
      
      <img
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "max-w-full h-auto object-cover transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        loading={priority ? "eager" : "lazy"}
      />
    </div>
  );
};

export default OptimizedImage; 