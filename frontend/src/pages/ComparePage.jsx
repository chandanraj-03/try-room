import React, { useState } from 'react';
import GlassCard from '../components/ui/GlassCard';
import AnimatedButton from '../components/ui/AnimatedButton';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import api from '../services/api';

const ComparePage = () => {
  const [url1, setUrl1] = useState('');
  const [url2, setUrl2] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [comparison, setComparison] = useState(null);

  const handleCompare = async (e) => {
    e.preventDefault();
    if (!url1 || !url2) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // For the demo, we'll hit the analyze-url endpoint for both
      // In a real production app we'd have a batch/compare endpoint that optimizes this
      const [res1, res2] = await Promise.all([
        api.post('/api/products/analyze-url', { url: url1 }),
        api.post('/api/products/analyze-url', { url: url2 })
      ]);

      if (res1.data.success && res2.data.success) {
        setComparison({
          product1: res1.data,
          product2: res2.data
        });
      } else {
        setError("Failed to analyze one or both products. They might require screenshot fallback.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred during comparison.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-10 animate-fade-in-up">
        <h1 className="text-4xl font-heading font-bold text-white mb-4">Product Comparison</h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Compare two products side-by-side using our AI Review Intelligence to see which one truly offers the best value.
        </p>
      </div>

      <GlassCard className="mb-10 animate-fade-in-up animate-delay-100">
        <form onSubmit={handleCompare} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-300 mb-1">Product 1 URL</label>
            <input
              type="url"
              required
              value={url1}
              onChange={(e) => setUrl1(e.target.value)}
              className="input-field w-full px-4 py-3"
              placeholder="https://..."
            />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-300 mb-1">Product 2 URL</label>
            <input
              type="url"
              required
              value={url2}
              onChange={(e) => setUrl2(e.target.value)}
              className="input-field w-full px-4 py-3"
              placeholder="https://..."
            />
          </div>
          <AnimatedButton type="submit" disabled={isLoading || !url1 || !url2} className="w-full md:w-auto px-8 py-3 h-[46px]">
            {isLoading ? 'Comparing...' : 'Compare Products'}
          </AnimatedButton>
        </form>
      </GlassCard>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center mb-8 animate-fade-in">
          {error}
        </div>
      )}

      {isLoading && (
         <div className="flex justify-center p-12">
            <LoadingSpinner size="lg" message="Analyzing reviews and extracting data..." />
         </div>
      )}

      {comparison && !isLoading && (
        <div className="animate-fade-in-up">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <ProductCompareCard data={comparison.product1} />
            <ProductCompareCard data={comparison.product2} />
          </div>

          <GlassCard>
            <h3 className="text-xl font-bold text-white mb-6">Head-to-Head</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-gray-300 border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="py-4 px-4 font-medium text-gray-400 w-1/4">Metric</th>
                    <th className="py-4 px-4 font-medium w-3/8 text-center border-l border-white/10">Product 1</th>
                    <th className="py-4 px-4 font-medium w-3/8 text-center border-l border-white/10">Product 2</th>
                  </tr>
                </thead>
                <tbody>
                  <CompareRow 
                    label="Price" 
                    v1={`₹${comparison.product1.product.price}`} 
                    v2={`₹${comparison.product2.product.price}`} 
                    better={comparison.product1.product.price < comparison.product2.product.price ? 1 : 2}
                  />
                  <CompareRow 
                    label="Rating" 
                    v1={`${comparison.product1.product.rating} ★`} 
                    v2={`${comparison.product2.product.rating} ★`} 
                    better={comparison.product1.product.rating > comparison.product2.product.rating ? 1 : 2}
                  />
                  <CompareRow 
                    label="Buy Confidence" 
                    v1={`${comparison.product1.analysis.buy_confidence.score}/10`} 
                    v2={`${comparison.product2.analysis.buy_confidence.score}/10`} 
                    better={comparison.product1.analysis.buy_confidence.score > comparison.product2.analysis.buy_confidence.score ? 1 : 2}
                  />
                  <CompareRow 
                    label="Positive Sentiment" 
                    v1={`${comparison.product1.analysis.sentiment_summary.positive_pct}%`} 
                    v2={`${comparison.product2.analysis.sentiment_summary.positive_pct}%`} 
                    better={comparison.product1.analysis.sentiment_summary.positive_pct > comparison.product2.analysis.sentiment_summary.positive_pct ? 1 : 2}
                  />
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

const ProductCompareCard = ({ data }) => {
  const { product, analysis } = data;
  return (
    <GlassCard className="flex flex-col h-full">
      <div className="flex gap-4 mb-4">
        <div className="w-24 h-24 rounded-lg bg-white/5 flex items-center justify-center overflow-hidden flex-shrink-0">
          {product.images?.length > 0 ? (
            <img src={product.images[0]} alt="product" className="w-full h-full object-contain" />
          ) : (
            <span className="text-gray-500 text-xs">No Image</span>
          )}
        </div>
        <div>
          <h3 className="font-bold text-white line-clamp-2 leading-tight mb-1">{product.title}</h3>
          <p className="text-sm text-gray-400 mb-2">{product.brand}</p>
          <div className="text-xl font-bold text-primary-400">
            {product.currency === 'INR' ? '₹' : '$'}{product.price.toLocaleString()}
          </div>
        </div>
      </div>
      
      <div className="flex-grow">
        <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">AI Summary</div>
        <p className="text-sm text-gray-300 italic border-l-2 border-primary-500 pl-3">
          "{analysis.summary_text}"
        </p>
      </div>
    </GlassCard>
  );
};

const CompareRow = ({ label, v1, v2, better }) => (
  <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
    <td className="py-4 px-4 text-sm font-medium">{label}</td>
    <td className={`py-4 px-4 text-center border-l border-white/10 ${better === 1 ? 'text-emerald-400 font-bold bg-emerald-500/5' : ''}`}>
      {v1} {better === 1 && '🏆'}
    </td>
    <td className={`py-4 px-4 text-center border-l border-white/10 ${better === 2 ? 'text-emerald-400 font-bold bg-emerald-500/5' : ''}`}>
      {v2} {better === 2 && '🏆'}
    </td>
  </tr>
);

export default ComparePage;
