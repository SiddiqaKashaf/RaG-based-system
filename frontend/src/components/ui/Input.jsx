import React from 'react';
import { useTheme } from '../../theme';

export function Input({ label, type = 'text', placeholder, value, onChange, className }) {
  const { getComponentClass } = useTheme();
  
  return (
    <div className={`flex flex-col mb-4 ${className}`}>
      {label && (
        <label className={`mb-1 font-medium ${getComponentClass('text', 'primary')}`} htmlFor={label}>
          {label}
        </label>
      )}
      <input
        id={label}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`border ${getComponentClass('border', 'primary')} rounded-lg px-3 py-2 ${getComponentClass('background', 'card')} ${getComponentClass('text', 'primary')} focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition`}
      />
    </div>
  );
}
