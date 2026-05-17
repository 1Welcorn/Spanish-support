import React from 'react';
import { Home } from 'lucide-react';

interface HomeButtonProps {
  onClick: () => void;
  size?: number;
  className?: string;
}

export const HomeButton: React.FC<HomeButtonProps> = ({ onClick, size = 48, className = '' }) => {
  return (
    <button 
      onClick={onClick}
      className={`home-button-premium ${className}`}
      style={{
        background: 'white',
        border: '2px solid var(--border)',
        padding: '10px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        width: size,
        height: size,
        borderRadius: '50%',
        boxShadow: 'var(--shadow-soft)',
        color: 'var(--ink2)'
      }}
      onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.92)')}
      onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)';
        e.currentTarget.style.background = 'var(--color-cloud-core)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.background = 'white';
      }}
    >
      <Home size={size * 0.6} strokeWidth={2.5} />
    </button>
  );
};
