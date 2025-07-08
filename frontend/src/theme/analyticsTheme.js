/**
 * Analytics Dashboard Theme Configuration
 * Specific theme colors and styles for analytics components
 * Based on the AnalyticsDashboard component
 */

export const analyticsTheme = {
  // Chart Colors - From AnalyticsDashboard
  chart: {
    colors: {
      light: {
        queries: '#4F46E5',    // indigo-600
        uploads: '#059669',    // emerald-600
        users: '#D97706',      // amber-600
        icon: '#6366F1',       // indigo-500
        success: '#10B981',    // emerald-500
        warning: '#F59E0B',    // amber-500
        error: '#EF4444',      // red-500
        background: '#FFFFFF', // white
        grid: '#E5E7EB',       // gray-200
        text: '#111827',       // gray-900
        textSecondary: '#6B7280', // gray-500
      },
      dark: {
        queries: '#6366F1',    // indigo-500
        uploads: '#10B981',    // emerald-500
        users: '#F59E0B',      // amber-500
        icon: '#818CF8',       // indigo-400
        success: '#34D399',    // emerald-400
        warning: '#FBBF24',    // amber-400
        error: '#F87171',      // red-400
        background: '#1F2937', // gray-800
        grid: '#4B5563',       // gray-600
        text: '#F9FAFB',       // gray-50
        textSecondary: '#9CA3AF', // gray-400
      }
    },
    
    // Chart Styles
    styles: {
      axis: {
        stroke: '#E5E7EB', // gray-200 for light, #4B5563 for dark
        tick: {
          fill: '#111827', // gray-900 for light, #F9FAFB for dark
          fontSize: 12,
          fontWeight: 500,
        },
        line: {
          stroke: '#000000', // black for light, white for dark
        }
      },
      tooltip: {
        background: '#FFFFFF', // white for light, #1F2937 for dark
        border: '#E5E7EB',     // gray-200 for light, #4B5563 for dark
        text: '#111827',       // gray-900 for light, #F9FAFB for dark
      }
    }
  },

  // KPI Card Colors
  kpi: {
    background: {
      light: '#F9FAFB', // gray-50
      dark: 'rgba(255, 255, 255, 0.1)', // white/10
    },
    border: {
      light: '#E5E7EB', // gray-200
      dark: 'rgba(255, 255, 255, 0.1)', // white/10
    },
    icon: {
      light: '#6366F1', // indigo-500
      dark: '#818CF8',  // indigo-400
    },
    value: {
      light: '#4F46E5', // indigo-600
      dark: '#818CF8',  // indigo-400
    },
    label: {
      light: '#374151', // gray-700
      dark: '#D1D5DB',  // gray-300
    },
    subtitle: {
      light: '#6B7280', // gray-500
      dark: '#9CA3AF',  // gray-400
    }
  },

  // Filter and Control Colors
  controls: {
    button: {
      active: {
        background: '#4F46E5', // indigo-600
        text: '#FFFFFF',       // white
      },
      inactive: {
        background: '#F3F4F6', // gray-100
        text: '#374151',       // gray-700
        hover: '#E5E7EB',      // gray-200
      },
      dark: {
        active: {
          background: '#6366F1', // indigo-500
          text: '#FFFFFF',       // white
        },
        inactive: {
          background: 'rgba(255, 255, 255, 0.1)', // white/10
          text: '#D1D5DB',       // gray-300
          hover: 'rgba(255, 255, 255, 0.2)',      // white/20
        }
      }
    },
    checkbox: {
      checked: '#4F46E5', // indigo-600
      unchecked: '#D1D5DB', // gray-300
      dark: {
        checked: '#6366F1', // indigo-500
        unchecked: '#4B5563', // gray-600
      }
    }
  },

  // Tab Colors
  tabs: {
    active: {
      background: '#4F46E5', // indigo-600
      text: '#FFFFFF',       // white
    },
    inactive: {
      background: '#F3F4F6', // gray-100
      text: '#374151',       // gray-700
      hover: '#E5E7EB',      // gray-200
    },
    dark: {
      active: {
        background: '#6366F1', // indigo-500
        text: '#FFFFFF',       // white
      },
      inactive: {
        background: 'rgba(255, 255, 255, 0.1)', // white/10
        text: '#D1D5DB',       // gray-300
        hover: 'rgba(255, 255, 255, 0.2)',      // white/20
      }
    }
  },

  // Container Colors
  container: {
    background: {
      light: '#FFFFFF',
      dark: 'rgba(79, 70, 229, 0.05)', // indigo-500/5
    },
    border: {
      light: '#E5E7EB', // gray-200
      dark: 'rgba(255, 255, 255, 0.1)', // white/10
    },
    shadow: {
      light: 'shadow-lg',
      dark: 'shadow-md',
    },
    backdrop: {
      light: 'backdrop-blur-md',
      dark: 'backdrop-blur-lg',
    }
  },

  // Loading States
  loading: {
    spinner: {
      light: '#4F46E5', // indigo-600
      dark: '#6366F1',  // indigo-500
    },
    overlay: {
      light: 'rgba(255, 255, 255, 0.8)', // white/80
      dark: 'rgba(17, 24, 39, 0.8)',     // gray-900/80
    }
  }
};

// Utility functions for analytics theme
export const analyticsThemeUtils = {
  // Get chart colors based on mode
  getChartColors: (isDarkMode = false) => {
    return isDarkMode ? analyticsTheme.chart.colors.dark : analyticsTheme.chart.colors.light;
  },

  // Get KPI card styles
  getKpiStyles: (isDarkMode = false) => {
    return {
      background: isDarkMode ? analyticsTheme.kpi.background.dark : analyticsTheme.kpi.background.light,
      border: isDarkMode ? analyticsTheme.kpi.border.dark : analyticsTheme.kpi.border.light,
      icon: isDarkMode ? analyticsTheme.kpi.icon.dark : analyticsTheme.kpi.icon.light,
      value: isDarkMode ? analyticsTheme.kpi.value.dark : analyticsTheme.kpi.value.light,
      label: isDarkMode ? analyticsTheme.kpi.label.dark : analyticsTheme.kpi.label.light,
      subtitle: isDarkMode ? analyticsTheme.kpi.subtitle.dark : analyticsTheme.kpi.subtitle.light,
    };
  },

  // Get control button styles
  getControlStyles: (isActive, isDarkMode = false) => {
    if (isDarkMode) {
      return isActive ? analyticsTheme.controls.button.dark.active : analyticsTheme.controls.button.dark.inactive;
    }
    return isActive ? analyticsTheme.controls.button.active : analyticsTheme.controls.button.inactive;
  },

  // Get tab styles
  getTabStyles: (isActive, isDarkMode = false) => {
    if (isDarkMode) {
      return isActive ? analyticsTheme.tabs.dark.active : analyticsTheme.tabs.dark.inactive;
    }
    return isActive ? analyticsTheme.tabs.active : analyticsTheme.tabs.inactive;
  },

  // Get container styles
  getContainerStyles: (isDarkMode = false) => {
    return {
      background: isDarkMode ? analyticsTheme.container.background.dark : analyticsTheme.container.background.light,
      border: isDarkMode ? analyticsTheme.container.border.dark : analyticsTheme.container.border.light,
      shadow: isDarkMode ? analyticsTheme.container.shadow.dark : analyticsTheme.container.shadow.light,
      backdrop: isDarkMode ? analyticsTheme.container.backdrop.dark : analyticsTheme.container.backdrop.light,
    };
  }
};

export default analyticsTheme; 