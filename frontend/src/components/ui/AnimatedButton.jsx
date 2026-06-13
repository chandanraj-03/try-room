import React from 'react';

const AnimatedButton = ({ 
  children, 
  variant = 'primary', 
  onClick, 
  disabled = false,
  className = '',
  type = 'button',
  icon = null
}) => {
  const baseClass = variant === 'primary' ? 'btn-primary' : 'btn-secondary';
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed transform-none' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClass} ${disabledClass} flex items-center justify-center gap-2 ${className}`}
    >
      {icon && <span className="text-lg">{icon}</span>}
      {children}
    </button>
  );
};

export default AnimatedButton;
