import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
// Import fonts
import './styles/fonts.css'
// Import i18n configuration
import './utils/i18n'

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

createRoot(document.getElementById("root")!).render(<App />);
