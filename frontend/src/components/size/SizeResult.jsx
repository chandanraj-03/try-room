import React from 'react';
import GlassCard from '../ui/GlassCard';

const SizeResult = ({ result }) => {
  if (!result) return null;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <GlassCard className="text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-accent-gradient"></div>
        <div className="text-sm text-gray-400 uppercase tracking-widest font-bold mb-4 mt-2">Recommended Size</div>
        
        <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-4 border-primary-500/30 bg-primary-500/10 mb-4 animate-pulse-glow">
          <span className="text-6xl font-heading font-black text-white">
            {result.recommended_size}
          </span>
        </div>
        
        <div className="text-emerald-400 font-medium mb-4">
          ✓ {result.confidence}% Match Confidence
        </div>

        {result.alternative_size && (
          <div className="text-sm text-gray-400 bg-white/5 inline-block px-4 py-2 rounded-lg border border-white/10">
            Also fits: <span className="font-bold text-white">{result.alternative_size}</span> (Tighter fit)
          </div>
        )}
      </GlassCard>

      <GlassCard>
        <h4 className="font-bold mb-4">Standard Size Chart</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-400">
            <thead className="text-xs text-gray-300 uppercase bg-white/5">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Size</th>
                <th className="px-4 py-3">Chest (in)</th>
                <th className="px-4 py-3 rounded-tr-lg">Waist (in)</th>
              </tr>
            </thead>
            <tbody>
              {result.size_chart.map((row, i) => (
                <tr 
                  key={row.size} 
                  className={`border-b border-white/5 ${row.size === result.recommended_size ? 'bg-primary-500/20 text-white font-bold' : ''}`}
                >
                  <td className="px-4 py-3">{row.size}</td>
                  <td className="px-4 py-3">{row.chest}</td>
                  <td className="px-4 py-3">{row.waist}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};

export default SizeResult;
