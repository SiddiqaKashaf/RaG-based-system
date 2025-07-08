import React, { createContext, useState, useContext } from 'react';

const NavBarContext = createContext();

export const useNavBar = () => useContext(NavBarContext);

export const NavBarProvider = ({ children }) => {
  const [expanded, setExpanded] = useState(false);
  const toggleExpanded = () => setExpanded((prev) => !prev);
  return (
    <NavBarContext.Provider value={{ expanded, setExpanded, toggleExpanded }}>
      {children}
    </NavBarContext.Provider>
  );
}; 