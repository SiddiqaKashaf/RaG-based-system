/**
 * DocThinker Enterprise Theme Configuration
 * Centralized theme system for the RAG-based SaaS application
 * Updated to match AnalyticsDashboard color scheme
 */

export const theme = {
  // Brand Colors - Updated to match AnalyticsDashboard
  brand: {
    primary: {
      light: '#4F46E5', // indigo-600 (from AnalyticsDashboard)
      dark: '#6366F1',  // indigo-500 (from AnalyticsDashboard)
      hover: '#4338CA', // indigo-700
    },
    secondary: {
      light: '#059669', // emerald-600 (from AnalyticsDashboard)
      dark: '#10B981',  // emerald-500 (from AnalyticsDashboard)
    },
    accent: {
      blue: '#4F46E5',    // indigo-600
      purple: '#7C3AED',  // violet-600
      emerald: '#059669', // emerald-600 (from AnalyticsDashboard)
      amber: '#D97706',   // amber-600 (from AnalyticsDashboard)
      rose: '#E11D48',    // rose-600
      slate: '#475569',   // slate-600
    }
  },

  // Background Colors - Updated for Eye Comfort
  background: {
    primary: {
      light: '#FFFFFF', // White (from AnalyticsDashboard)
      dark: '#1F2937', // dark gray (from AnalyticsDashboard)
    },
    secondary: {
      light: '#F1F5F9', // Soft slate-100
      dark: '#374151',  // gray-700
    },
    gradient: {
      light: 'from-white via-indigo-50/30 to-emerald-50/30', // Soft gradient with theme colors
      dark: 'from-[#1F2937] via-[#374151] to-[#4F46E5]', // dark theme gradient
    },
    card: {
      light: '#FFFFFF', // Keep white for cards but with softer borders
      dark: 'rgba(31, 41, 55, 0.85)', // semi-transparent for dark
    },
    statsCard: {
      light: 'rgba(255,255,255,0.95)',
      dark: 'rgba(31, 41, 55, 0.7)',
    },
    overlay: {
      light: 'bg-white/60 backdrop-blur-md',
      dark: 'bg-[#1F2937]/60 backdrop-blur-md',
    }
  },

  // Text Colors - Updated to match AnalyticsDashboard
  text: {
    primary: {
      light: '#1F2937', // gray-800 (lighter than gray-900 to prevent black appearance)
      dark: '#F9FAFB',  // gray-50
    },
    secondary: {
      light: '#6B7280', // gray-500
      dark: '#9CA3AF',  // gray-400
    },
    accent: {
      light: '#4F46E5', // indigo-600 (from AnalyticsDashboard)
      dark: '#818CF8',  // indigo-400 (from AnalyticsDashboard)
    },
    success: {
      light: '#059669', // emerald-600 (from AnalyticsDashboard)
      dark: '#34D399',  // emerald-400 (from AnalyticsDashboard)
    },
    warning: {
      light: '#D97706', // amber-600 (from AnalyticsDashboard)
      dark: '#FBBF24',  // amber-400 (from AnalyticsDashboard)
    },
    error: {
      light: '#DC2626', // red-600
      dark: '#F87171',  // red-400
    }
  },

  // Border Colors - Updated for softer appearance
  border: {
    primary: {
      light: '#E5E7EB', // gray-200
      dark: '#4B5563',  // gray-600
    },
    accent: {
      light: '#C7D2FE', // indigo-200
      dark: '#6366F1',  // indigo-500
    },
    overlay: {
      light: 'border-white/20',
      dark: 'border-indigo-400/20',
    }
  },

  // Feature Card Gradients - Updated to match AnalyticsDashboard colors
  featureGradients: {
    search: 'from-indigo-600 to-indigo-500',
    aiAssistant: 'from-indigo-800 to-purple-600',
    analytics: 'from-emerald-600 to-emerald-500',
    documents: 'from-amber-600 to-amber-500',
    userManagement: 'from-red-700 to-rose-600',
    settings: 'from-slate-700 to-gray-600',
    disabled: 'from-slate-500 to-gray-400',
  },

  // Status Colors - Updated to match AnalyticsDashboard
  status: {
    success: {
      bg: {
        light: '#ECFDF5', // emerald-50
        dark: 'rgba(5, 150, 105, 0.3)',  // emerald-600/30
      },
      text: {
        light: '#059669', // emerald-600 (from AnalyticsDashboard)
        dark: '#34D399',  // emerald-400 (from AnalyticsDashboard)
      },
      border: {
        light: '#A7F3D0', // emerald-200
        dark: '#065F46',  // emerald-800
      }
    },
    info: {
      bg: {
        light: '#EEF2FF', // indigo-50
        dark: 'rgba(79, 70, 229, 0.3)',  // indigo-600/30
      },
      text: {
        light: '#4F46E5', // indigo-600 (from AnalyticsDashboard)
        dark: '#818CF8',  // indigo-400 (from AnalyticsDashboard)
      },
      border: {
        light: '#C7D2FE', // indigo-200
        dark: '#3730A3',  // indigo-800
      }
    },
    warning: {
      bg: {
        light: '#FFFBEB', // amber-50
        dark: 'rgba(217, 119, 6, 0.3)',  // amber-600/30
      },
      text: {
        light: '#D97706', // amber-600 (from AnalyticsDashboard)
        dark: '#FBBF24',  // amber-400 (from AnalyticsDashboard)
      },
      border: {
        light: '#FED7AA', // amber-200
        dark: '#92400E',  // amber-800
      }
    },
    error: {
      bg: {
        light: '#FEF2F2', // red-50
        dark: 'rgba(153, 27, 27, 0.3)',  // red-900/30
      },
      text: {
        light: '#DC2626', // red-600
        dark: '#F87171',  // red-400
      },
      border: {
        light: '#FECACA', // red-200
        dark: '#991B1B',  // red-800
      }
    }
  },

  // Spacing and Layout
  spacing: {
    container: {
      maxWidth: 'max-w-7xl',
      padding: 'px-4 sm:px-6 lg:px-8',
    },
    card: {
      padding: 'p-6',
      gap: 'gap-6',
      fixedHeight: 'h-80',
    },
    section: {
      padding: 'py-8',
      margin: 'mb-8',
    }
  },

  // Border Radius
  borderRadius: {
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    xl: 'rounded-3xl',
    full: 'rounded-full',
  },

  // Shadows
  shadows: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  },

  // Transitions
  transitions: {
    default: 'transition-all duration-200',
    hover: 'hover:transition-all hover:duration-200',
    focus: 'focus:transition-all focus:duration-150',
  }
};

// Component-specific theme classes - Updated to match AnalyticsDashboard
export const componentThemes = {
  // Card Components - Updated to match AnalyticsDashboard glass morphism
  card: {
    base: `bg-white/90 dark:bg-indigo-500/5 dark:backdrop-blur-lg dark:shadow-md dark:ring-1 dark:ring-white/20 rounded-xl shadow-sm border border-gray-200/60 dark:border-gray-700/50 backdrop-blur-md`,
    hover: `hover:shadow-md hover:border-gray-300/70 dark:hover:border-gray-600/70 transition-all duration-200`,
    interactive: `cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all duration-200`,
    stats: `bg-gray-50/80 dark:bg-white/10 rounded-xl border border-gray-200/40 dark:border-white/10 backdrop-blur-sm`,
    container: `bg-white/80 dark:bg-indigo-500/5 dark:backdrop-blur-lg dark:shadow-md dark:ring-1 dark:ring-white/20 rounded-xl shadow-md border border-gray-200/30 backdrop-blur-md`,
    recentActivity: `bg-white/80 dark:bg-indigo-500/5 dark:backdrop-blur-lg dark:shadow-md dark:ring-1 dark:ring-white/20 rounded-xl shadow-md border border-gray-200/30 backdrop-blur-md h-96 overflow-y-auto p-6`,
    systemNotifications: `bg-white/80 dark:bg-indigo-500/5 dark:backdrop-blur-lg dark:shadow-md dark:ring-1 dark:ring-white/20 rounded-xl shadow-md border border-gray-200/30 backdrop-blur-md h-94 overflow-y-auto p-6`,
    profileGlass: `bg-white/95 dark:bg-indigo-500/10 dark:backdrop-blur-lg dark:shadow-md dark:ring-1 dark:ring-white/20 rounded-3xl shadow-lg`,
    contactGlass: "bg-white/95 dark:bg-indigo-500/5 dark:backdrop-blur-lg dark:shadow-md dark:ring-1 dark:ring-white/20 rounded-3xl shadow-lg",
  },

  // Form Components - Updated to match AnalyticsDashboard
  form: {
    input: `w-full p-3 rounded-lg bg-white/80 border border-gray-300/60 text-gray-800 
            dark:bg-gray-800 dark:border-gray-700 dark:text-white 
            focus:outline-none focus:ring-2 focus:ring-indigo-400 backdrop-blur-sm`,
    label: `block mb-2 text-gray-700 dark:text-gray-300`,
    button: {
      primary: `w-full py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 
                transition duration-200 dark:bg-indigo-500 dark:hover:bg-indigo-600`,
      secondary: `px-4 py-2 rounded-lg bg-gray-100/80 text-gray-700 hover:bg-gray-200/80 
                  dark:bg-gray-700/80 dark:text-gray-300 dark:hover:bg-gray-600/80 transition-colors backdrop-blur-sm`,
    }
  },

  // Feature Cards - Updated to match AnalyticsDashboard
  featureCard: {
    base: `relative block rounded-xl p-4 text-white shadow-lg transition-all backdrop-blur-md bg-transparent dark:bg-transparent`,
    disabled: `opacity-60 cursor-not-allowed pointer-events-none`,
    icon: `bg-white/20 p-3 rounded-xl mb-4 backdrop-blur-md`,
    badge: `text-sm font-medium bg-white/20 px-3 py-1 rounded-lg backdrop-blur-md`,
    action: `inline-flex items-center gap-1 px-3 py-1.5 bg-white/20 text-white 
             rounded-lg font-medium hover:bg-white/30 transition text-sm backdrop-blur-md`,
  },

  // Status Indicators - Updated to match AnalyticsDashboard
  status: {
    success: `bg-emerald-50/80 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 backdrop-blur-sm`,
    info: `bg-indigo-50/80 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 backdrop-blur-sm`,
    warning: `bg-amber-50/80 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 backdrop-blur-sm`,
    error: `bg-rose-50/80 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 backdrop-blur-sm`,
  },

  // Navigation - Updated to match AnalyticsDashboard
  nav: {
    link: `text-gray-600 dark:text-gray-300 hover:text-indigo-800 dark:hover:text-indigo-300 
           transition-colors duration-200`,
    active: `text-indigo-800 dark:text-indigo-300 font-medium`,
  },

  // Buttons - Updated to match AnalyticsDashboard
  button: {
    primary: `bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg 
              transition-colors duration-200 dark:bg-indigo-500 dark:hover:bg-indigo-600`,
    secondary: `bg-gray-100/80 hover:bg-gray-200/80 text-gray-700 font-medium py-2 px-4 rounded-lg 
                transition-colors duration-200 dark:bg-gray-700/80 dark:hover:bg-gray-600/80 dark:text-gray-300 backdrop-blur-sm`,
    outline: `border border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-medium py-2 px-4 
              rounded-lg transition-colors duration-200 dark:border-indigo-400 dark:text-indigo-400 
              dark:hover:bg-indigo-900/30`,
  },

  // Headings - Updated to match AnalyticsDashboard
  typography: {
    h1: `text-3xl font-bold text-gray-800 dark:text-white bg-transparent`,
    h2: `text-2xl font-bold text-gray-800 dark:text-white bg-transparent`,
    h3: `text-lg font-semibold text-gray-800 dark:text-white bg-transparent`,
    body: `text-gray-700 dark:text-gray-300`,
    caption: `text-sm text-gray-500 dark:text-gray-400`,
    link: `text-indigo-600 dark:text-indigo-300 hover:underline`,
  },

  // Text Colors - Updated to match AnalyticsDashboard
  text: {
    primary: `text-gray-800 dark:text-white`,
    secondary: `text-gray-600 dark:text-gray-300`,
    accent: `text-indigo-600 dark:text-indigo-300`,
    success: `text-emerald-600 dark:text-emerald-400`,
    warning: `text-amber-600 dark:text-amber-400`,
    error: `text-red-600 dark:text-red-400`,
  },

  // Border Colors - Updated to match AnalyticsDashboard
  border: {
    primary: `border-gray-300 dark:border-gray-600`,
    accent: `border-indigo-300 dark:border-indigo-500`,
  },

  // Background Colors - Updated to match AnalyticsDashboard
  background: {
    primary: `bg-white dark:bg-gray-800`,
    secondary: `bg-gray-50 dark:bg-gray-700`,
    card: `bg-white/80 dark:bg-gray-800/80`,
  },

  // Shadows - Updated to match AnalyticsDashboard
  shadows: {
    sm: `shadow-sm`,
    md: `shadow-md`,
    lg: `shadow-lg`,
    xl: `shadow-xl`,
  }
};

// Utility functions for theme application
export const themeUtils = {
  // Get gradient class for feature cards
  getFeatureGradient: (feature) => {
    const gradients = {
      search: theme.featureGradients.search,
      aiAssistant: theme.featureGradients.aiAssistant,
      analytics: theme.featureGradients.analytics,
      documents: theme.featureGradients.documents,
      userManagement: theme.featureGradients.userManagement,
      settings: theme.featureGradients.settings,
    };
    return gradients[feature] || theme.featureGradients.settings;
  },

  // Get status colors
  getStatusColors: (type) => {
    return theme.status[type] || theme.status.info;
  },

  // Get component theme
  getComponentTheme: (component, variant = 'base') => {
    return componentThemes[component]?.[variant] || componentThemes[component]?.base || '';
  },

  // Apply dark mode classes
  applyDarkMode: (lightClass, darkClass) => {
    return `${lightClass} dark:${darkClass}`;
  }
};

// Export default theme object
export default theme; 