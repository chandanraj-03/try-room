import React, { useState } from 'react';
import GlassCard from './ui/GlassCard';
import AnimatedButton from './ui/AnimatedButton';

const UrlInput = ({ onAnalyze, isLoading }) => {
  const [url, setUrl] = useState('');
  const [platform, setPlatform] = useState(null);

  const detectPlatformLocally = (inputUrl) => {
    const urlLower = inputUrl.toLowerCase();
    if (urlLower.includes('amazon')) return { name: 'Amazon', icon: '🛒' };
    if (urlLower.includes('flipkart')) return { name: 'Flipkart', icon: '🛍️' };
    if (urlLower.includes('myntra')) return { name: 'Myntra', icon: '👗' };
    if (urlLower.includes('ajio')) return { name: 'Ajio', icon: '👔' };
    return null;
  };

  const handleUrlChange = (e) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    setPlatform(detectPlatformLocally(newUrl));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim()) {
      onAnalyze(url.trim());
    }
  };

  return (
    <GlassCard className="mb-6">
      <h3 className="text-xl font-heading font-bold mb-4">Analyze Product</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="relative">
          <input
            type="url"
            value={url}
            onChange={handleUrlChange}
            placeholder="Paste product URL (Amazon, Flipkart, etc.)"
            className="input-field pl-12 pr-4"
            required
            disabled={isLoading}
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            {platform ? platform.icon : '🔗'}
          </div>
          {platform && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium bg-white/10 px-2 py-1 rounded text-gray-300">
              {platform.name}
            </div>
          )}
        </div>
        
        <AnimatedButton type="submit" disabled={isLoading || !url.trim()} className="w-full">
          {isLoading ? 'Analyzing...' : 'Extract & Analyze'}
        </AnimatedButton>
      </form>
    </GlassCard>
  );
};

export default UrlInput;
