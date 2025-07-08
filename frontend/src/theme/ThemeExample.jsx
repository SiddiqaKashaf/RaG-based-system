import React from 'react';
import { useTheme } from './index';
import { HiOutlineSearch, HiOutlineChatAlt2, HiOutlineChartBar } from 'react-icons/hi';

/**
 * Example component demonstrating theme system usage
 * This shows how to migrate from inline classes to the theme system
 */
export default function ThemeExample() {
  const { 
    theme, 
    getComponentClass, 
    getGradient, 
    getStatusClass,
    isDarkMode,
    toggleDarkMode 
  } = useTheme();

  // Example feature cards using theme system
  const featureCards = [
    {
      title: 'Enterprise Search',
      icon: <HiOutlineSearch size={24} />,
      description: 'Advanced semantic search across your entire document repository',
      gradient: 'search',
      stats: 'Enterprise-grade'
    },
    {
      title: 'AI Assistant',
      icon: <HiOutlineChatAlt2 size={24} />,
      description: 'Intelligent document analysis and insights generation',
      gradient: 'aiAssistant',
      stats: 'Powered by GPT-4'
    },
    {
      title: 'Analytics Hub',
      icon: <HiOutlineChartBar size={24} />,
      description: 'Comprehensive analytics and business intelligence',
      gradient: 'analytics',
      stats: 'Real-time Insights'
    }
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.background.gradient.light} dark:${theme.background.gradient.dark}`}>
      <div className={`${theme.spacing.container.maxWidth} mx-auto ${theme.spacing.container.padding} ${theme.spacing.section.padding}`}>
        
        {/* Header with theme toggle */}
        <div className={`${getComponentClass('card', 'base')} ${theme.spacing.card.padding} mb-8`}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className={getComponentClass('typography', 'h1')}>Theme System Demo</h1>
              <p className={getComponentClass('typography', 'body')}>
                Demonstrating the centralized theme system for DocThinker Enterprise
              </p>
            </div>
            <button 
              onClick={toggleDarkMode}
              className={getComponentClass('button', 'outline')}
            >
              {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className={`grid grid-cols-1 md:grid-cols-3 ${theme.spacing.card.gap} mb-8`}>
          {featureCards.map((card, index) => (
            <div
              key={card.title}
              className={`${getComponentClass('featureCard', 'base')} bg-gradient-to-br ${getGradient(card.gradient)}`}
            >
              <div className={getComponentClass('featureCard', 'icon')}>
                {card.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{card.title}</h3>
              <p className="text-sm mb-4 opacity-90">{card.description}</p>
              <span className={getComponentClass('featureCard', 'badge')}>
                {card.stats}
              </span>
            </div>
          ))}
        </div>

        {/* Status Examples */}
        <div className={`${getComponentClass('card', 'base')} ${theme.spacing.card.padding} mb-8`}>
          <h2 className={`${getComponentClass('typography', 'h2')} mb-4`}>Status Indicators</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`p-4 rounded-lg ${getStatusClass('success')}`}>
              <strong>Success:</strong> Operation completed successfully
            </div>
            <div className={`p-4 rounded-lg ${getStatusClass('info')}`}>
              <strong>Info:</strong> System maintenance scheduled
            </div>
            <div className={`p-4 rounded-lg ${getStatusClass('warning')}`}>
              <strong>Warning:</strong> Please review your settings
            </div>
            <div className={`p-4 rounded-lg ${getStatusClass('error')}`}>
              <strong>Error:</strong> Failed to process request
            </div>
          </div>
        </div>

        {/* Form Example */}
        <div className={`${getComponentClass('card', 'base')} ${theme.spacing.card.padding} mb-8`}>
          <h2 className={`${getComponentClass('typography', 'h2')} mb-4`}>Form Components</h2>
          <form className="space-y-4">
            <div>
              <label className={getComponentClass('form', 'label')}>
                Email Address
              </label>
              <input
                type="email"
                className={getComponentClass('form', 'input')}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className={getComponentClass('form', 'label')}>
                Message
              </label>
              <textarea
                rows="4"
                className={getComponentClass('form', 'input')}
                placeholder="Enter your message..."
              />
            </div>
            <div className="flex gap-4">
              <button type="submit" className={getComponentClass('form', 'button.primary')}>
                Submit
              </button>
              <button type="button" className={getComponentClass('button', 'secondary')}>
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Typography Examples */}
        <div className={`${getComponentClass('card', 'base')} ${theme.spacing.card.padding}`}>
          <h2 className={`${getComponentClass('typography', 'h2')} mb-4`}>Typography System</h2>
          <div className="space-y-4">
            <h1 className={getComponentClass('typography', 'h1')}>Heading 1 - Main Title</h1>
            <h2 className={getComponentClass('typography', 'h2')}>Heading 2 - Section Title</h2>
            <h3 className={getComponentClass('typography', 'h3')}>Heading 3 - Subsection Title</h3>
            <p className={getComponentClass('typography', 'body')}>
              This is body text that demonstrates the typography system. It provides consistent 
              styling across the application while maintaining readability and hierarchy.
            </p>
            <p className={getComponentClass('typography', 'caption')}>
              This is caption text used for smaller, secondary information.
            </p>
            <a href="#" className={getComponentClass('typography', 'link')}>
              This is a link with consistent styling
            </a>
          </div>
        </div>

      </div>
    </div>
  );
} 