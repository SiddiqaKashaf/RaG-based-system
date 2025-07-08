// Import all theme-related modules
import theme, { componentThemes, themeUtils } from './theme';
import { ThemeProvider } from './ThemeProvider';
import { useTheme } from './useTheme';
import analyticsTheme, { analyticsThemeUtils } from './analyticsTheme';

// Export main theme objects
export { theme, theme as themeConfig };
export { componentThemes, themeUtils };
export { ThemeProvider, useTheme };

// Export analytics theme
export { analyticsTheme, analyticsThemeUtils };

// Re-export commonly used theme utilities
export const {
  getFeatureGradient,
  getStatusColors,
  getComponentTheme,
  applyDarkMode
} = themeUtils;

// Re-export commonly used component themes
export const {
  card,
  form,
  featureCard,
  status,
  nav,
  button,
  typography
} = componentThemes;

// Re-export analytics theme utilities
export const {
  getChartColors,
  getKpiStyles,
  getControlStyles,
  getTabStyles,
  getContainerStyles
} = analyticsThemeUtils; 