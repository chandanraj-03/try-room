import React, { useState } from 'react';
import GlassCard from '../ui/GlassCard';
import AnimatedButton from '../ui/AnimatedButton';

const SizeForm = ({ onSubmit, isLoading }) => {
  const [heightCm, setHeightCm] = useState(170);
  const [weightKg, setWeightKg] = useState(70);
  const [bodyType, setBodyType] = useState('regular');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      height_cm: heightCm,
      weight_kg: weightKg,
      body_type: bodyType
    });
  };

  return (
    <GlassCard>
      <h3 className="text-xl font-heading font-bold mb-6">Find Your Perfect Size</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium text-gray-300">Height</label>
            <span className="text-primary-400 font-bold">{heightCm} cm</span>
          </div>
          <input 
            type="range" 
            min="140" 
            max="210" 
            value={heightCm} 
            onChange={(e) => setHeightCm(Number(e.target.value))}
            className="w-full accent-primary-500"
          />
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium text-gray-300">Weight</label>
            <span className="text-primary-400 font-bold">{weightKg} kg</span>
          </div>
          <input 
            type="range" 
            min="40" 
            max="150" 
            value={weightKg} 
            onChange={(e) => setWeightKg(Number(e.target.value))}
            className="w-full accent-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">Body Type</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {['slim', 'regular', 'athletic', 'plus'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setBodyType(type)}
                className={`py-2 rounded-xl text-sm font-medium capitalize border transition-all ${
                  bodyType === type 
                    ? 'bg-primary-500/20 border-primary-500 text-white shadow-neon' 
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <AnimatedButton type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Calculating...' : 'Get Size Recommendation'}
        </AnimatedButton>
      </form>
    </GlassCard>
  );
};

export default SizeForm;
