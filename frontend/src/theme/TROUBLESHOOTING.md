# Theme System Troubleshooting Guide

## Common Issues and Solutions

### 1. "themeUtils is not defined" Error

**Problem**: Reference error when importing theme utilities.

**Solution**: The `index.js` file has been fixed. Make sure you're using the latest version.

**Check**: Verify your `frontend/src/theme/index.js` looks like this:

```javascript
// Import all theme-related modules
import theme, { componentThemes, themeUtils } from './theme';
import ThemeProvider, { useTheme } from './ThemeProvider';

// Export main theme objects
export { theme as default, theme as themeConfig };
export { componentThemes, themeUtils };
export { ThemeProvider as default, useTheme };

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
```

### 2. "useTheme must be used within a ThemeProvider" Error

**Problem**: Trying to use `useTheme` hook outside of ThemeProvider.

**Solution**: Wrap your app with ThemeProvider in `App.jsx`:

```jsx
// App.jsx
import { ThemeProvider } from './theme';

export default function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} />
      <ThemeProvider> {/* Add this wrapper */}
        <NavBarProvider>
          {/* Your existing content */}
        </NavBarProvider>
      </ThemeProvider>
    </>
  );
}
```

### 3. Dark Mode Not Working

**Problem**: Dark mode classes not applying.

**Solution**: Check your `tailwind.config.cjs`:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: 'class', // Make sure this is set
  theme: {
    extend: {},
  },
  plugins: [],
};
```

### 4. Import Path Issues

**Problem**: Cannot find module './theme' or similar errors.

**Solution**: Check your import paths:

```jsx
// Correct import from components
import { useTheme } from '../../theme';

// Correct import from pages
import { useTheme } from '../theme';

// Correct import from theme directory
import { useTheme } from './index';
```

### 5. Component Styling Not Applying

**Problem**: Theme classes not working as expected.

**Solution**: Make sure you're using the theme functions correctly:

```jsx
// ✅ Correct usage
const { getComponentClass } = useTheme();
<div className={getComponentClass('card', 'base')}>

// ❌ Incorrect usage
<div className="card base">
```

### 6. Build Errors

**Problem**: Vite or build tool errors.

**Solution**: 
1. Clear your node_modules and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

2. Restart your development server:
```bash
npm run dev
```

## Testing the Theme System

### Quick Test

Add this to your `App.jsx` temporarily:

```jsx
import SimpleTest from './theme/SimpleTest';

// Add this route for testing
<Route path="/test" element={<SimpleTest />} />
```

Then visit `http://localhost:5173/test` to see if the theme system works.

### Manual Test

1. **Check Console**: Look for any JavaScript errors
2. **Check Network**: Ensure all files are loading
3. **Check Elements**: Inspect DOM to see if classes are applied
4. **Test Dark Mode**: Click theme toggle and check if classes change

## Debug Mode

Add this to any component to debug theme values:

```jsx
import { useTheme } from '../theme';

function MyComponent() {
  const theme = useTheme();
  
  console.log('Theme context:', theme);
  console.log('Is dark mode:', theme.isDarkMode);
  console.log('Theme object:', theme.theme);
  
  return <div>...</div>;
}
```

## Common Fixes

### 1. Clear Browser Cache
- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Clear browser cache and cookies

### 2. Check File Structure
Make sure your theme directory structure is correct:
```
frontend/src/theme/
├── index.js
├── theme.js
├── ThemeProvider.jsx
├── README.md
├── INTEGRATION_GUIDE.md
├── TROUBLESHOOTING.md
├── SimpleTest.jsx
└── ThemeTest.jsx
```

### 3. Verify Dependencies
Make sure you have the required dependencies in `package.json`:
```json
{
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}
```

## Still Having Issues?

If you're still experiencing problems:

1. **Check the browser console** for specific error messages
2. **Verify all files** are in the correct locations
3. **Test with SimpleTest component** first
4. **Check your React version** (should be 16.8+ for hooks)
5. **Ensure Tailwind CSS** is properly configured

## Getting Help

If none of these solutions work:

1. **Copy the exact error message** from the console
2. **Check which file** is causing the error
3. **Verify your React and Tailwind versions**
4. **Try the SimpleTest component** to isolate the issue

The theme system is designed to be robust and backward-compatible, so most issues can be resolved with these troubleshooting steps. 