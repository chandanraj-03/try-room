import React from 'react';

const GlassCard = ({ children, className = '', hover = true, ...props }) => {
  return (
    <div 
      className={`glass-card p-6 ${hover ? '' : 'hover:translate-y-0 hover:shadow-glass hover:bg-white/[0.04] hover:border-white/[0.08]'} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;
