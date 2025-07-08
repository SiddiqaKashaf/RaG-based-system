import React from 'react';
import { useTheme } from './index';

/**
 * Simple test component to verify theme system functionality
 * You can temporarily add this to your App.jsx to test the theme system
 */
export default function ThemeTest() {
  const { 
    theme, 
    getComponentClass, 
    getGradient, 
    getStatusClass,
    isDarkMode,
    toggleDarkMode 
  } = useTheme();

  return (
    <div className="p-8">
      <div className={`${getComponentClass('card', 'base')} p-6 mb-6`}>
        <h1 className={getComponentClass('typography', 'h1')}>Theme System Test</h1>
        <p className={getComponentClass('typography', 'body')}>
          Current theme: {isDarkMode ? 'Dark' : 'Light'}
        </p>
        <button 
          onClick={toggleDarkMode}
          className={getComponentClass('button', 'primary')}
        >
          Toggle Theme
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className={`${getComponentClass('card', 'base')} p-6`}>
          <h2 className={getComponentClass('typography', 'h2')}>Form Test</h2>
          <input 
            className={getComponentClass('form', 'input')}
            placeholder="Test input"
          />
          <button className={getComponentClass('form', 'button.primary')}>
            Test Button
          </button>
        </div>

        <div className={`${getComponentClass('card', 'base')} p-6`}>
          <h2 className={getComponentClass('typography', 'h2')}>Status Test</h2>
          <div className={`p-3 rounded-lg mb-2 ${getStatusClass('success')}`}>
            Success message
          </div>
          <div className={`p-3 rounded-lg mb-2 ${getStatusClass('info')}`}>
            Info message
          </div>
          <div className={`p-3 rounded-lg mb-2 ${getStatusClass('warning')}`}>
            Warning message
          </div>
          <div className={`p-3 rounded-lg ${getStatusClass('error')}`}>
            Error message
          </div>
        </div>
      </div>

      <div className={`${getComponentClass('card', 'base')} p-6`}>
        <h2 className={getComponentClass('typography', 'h2')}>Gradient Test</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className={`${getComponentClass('featureCard', 'base')} bg-gradient-to-br ${getGradient('search')} p-4`}>
            Search
          </div>
          <div className={`${getComponentClass('featureCard', 'base')} bg-gradient-to-br ${getGradient('aiAssistant')} p-4`}>
            AI Assistant
          </div>
          <div className={`${getComponentClass('featureCard', 'base')} bg-gradient-to-br ${getGradient('analytics')} p-4`}>
            Analytics
          </div>
        </div>
      </div>
    </div>
  );
} 