'use client';
import { useEffect } from 'react';

function getThemeForHour(hour) {
  // Light: 6am (6) to 6pm (18)
  // Dark:  6pm (18) to 6am (6)
  return hour >= 6 && hour < 18 ? 'light' : 'dark';
}

export default function ThemeProvider({ children }) {
  useEffect(() => {
    function applyTheme() {
      const hour = new Date().getHours();
      const theme = getThemeForHour(hour);
      document.documentElement.setAttribute('data-theme', theme);
    }

    // Apply immediately on mount — force light for preview, remove to re-enable auto
    document.documentElement.setAttribute('data-theme', 'light');
    return; // temporary override
    applyTheme();

    // Check every minute — switches exactly when the clock crosses 6am or 6pm
    const interval = setInterval(applyTheme, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return children;
}
