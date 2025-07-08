import React from 'react';
import { useTheme } from './index';

/**
 * Simple test component to verify theme system works
 * Add this to your App.jsx temporarily to test
 */
export default function SimpleTest() {
  const { isDarkMode, toggleDarkMode, getComponentClass } = useTheme();

  return (
    <div className="p-8">
      <div className={getComponentClass('card', 'base')}>
        <h1 className={getComponentClass('typography', 'h1')}>
          Theme System Test
        </h1>
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
    </div>
  );
} 