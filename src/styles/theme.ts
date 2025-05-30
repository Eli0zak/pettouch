export const theme = {
  colors: {
    light: {
      background: '#F8F9FC', // Soft cool white
      text: '#1E293B', // Deep slate blue
      primary: '#6366F1', // Modern indigo
      secondary: '#8B5CF6', // Rich purple
      accent: '#EC4899', // Luxurious pink
      error: '#EF4444', // Modern red
      warning: '#F59E0B', // Amber
      success: '#10B981', // Fresh emerald
      surface: '#FFFFFF', // Pure white
      surfaceAlt: '#F1F5F9', // Very light blue gray
    },
    dark: {
      background: '#0F172A', // Deep navy
      text: '#F1F5F9', // Light blue-gray
      primary: '#818CF8', // Lighter indigo
      secondary: '#A78BFA', // Soft violet
      accent: '#F472B6', // Soft pink
      error: '#F87171', // Soft red
      warning: '#FBBF24', // Soft amber
      success: '#34D399', // Light emerald
      surface: '#1E293B', // Slate blue
      surfaceAlt: '#334155', // Light slate
    }
  },
  shadows: {
    // Premium neumorphic shadows for light mode
    neumorphicLight: {
      flat: '5px 5px 15px rgba(209, 213, 219, 0.8), -5px -5px 15px rgba(255, 255, 255, 0.8)',
      pressed: 'inset 5px 5px 10px rgba(209, 213, 219, 0.8), inset -5px -5px 10px rgba(255, 255, 255, 0.8)',
      hover: '8px 8px 18px rgba(209, 213, 219, 0.6), -8px -8px 18px rgba(255, 255, 255, 0.6)',
    },
    // Refined shadows for dark mode
    neumorphicDark: {
      flat: '5px 5px 15px rgba(15, 23, 42, 0.7), -5px -5px 15px rgba(30, 41, 59, 0.7)',
      pressed: 'inset 5px 5px 10px rgba(15, 23, 42, 0.7), inset -5px -5px 10px rgba(30, 41, 59, 0.7)',
      hover: '8px 8px 18px rgba(15, 23, 42, 0.5), -8px -8px 18px rgba(30, 41, 59, 0.5)',
    },
    // Modern glassmorphic effect
    glass: {
      light: 'backdrop-filter: blur(16px); background: rgba(255, 255, 255, 0.65); border: 1px solid rgba(255, 255, 255, 0.18); box-shadow: 0 8px 32px rgba(15, 23, 42, 0.1);',
      dark: 'backdrop-filter: blur(16px); background: rgba(30, 41, 59, 0.65); border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);',
    }
  },
  borderRadius: {
    sm: '0.375rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
    '2xl': '2rem',
  },
  typography: {
    fontFamily: {
      english: '"Inter", system-ui, sans-serif',
      arabic: '"Cairo", system-ui, sans-serif',
    },
    fontSize: {
      body: '1rem', // 16px
      bodyLarge: '1.125rem', // 18px
      heading4: '1.5rem', // 24px
      heading3: '1.75rem', // 28px
      heading2: '2rem', // 32px
      heading1: '2.5rem', // 40px
    }
  },
  animation: {
    transition: {
      fast: '0.15s cubic-bezier(0.4, 0, 0.2, 1)',
      normal: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      slow: '0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    }
  }
};

// Utility function to get shadow values based on theme mode
export const getShadow = (type: string, mode: 'light' | 'dark') => {
  const shadowSet = mode === 'light' ? theme.shadows.neumorphicLight : theme.shadows.neumorphicDark;
  return shadowSet[type as keyof typeof shadowSet] || '';
};

// Utility function to get glass effect
export const getGlassEffect = (mode: 'light' | 'dark') => {
  return theme.shadows.glass[mode];
};

// CSS variables for theme
export const generateCssVariables = (mode: 'light' | 'dark') => {
  const colors = theme.colors[mode];
  return {
    '--color-background': colors.background,
    '--color-text': colors.text,
    '--color-primary': colors.primary,
    '--color-secondary': colors.secondary,
    '--color-accent': colors.accent,
    '--color-error': colors.error,
    '--color-warning': colors.warning,
    '--color-success': colors.success,
    '--color-surface': colors.surface,
    '--color-surface-alt': colors.surfaceAlt,
  };
}; 