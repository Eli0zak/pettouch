import React from 'react';

// Define common breakpoints (matching Tailwind's defaults)
export const breakpoints = {
  sm: 640,
  md: 768, 
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

// React Hook to check if the viewport is at least a certain width
export const useMediaQuery = (width: keyof typeof breakpoints | number): boolean => {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    const query = `(min-width: ${typeof width === 'number' ? width : breakpoints[width]}px)`;
    const media = window.matchMedia(query);
    
    // Initial check
    setMatches(media.matches);

    // Watch for changes
    const listener = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    // Modern browsers
    media.addEventListener('change', listener);
    
    // Cleanup
    return () => {
      media.removeEventListener('change', listener);
    };
  }, [width]);

  return matches;
};

// Helper for conditionally rendering mobile/desktop components
export const Responsive = {
  Mobile: ({ children }: { children: React.ReactNode }) => {
    const isDesktop = useMediaQuery('md');
    return isDesktop ? null : <>{children}</>;
  },
  
  Desktop: ({ children }: { children: React.ReactNode }) => {
    const isDesktop = useMediaQuery('md');
    return isDesktop ? <>{children}</> : null;
  }
};

export default Responsive; 