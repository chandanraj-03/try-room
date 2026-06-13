import React from 'react';

const LoadingSpinner = ({ size = 'md', message = '' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4'
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div 
        className={`${sizeClasses[size]} rounded-full border-t-primary-500 border-r-primary-500 border-b-secondary-500 border-l-secondary-500 animate-spin-slow mb-4`}
        style={{ animationDuration: '1s' }}
      ></div>
      {message && <p className="text-gray-400 font-medium animate-pulse">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
