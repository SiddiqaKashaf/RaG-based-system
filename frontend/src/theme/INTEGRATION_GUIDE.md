# Theme System Integration Guide

This guide explains how to integrate the new theme system with your existing DocThinker Enterprise application.

## Current State Analysis

Your application already has:
- Dark mode implementation in `App.jsx`
- Basic UI components in `components/ui/`
- Existing styling patterns in `ContactPage.jsx` and `HomePage.jsx`

## Integration Strategy

### Phase 1: Gradual Migration (Recommended)

1. **Keep existing dark mode logic** in `App.jsx` for now
2. **Add ThemeProvider** alongside existing providers
3. **Migrate components one by one** to use the theme system
4. **Eventually replace** the old dark mode logic

## Step-by-Step Integration

### Step 1: Add ThemeProvider to App.jsx

```jsx
// App.jsx - Add this import
import { ThemeProvider } from './theme';

// Wrap your existing providers
export default function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} />
      <ThemeProvider> {/* Add this wrapper */}
        <NavBarProvider>
          {/* ... existing content ... */}
        </NavBarProvider>
      </ThemeProvider>
    </>
  );
}
```

### Step 2: Update Existing UI Components

#### Update Input.jsx:

```jsx
import React from 'react';
import { useTheme } from '../theme';

export function Input({ label, type = 'text', placeholder, value, onChange, className }) {
  const { getComponentClass } = useTheme();
  
  return (
    <div className={`flex flex-col mb-4 ${className}`}>
      {label && (
        <label className={getComponentClass('form', 'label')} htmlFor={label}>
          {label}
        </label>
      )}
      <input
        id={label}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={getComponentClass('form', 'input')}
      />
    </div>
  );
}
```

### Step 3: Test the Integration

Add a theme toggle button to test:

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

## Migration Checklist

- [ ] Add ThemeProvider to App.jsx
- [ ] Update Input.jsx component
- [ ] Update Tabs.jsx component
- [ ] Migrate ContactPage.jsx
- [ ] Migrate HomePage.jsx feature cards
- [ ] Test dark mode toggle
- [ ] Verify all components in both themes

## Benefits After Integration

1. **Consistent Styling**: All components use the same design tokens
2. **Easy Maintenance**: Change colors in one place
3. **Better Dark Mode**: Automatic system preference detection
4. **Professional Look**: Enterprise-grade design system
5. **Scalability**: Easy to add new components and themes 