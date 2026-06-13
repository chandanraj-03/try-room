import React, { useState, useEffect } from 'react';
import GlassCard from '../ui/GlassCard';
import api from '../../services/api';

const RealTimeSuggestions = ({ productTitle, category, brand }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!productTitle || !category) return;

    const fetchSuggestions = async () => {
      setIsLoading(true);
      try {
        const response = await api.post('/api/suggestions/related', {
          product_title: productTitle,
          category: category,
          brand: brand || 'Generic'
        });
        if (response.data.success) {
          setSuggestions(response.data.suggestions);
        }
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [productTitle, category, brand]);

  if (!productTitle) return null;

  return (
    <div className="mt-8 animate-fade-in-up animate-delay-200">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-xl font-bold text-white">Complete the Look</h3>
        <span className="bg-primary-500/20 text-primary-400 text-xs px-2 py-0.5 rounded font-bold">AI Picks</span>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
             <div key={i} className="h-48 rounded-xl bg-white/5 animate-pulse"></div>
          ))}
        </div>
      ) : suggestions.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {suggestions.map((item) => (
            <GlassCard key={item.id} className="p-3 flex flex-col hover:-translate-y-1 transition-transform cursor-pointer">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-dark-900 mb-3">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs text-white font-medium">
                  {item.reason}
                </div>
              </div>
              <h4 className="text-sm font-bold text-gray-200 line-clamp-1 mb-1">{item.title}</h4>
              <p className="text-primary-400 font-bold text-sm">₹{item.price}</p>
            </GlassCard>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 italic">No styling suggestions available at this time.</p>
      )}
    </div>
  );
};

export default RealTimeSuggestions;
