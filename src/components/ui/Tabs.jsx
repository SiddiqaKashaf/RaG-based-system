import * as React from "react";

export function Tabs({ children }) {
  return <div className="tabs">{children}</div>;
}

export function TabsList({ children }) {
  return <div className="tabs-list">{children}</div>;
}

export function TabsTrigger({ children }) {
  return (
    <button className="tabs-trigger text-sm font-medium tracking-wide px-4 py-1 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-400/20 transition">
      {children}
    </button>
  );
}


export function TabsContent({ children }) {
  return <div className="tabs-content">{children}</div>;
}
