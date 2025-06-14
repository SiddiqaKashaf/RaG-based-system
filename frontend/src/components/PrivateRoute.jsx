import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    // Redirect to login if there's no token
    return <Navigate to="/login" replace />;
  }

  // If there's a token, render the protected component
  return children;
};

export default PrivateRoute; 