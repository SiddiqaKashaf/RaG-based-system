import React, { createContext, useState, useEffect } from 'react';
import { theme, componentThemes, themeUtils } from './theme';

// Create theme context
export const ThemeContext = createContext();

// Theme provider component
const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initialize dark mode based on system preference or stored preference
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (storedTheme === 'dark' || (!storedTheme && systemPrefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Theme context value
  const themeContextValue = {
    theme,
    componentThemes,
    themeUtils,
    isDarkMode,
    toggleDarkMode,
    
    // Convenience methods
    getColor: (colorPath) => {
      const path = colorPath.split('.');
      let value = theme;
      for (const key of path) {
        value = value?.[key];
      }
      return value;
    },
    
    getComponentClass: (component, variant = 'base') => {
      return themeUtils.getComponentTheme(component, variant);
    },
    
    getGradient: (feature) => {
      return themeUtils.getFeatureGradient(feature);
    },
    
    getStatusClass: (type) => {
      return componentThemes.status[type] || componentThemes.status.info;
    }
  };

  return (
    <ThemeContext.Provider value={themeContextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Export both named and default for Fast Refresh compatibility
export { ThemeProvider };
export default ThemeProvider; 