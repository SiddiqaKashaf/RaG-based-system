import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineArrowLeft } from 'react-icons/hi';
import { useTheme } from '../theme';

export default function BackButton({ className = '', children = 'Back' }) {
  const navigate = useNavigate();
  const { getComponentClass } = useTheme();

  return (
    <button
      onClick={() => navigate(-1)}
      className={`flex items-center gap-2 px-4 py-2 ${getComponentClass('text', 'secondary')} hover:${getComponentClass('background', 'secondary')} rounded-lg transition-colors ${className}`}
    >
      <HiOutlineArrowLeft size={16} />
      {children ? children : null}
    </button>
  );
} 