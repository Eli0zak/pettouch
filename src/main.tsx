import { createRoot } from 'react-dom/client';
import { lazy, Suspense } from 'react';
import { PerformanceWrapper } from '@/components/PerformanceWrapper';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import './index.css';
// Import fonts and styles
import './styles/fonts.css';
import './styles/animations.css';
// Import i18n configuration
import './utils/i18n';

// Lazy load the main App component
const App = lazy(() => import('./App.tsx'));

// Add RTL support styles
const style = document.createElement('style');
style.textContent = `
[dir="rtl"] .space-x-6 > *:not(:first-child) {
  margin-right: 1.5rem;
  margin-left: 0;
}

[dir="rtl"] .space-x-3 > *:not(:first-child) {
  margin-right: 0.75rem;
  margin-left: 0;
}

[dir="rtl"] .mr-2 {
  margin-right: 0;
  margin-left: 0.5rem;
}

[dir="rtl"] .mr-4 {
  margin-right: 0;
  margin-left: 1rem;
}

[dir="rtl"] .ml-3 {
  margin-left: 0;
  margin-right: 0.75rem;
}
`;
document.head.appendChild(style);

// Initialize performance monitoring
if (process.env.NODE_ENV === 'production') {
  // Only measure in production
  import('./utils/performance').then(({ measureWebVitals }) => {
    measureWebVitals();
  });
}

createRoot(document.getElementById("root")!).render(
  <PerformanceWrapper>
    <Suspense fallback={<LoadingSpinner size="lg" />}>
      <App />
    </Suspense>
  </PerformanceWrapper>
);
