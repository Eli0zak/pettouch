const plugin = require('tailwindcss/plugin');

module.exports = plugin(function({ addComponents, theme }) {
  // Neumorphic components
  const neumorphism = {
    // Light mode neumorphic components
    '.neu-flat-light': {
      backgroundColor: theme('colors.gray.100', '#ECF0F1'),
      boxShadow: '5px 5px 10px #c9cccf, -5px -5px 10px #ffffff',
      borderRadius: theme('borderRadius.lg', '1rem'),
      transition: 'all 0.3s ease-in-out',
    },
    '.neu-pressed-light': {
      backgroundColor: theme('colors.gray.100', '#ECF0F1'),
      boxShadow: 'inset 5px 5px 10px #c9cccf, inset -5px -5px 10px #ffffff',
      borderRadius: theme('borderRadius.lg', '1rem'),
      transition: 'all 0.3s ease-in-out',
    },
    '.neu-btn-light': {
      backgroundColor: theme('colors.gray.100', '#ECF0F1'),
      boxShadow: '5px 5px 10px #c9cccf, -5px -5px 10px #ffffff',
      borderRadius: theme('borderRadius.lg', '1rem'),
      transition: 'all 0.3s ease-in-out',
      '&:hover': {
        boxShadow: '7px 7px 14px #c9cccf, -7px -7px 14px #ffffff',
        transform: 'translateY(-2px)',
      },
      '&:active': {
        boxShadow: 'inset 5px 5px 10px #c9cccf, inset -5px -5px 10px #ffffff',
        transform: 'translateY(0)',
      },
    },

    // Dark mode neumorphic components
    '.neu-flat-dark': {
      backgroundColor: theme('colors.gray.900', '#1A1A1A'),
      boxShadow: '5px 5px 10px #151515, -5px -5px 10px #1f1f1f',
      borderRadius: theme('borderRadius.lg', '1rem'),
      transition: 'all 0.3s ease-in-out',
    },
    '.neu-pressed-dark': {
      backgroundColor: theme('colors.gray.900', '#1A1A1A'),
      boxShadow: 'inset 5px 5px 10px #151515, inset -5px -5px 10px #1f1f1f',
      borderRadius: theme('borderRadius.lg', '1rem'),
      transition: 'all 0.3s ease-in-out',
    },
    '.neu-btn-dark': {
      backgroundColor: theme('colors.gray.900', '#1A1A1A'),
      boxShadow: '5px 5px 10px #151515, -5px -5px 10px #1f1f1f',
      borderRadius: theme('borderRadius.lg', '1rem'),
      transition: 'all 0.3s ease-in-out',
      '&:hover': {
        boxShadow: '7px 7px 14px #151515, -7px -7px 14px #1f1f1f',
        transform: 'translateY(-2px)',
      },
      '&:active': {
        boxShadow: 'inset 5px 5px 10px #151515, inset -5px -5px 10px #1f1f1f',
        transform: 'translateY(0)',
      },
    },

    // Glassmorphism components
    '.glass-light': {
      background: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(10px)',
      borderRadius: theme('borderRadius.lg', '1rem'),
      border: '1px solid rgba(255, 255, 255, 0.18)',
    },
    '.glass-dark': {
      background: 'rgba(45, 52, 54, 0.7)',
      backdropFilter: 'blur(10px)',
      borderRadius: theme('borderRadius.lg', '1rem'),
      border: '1px solid rgba(255, 255, 255, 0.08)',
    },
    
    // 3D effect components
    '.effect-3d': {
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
      transition: 'transform 0.3s ease',
      '&:hover': {
        transform: 'perspective(1000px) rotateX(5deg) rotateY(5deg)',
      },
    },
    
    // Animation classes
    '.animate-fade-in': {
      animation: 'fadeIn 0.5s ease-in-out',
    },
    '.animate-scale-up': {
      animation: 'scaleUp 0.3s ease-in-out',
    },
    '.animate-bounce': {
      animation: 'bounce 0.5s ease-in-out',
    },
    
    // Keyframes
    '@keyframes fadeIn': {
      '0%': { opacity: '0' },
      '100%': { opacity: '1' },
    },
    '@keyframes scaleUp': {
      '0%': { transform: 'scale(0.95)' },
      '100%': { transform: 'scale(1)' },
    },
    '@keyframes bounce': {
      '0%, 100%': { transform: 'translateY(0)' },
      '50%': { transform: 'translateY(-10px)' },
    },
  };

  addComponents(neumorphism);
}); 