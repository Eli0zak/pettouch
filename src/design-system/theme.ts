export const theme = {
  colors: {
    primary: '#6B4EFF', // Brand purple
    accent: '#FF9900',  // CTA orange
    text: {
      primary: '#2D2D2D',  // Dark neutral for text
      muted: '#6B7280',    // Muted text
    },
    background: {
      light: '#F5F5F5',    // Light grey for backgrounds
      white: '#FFFFFF',
    }
  },
  typography: {
    fontFamily: {
      base: '"IBM Plex Sans", sans-serif',
    },
    fontWeight: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    fontSize: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',    // 18px
      xl: '1.25rem',     // 20px
      '2xl': '1.5rem',   // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
    },
  },
  borderRadius: {
    sm: '0.375rem',    // 6px
    md: '0.5rem',      // 8px
    lg: '0.75rem',     // 12px
    xl: '1rem',        // 16px
    '2xl': '1.5rem',   // 24px
  },
  spacing: {
    1: '0.25rem',      // 4px
    2: '0.5rem',       // 8px
    3: '0.75rem',      // 12px
    4: '1rem',         // 16px
    5: '1.25rem',      // 20px
    6: '1.5rem',       // 24px
    8: '2rem',         // 32px
    10: '2.5rem',      // 40px
    12: '3rem',        // 48px
    16: '4rem',        // 64px
  }
};

// Utility function to access theme values
export const getThemeValue = (path: string) => {
  return path.split('.').reduce((obj, key) => obj && obj[key], theme);
};

export default theme;
