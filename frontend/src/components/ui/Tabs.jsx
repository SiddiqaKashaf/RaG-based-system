import * as React from "react";
import { useTheme } from '../../theme';

export function Tabs({ children }) {
  return <div className="tabs">{children}</div>;
}

export function TabsList({ children }) {
  return <div className="tabs-list">{children}</div>;
}

export function TabsTrigger({ children, active, onClick }) {
  const { getComponentClass } = useTheme();
  
  return (
    <button 
      className={`tabs-trigger text-sm font-medium tracking-wide px-4 py-1 rounded-md transition ${
        active 
          ? `${getComponentClass('text', 'accent')} ${getComponentClass('status', 'info', 'bg')}` 
          : `${getComponentClass('text', 'secondary')} hover:${getComponentClass('background', 'secondary')}`
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function TabsContent({ children }) {
  return <div className="tabs-content">{children}</div>;
}
