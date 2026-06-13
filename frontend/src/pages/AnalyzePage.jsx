import React, { useState } from 'react';
import GlassCard from '../components/ui/GlassCard';
import UrlInput from '../components/UrlInput';
import ScreenshotUpload from '../components/ScreenshotUpload';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import SizeForm from '../components/size/SizeForm';
import SizeResult from '../components/size/SizeResult';
import RealTimeSuggestions from '../components/suggestions/RealTimeSuggestions';
import api from '../services/api';

const AnalyzePage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showScreenshotFallback, setShowScreenshotFallback] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [activeTab, setActiveTab] = useState('reviews');
  const [sizeResult, setSizeResult] = useState(null);
  const [isSizeLoading, setIsSizeLoading] = useState(false);

  const handleUrlAnalyze = async (url) => {
    setIsLoading(true);
    setError(null);
    setShowScreenshotFallback(false);
    setLoadingMessage('Scraping product data...');

    try {
      const response = await api.post('/api/products/analyze-url', { url });
      
      if (response.data.screenshot_required) {
        setShowScreenshotFallback(true);
      } else if (response.data.success) {
        setAnalysisResult(response.data);
      } else {
        setError(response.data.message || 'Analysis failed. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while analyzing the URL.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleScreenshotUpload = async (file) => {
    setIsLoading(true);
    setError(null);
    setLoadingMessage('Extracting data via OCR...');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/api/products/analyze-screenshot', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setAnalysisResult(response.data);
        setShowScreenshotFallback(false);
      } else {
        setError(response.data.message || 'OCR extraction failed. Please try a clearer screenshot.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred during OCR processing.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleSizeSubmit = async (data) => {
    setIsSizeLoading(true);
    try {
      const payload = {
        ...data,
        brand: analysisResult?.product?.brand
      };
      const response = await api.post('/api/products/size-predict', payload);
      setSizeResult(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSizeLoading(false);
    }
  };

  const cancelFallback = () => {
    setShowScreenshotFallback(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Input & Product Card */}
        <div className="lg:col-span-5 space-y-6">
          <UrlInput onAnalyze={handleUrlAnalyze} isLoading={isLoading && !showScreenshotFallback} />
          
          {showScreenshotFallback && (
            <ScreenshotUpload 
              onUpload={handleScreenshotUpload} 
              isLoading={isLoading} 
              onCancel={cancelFallback}
            />
          )}

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm animate-fade-in-up">
              {error}
            </div>
          )}

          {isLoading && !showScreenshotFallback && (
            <GlassCard className="flex flex-col items-center justify-center p-12">
              <LoadingSpinner size="lg" message={loadingMessage} />
            </GlassCard>
          )}

          {analysisResult && !isLoading && (
            <GlassCard className="animate-fade-in-up">
              <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-dark-900 mb-6">
                {analysisResult.product.images?.length > 0 ? (
                  <img 
                    src={analysisResult.product.images[0]} 
                    alt={analysisResult.product.title} 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    No Image
                  </div>
                )}
                {analysisResult.product.extracted_via === 'screenshot_ocr' && (
                  <div className="absolute top-2 left-2 bg-amber-500/80 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-white">
                    Extracted via OCR
                  </div>
                )}
              </div>
              
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-bold text-white line-clamp-2 pr-4">
                  {analysisResult.product.title}
                </h2>
                <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded text-sm font-medium">
                  <span className="text-yellow-400">★</span>
                  <span>{analysisResult.product.rating}</span>
                </div>
              </div>
              
              <div className="text-sm text-gray-400 mb-4">{analysisResult.product.brand}</div>
              
              <div className="text-3xl font-bold text-white mb-6">
                {analysisResult.product.currency === 'INR' ? '₹' : '$'}
                {analysisResult.product.price.toLocaleString()}
              </div>
            </GlassCard>
          )}

          {analysisResult && !isLoading && !showScreenshotFallback && (
            <RealTimeSuggestions 
              productTitle={analysisResult.product.title} 
              category={analysisResult.product.category || 'Clothing'} 
              brand={analysisResult.product.brand} 
            />
          )}
        </div>

        {/* RIGHT COLUMN: Analysis Dashboard */}
        <div className="lg:col-span-7">
          {!analysisResult && !isLoading ? (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
              <div className="text-6xl mb-4 opacity-50">✨</div>
              <h3 className="text-2xl font-heading font-bold text-gray-300 mb-2">Ready to Analyze</h3>
              <p className="text-gray-500 max-w-sm">
                Paste a product URL to the left to see AI-powered review intelligence, sentiment analysis, and a Buy Confidence Score.
              </p>
            </div>
          ) : analysisResult && !isLoading ? (
            <div className="space-y-6 animate-fade-in-up animate-delay-100">
              <h2 className="section-title mb-6">Review Intelligence</h2>
              
              {/* Tabs */}
              <div className="flex border-b border-white/10 mb-6">
                <button 
                  onClick={() => setActiveTab('reviews')}
                  className={`px-6 py-3 font-medium text-sm transition-all ${activeTab === 'reviews' ? 'text-primary-400 border-b-2 border-primary-500' : 'text-gray-400 hover:text-white'}`}
                >
                  Review Insights
                </button>
                <button 
                  onClick={() => setActiveTab('size')}
                  className={`px-6 py-3 font-medium text-sm transition-all ${activeTab === 'size' ? 'text-primary-400 border-b-2 border-primary-500' : 'text-gray-400 hover:text-white'}`}
                >
                  Size Guide
                </button>
              </div>

              {/* Tab Content: Reviews */}
              {activeTab === 'reviews' && (
                <>
                  <GlassCard>
                    <div className="flex flex-col md:flex-row gap-8">
                      {/* Score */}
                      <div className="flex flex-col items-center justify-center md:w-1/3 border-b md:border-b-0 md:border-r border-white/10 pb-6 md:pb-0 md:pr-6">
                         <div className="text-sm text-gray-400 uppercase tracking-wider font-bold mb-4">Buy Confidence</div>
                         <div className="relative w-32 h-32 flex items-center justify-center">
                            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                              <circle cx="64" cy="64" r="56" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                              <circle 
                                cx="64" cy="64" r="56" fill="none" 
                                stroke={analysisResult.analysis.buy_confidence.score >= 7 ? "#10B981" : analysisResult.analysis.buy_confidence.score >= 5 ? "#F59E0B" : "#EF4444"} 
                                strokeWidth="8" 
                                strokeDasharray="351.8" 
                                strokeDashoffset={351.8 - (351.8 * analysisResult.analysis.buy_confidence.score) / 10} 
                                className="transition-all duration-1000 ease-out"
                              />
                            </svg>
                            <div className="text-center">
                              <div className="text-4xl font-bold text-white">{analysisResult.analysis.buy_confidence.score}</div>
                              <div className="text-xs text-gray-400">/ 10</div>
                            </div>
                         </div>
                         <div className={`mt-4 px-3 py-1 rounded-full text-sm font-bold
                            ${analysisResult.analysis.buy_confidence.grade === 'A' ? 'bg-emerald-500/20 text-emerald-400' :
                              analysisResult.analysis.buy_confidence.grade === 'B' ? 'bg-cyan-500/20 text-cyan-400' :
                              analysisResult.analysis.buy_confidence.grade === 'C' ? 'bg-amber-500/20 text-amber-400' :
                              'bg-red-500/20 text-red-400'}
                         `}>
                           Grade: {analysisResult.analysis.buy_confidence.grade}
                         </div>
                      </div>

                      {/* Summary */}
                      <div className="md:w-2/3">
                        <div className="text-sm text-gray-400 uppercase tracking-wider font-bold mb-3">AI Summary</div>
                        <p className="text-gray-300 leading-relaxed italic border-l-2 border-primary-500 pl-4">
                          "{analysisResult.analysis.summary_text}"
                        </p>
                      </div>
                    </div>
                  </GlassCard>

                  {/* Pros and Cons */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <GlassCard className="border-t-2 border-t-emerald-500">
                      <h3 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                        <span className="bg-emerald-500/20 p-1 rounded">👍</span> Top Pros
                      </h3>
                      <ul className="space-y-3">
                        {analysisResult.analysis.pros.map((pro, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                            <span className="text-emerald-500 mt-0.5">✓</span> <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </GlassCard>
                    
                    <GlassCard className="border-t-2 border-t-red-500">
                      <h3 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
                        <span className="bg-red-500/20 p-1 rounded">👎</span> Top Cons
                      </h3>
                      <ul className="space-y-3">
                        {analysisResult.analysis.cons.map((con, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                            <span className="text-red-500 mt-0.5">✕</span> <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    </GlassCard>
                  </div>
                </>
              )}

              {/* Tab Content: Size */}
              {activeTab === 'size' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SizeForm onSubmit={handleSizeSubmit} isLoading={isSizeLoading} />
                  <div>
                    {sizeResult ? (
                      <SizeResult result={sizeResult} />
                    ) : (
                      <GlassCard className="h-full flex flex-col items-center justify-center text-center p-8 opacity-50">
                        <div className="text-4xl mb-4">📏</div>
                        <p>Enter your details on the left to get your personalized AI size recommendation.</p>
                      </GlassCard>
                    )}
                  </div>
                </div>
              )}

            </div>
          ) : null}
        </div>
        
      </div>
    </div>
  );
};

export default AnalyzePage;
