# DocThinker Enterprise Theme System

A comprehensive theme system for the RAG-based SaaS application that provides consistent styling, dark mode support, and professional design patterns.

## Features

- 🎨 **Centralized Theme Configuration** - All colors, spacing, and design tokens in one place
- 🌙 **Dark Mode Support** - Automatic dark/light mode switching with system preference detection
- 🧩 **Component Themes** - Pre-built theme classes for common components
- 🔧 **Utility Functions** - Helper functions for dynamic theme application
- 📱 **Responsive Design** - Mobile-first approach with consistent breakpoints
- 🎯 **Professional Design** - Enterprise-grade styling for SaaS applications
- 📊 **Analytics Theme** - Specialized theme for analytics and dashboard components

## Quick Start

### 1. Wrap your app with ThemeProvider

```jsx
// App.jsx
import { ThemeProvider } from './theme';

function App() {
  return (
    <ThemeProvider>
      {/* Your app components */}
    </ThemeProvider>
  );
}
```

### 2. Use theme in components

```jsx
import { useTheme } from '../theme';

function MyComponent() {
  const { theme, getComponentClass, getGradient } = useTheme();
  
  return (
    <div className={getComponentClass('card', 'base')}>
      <h1 className={theme.typography.h1}>Title</h1>
      <div className={`bg-gradient-to-br ${getGradient('search')}`}>
        Feature Card
      </div>
    </div>
  );
}
```

## Theme Structure

### Brand Colors
```javascript
theme.brand.primary.light    // #4F46E5 (indigo-600)
theme.brand.primary.dark     // #6366F1 (indigo-500)
theme.brand.accent.blue      // #4F46E5 (indigo-600)
theme.brand.accent.purple    // #7C3AED (violet-600)
theme.brand.accent.emerald   // #059669 (emerald-600)
theme.brand.accent.amber     // #D97706 (amber-600)
theme.brand.accent.rose      // #E11D48 (rose-600)
theme.brand.accent.slate     // #475569 (slate-600)
```

### Feature Card Gradients
```javascript
theme.featureGradients.search         // from-indigo-600 to-indigo-500
theme.featureGradients.aiAssistant    // from-indigo-800 to-purple-600
theme.featureGradients.analytics      // from-emerald-600 to-emerald-500
theme.featureGradients.documents      // from-amber-600 to-amber-500
theme.featureGradients.userManagement // from-red-700 to-rose-600
theme.featureGradients.settings       // from-slate-700 to-gray-600
```

## Analytics Theme

The analytics theme provides specialized colors and styles for dashboard and analytics components, based on the AnalyticsDashboard design.

### Chart Colors
```javascript
import { getChartColors } from '../theme';

const chartColors = getChartColors(isDarkMode);

// Primary chart colors
chartColors.queries  // #4F46E5 (indigo-600) / #6366F1 (indigo-500)
chartColors.uploads  // #059669 (emerald-600) / #10B981 (emerald-500)
chartColors.users    // #D97706 (amber-600) / #F59E0B (amber-500)
chartColors.icon     // #6366F1 (indigo-500) / #818CF8 (indigo-400)
```

### KPI Card Styles
```javascript
import { getKpiStyles } from '../theme';

const kpiStyles = getKpiStyles(isDarkMode);

// KPI card styling
<div 
  className="p-6 rounded-xl border shadow-sm"
  style={{
    backgroundColor: kpiStyles.background,
    borderColor: kpiStyles.border,
  }}
>
  <h3 style={{ color: kpiStyles.label }}>Total Queries</h3>
  <p style={{ color: kpiStyles.value }}>1,234</p>
  <p style={{ color: kpiStyles.subtitle }}>123 queries/day</p>
</div>
```

### Control Styles
```javascript
import { getControlStyles } from '../theme';

// Button styles for filters and controls
<button
  className="px-4 py-2 rounded-lg transition-all duration-200"
  style={{
    backgroundColor: getControlStyles(isActive, isDarkMode).background,
    color: getControlStyles(isActive, isDarkMode).text,
  }}
>
  {buttonText}
</button>
```

### Tab Styles
```javascript
import { getTabStyles } from '../theme';

// Tab styling
<button
  className="px-6 py-2 font-semibold rounded-t-lg focus:outline-none transition-colors duration-200"
  style={{
    backgroundColor: getTabStyles(isActive, isDarkMode).background,
    color: getTabStyles(isActive, isDarkMode).text,
  }}
>
  {tabLabel}
</button>
```

### Container Styles
```javascript
import { getContainerStyles } from '../theme';

// Main container styling
<div 
  className="rounded-3xl shadow-lg backdrop-blur-lg border"
  style={{
    backgroundColor: getContainerStyles(isDarkMode).background,
    borderColor: getContainerStyles(isDarkMode).border,
  }}
>
  {/* Content */}
</div>
```

### Complete Analytics Example
```jsx
import React, { useState } from 'react';
import { 
  getChartColors,
  getKpiStyles,
  getControlStyles,
  getTabStyles,
  getContainerStyles
} from '../theme';

function AnalyticsDashboard() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('analytics');

  const chartColors = getChartColors(isDarkMode);
  const kpiStyles = getKpiStyles(isDarkMode);
  const containerStyles = getContainerStyles(isDarkMode);

  return (
    <div 
      className="max-w-7xl mx-auto p-8 rounded-3xl shadow-lg backdrop-blur-lg border"
      style={{
        backgroundColor: containerStyles.background,
        borderColor: containerStyles.border,
      }}
    >
      {/* Tabs */}
      <div className="flex gap-2 border-b p-6">
        {['analytics', 'admin', 'activity'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-6 py-2 font-semibold rounded-t-lg transition-colors duration-200"
            style={{
              backgroundColor: getTabStyles(activeTab === tab, isDarkMode).background,
              color: getTabStyles(activeTab === tab, isDarkMode).text,
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        <div 
          className="p-6 rounded-xl border shadow-sm"
          style={{
            backgroundColor: kpiStyles.background,
            borderColor: kpiStyles.border,
          }}
        >
          <h3 style={{ color: kpiStyles.label }}>Total Queries</h3>
          <p style={{ color: kpiStyles.value }}>1,234</p>
          <p style={{ color: kpiStyles.subtitle }}>123 queries/day</p>
        </div>
      </div>

      {/* Chart with theme colors */}
      <div className="p-6">
        <div 
          className="w-full h-64 rounded-2xl border"
          style={{
            backgroundColor: chartColors.background,
            borderColor: chartColors.grid,
          }}
        >
          {/* Chart component would go here */}
        </div>
      </div>
    </div>
  );
}
```

## Component Themes

### Cards
```jsx
// Basic card
<div className={getComponentClass('card', 'base')}>
  Card content
</div>

// Interactive card with hover effects
<div className={`${getComponentClass('card', 'base')} ${getComponentClass('card', 'interactive')}`}>
  Hoverable card
</div>
```

### Forms
```jsx
// Input field
<input 
  className={getComponentClass('form', 'input')}
  placeholder="Enter text..."
/>

// Label
<label className={getComponentClass('form', 'label')}>
  Field Label
</label>

// Primary button
<button className={getComponentClass('form', 'button.primary')}>
  Submit
</button>
```

### Feature Cards
```jsx
// Feature card with gradient
<div className={`${getComponentClass('featureCard', 'base')} bg-gradient-to-br ${getGradient('search')}`}>
  <div className={getComponentClass('featureCard', 'icon')}>
    <SearchIcon />
  </div>
  <h3>Search Feature</h3>
  <span className={getComponentClass('featureCard', 'badge')}>
    Enterprise-grade
  </span>
</div>
```

### Status Indicators
```jsx
// Success status
<div className={getStatusClass('success')}>
  Operation successful
</div>

// Info status
<div className={getStatusClass('info')}>
  Information message
</div>

// Warning status
<div className={getStatusClass('warning')}>
  Warning message
</div>

// Error status
<div className={getStatusClass('error')}>
  Error message
</div>
```

### Buttons
```jsx
// Primary button
<button className={getComponentClass('button', 'primary')}>
  Primary Action
</button>

// Secondary button
<button className={getComponentClass('button', 'secondary')}>
  Secondary Action
</button>

// Outline button
<button className={getComponentClass('button', 'outline')}>
  Outline Action
</button>
```

### Typography
```jsx
// Headings
<h1 className={getComponentClass('typography', 'h1')}>Main Heading</h1>
<h2 className={getComponentClass('typography', 'h2')}>Section Heading</h2>
<h3 className={getComponentClass('typography', 'h3')}>Subsection Heading</h3>

// Body text
<p className={getComponentClass('typography', 'body')}>Body text content</p>

// Caption text
<span className={getComponentClass('typography', 'caption')}>Caption text</span>

// Links
<a className={getComponentClass('typography', 'link')}>Link text</a>
```

## Dark Mode

The theme system automatically handles dark mode based on:
1. User's stored preference (`localStorage`)
2. System preference (`prefers-color-scheme`)

### Toggle Dark Mode
```jsx
import { useTheme } from '../theme';

function ThemeToggle() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  
  return (
    <button onClick={toggleDarkMode}>
      {isDarkMode ? '☀️ Light' : '🌙 Dark'}
    </button>
  );
}
```

## Utility Functions

### getFeatureGradient(feature)
Returns the appropriate gradient class for feature cards.

```jsx
const gradient = getFeatureGradient('search'); // 'from-blue-600 to-indigo-600'
```

### getStatusColors(type)
Returns status color configuration.

```jsx
const colors = getStatusColors('success');
// Returns: { bg: { light: '#ECFDF5', dark: '#065F46' }, ... }
```

### getComponentTheme(component, variant)
Returns component theme classes.

```jsx
const cardClass = getComponentTheme('card', 'base');
// Returns: 'bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700'
```

### applyDarkMode(lightClass, darkClass)
Applies dark mode classes to a light mode class.

```jsx
const responsiveClass = applyDarkMode('bg-white', 'bg-gray-800');
// Returns: 'bg-white dark:bg-gray-800'
```

## Best Practices

### 1. Use Component Themes
Instead of writing custom classes, use the pre-built component themes:

```jsx
// ✅ Good
<div className={getComponentClass('card', 'base')}>

// ❌ Avoid
<div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
```

### 2. Leverage Feature Gradients
Use the predefined gradients for feature cards:

```jsx
// ✅ Good
<div className={`${getComponentClass('featureCard', 'base')} bg-gradient-to-br ${getGradient('search')}`}>

// ❌ Avoid
<div className="bg-gradient-to-br from-blue-600 to-indigo-600">
```

### 3. Use Status Classes
Apply consistent status styling:

```jsx
// ✅ Good
<div className={getStatusClass('success')}>Success message</div>

// ❌ Avoid
<div className="bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400">
```

### 4. Maintain Consistency
Use the theme system consistently across all components to ensure a cohesive design.

## Migration Guide

### From Inline Classes to Theme System

**Before:**
```jsx
<div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Title</h2>
  <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
    Action
  </button>
</div>
```

**After:**
```jsx
<div className={`${getComponentClass('card', 'base')} p-6`}>
  <h2 className={`${getComponentClass('typography', 'h2')} mb-4`}>Title</h2>
  <button className={getComponentClass('button', 'primary')}>
    Action
  </button>
</div>
```

## Customization

To customize the theme, modify the `theme.js` file:

```javascript
// Add custom colors
theme.brand.custom = {
  light: '#your-color',
  dark: '#your-dark-color'
};

// Add custom component themes
componentThemes.customComponent = {
  base: 'your-custom-classes',
  variant: 'your-variant-classes'
};
```

## Browser Support

- Modern browsers with CSS Grid and Flexbox support
- Dark mode support for browsers that support `prefers-color-scheme`
- Fallback to light mode for older browsers

## Performance

The theme system is optimized for performance:
- CSS classes are pre-defined and cached
- No runtime CSS generation
- Minimal JavaScript overhead
- Efficient dark mode switching 