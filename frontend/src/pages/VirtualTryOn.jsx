import React, { useState, useEffect } from 'react';
import GlassCard from '../components/ui/GlassCard';
import AnimatedButton from '../components/ui/AnimatedButton';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import TryOnCanvas from '../components/tryon/TryOnCanvas';
import TryOnCanvas3D from '../components/tryon/TryOnCanvas3D';
import { useMediaPipe } from '../hooks/useMediaPipe';
import { useCamera } from '../hooks/useCamera';

// Placeholder mock assets
const MOCK_CLOTHING = [
  { id: '1', name: 'White T-Shirt', type: 'top', src: '/assets/clothing/tshirt_white.png', model3D: '/assets/clothing/tshirt.gltf', color: '#fff' },
  { id: '2', name: 'Black T-Shirt', type: 'top', src: '/assets/clothing/tshirt_black.png', model3D: '/assets/clothing/tshirt.gltf', color: '#111' },
  { id: '3', name: 'Denim Jacket', type: 'top', src: '/assets/clothing/jacket_denim.png', model3D: null, color: '#3b82f6' },
  { id: '4', name: 'Red Dress', type: 'dress', src: '/assets/clothing/dress_red.png', model3D: null, color: '#ef4444' },
];

const VirtualTryOn = () => {
  const { poseLandmarker, isLoading: mpLoading, error: mpError } = useMediaPipe();
  const { videoRef, isActive, startCamera, stopCamera, toggleCamera, error: camError } = useCamera();
  
  const [selectedClothing, setSelectedClothing] = useState(MOCK_CLOTHING[0]);
  const [scale, setScale] = useState(1.0);
  const [showLandmarks, setShowLandmarks] = useState(false);
  const [is3DMode, setIs3DMode] = useState(false);
  
  // Start camera automatically when component mounts and MP is ready
  useEffect(() => {
    if (!mpLoading && !mpError && !isActive) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [mpLoading, mpError]);

  const handleCapture = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = 'fashionai-tryon.png';
      a.click();
    }
  };

  if (mpLoading) {
    return (
      <div className="flex-grow flex items-center justify-center p-8">
        <GlassCard className="text-center p-12">
          <LoadingSpinner size="lg" message="Loading AI Vision Model..." />
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-heading font-bold text-white">Virtual Try-On</h1>
        <div className="flex gap-4">
          <AnimatedButton variant="secondary" onClick={() => setShowLandmarks(!showLandmarks)}>
            {showLandmarks ? 'Hide Landmarks' : 'Show Landmarks'}
          </AnimatedButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-grow min-h-0">
        
        {/* Main Camera View */}
        <div className="lg:col-span-3 relative rounded-2xl overflow-hidden bg-dark-900 border border-white/10 shadow-glass-lg flex items-center justify-center min-h-[500px]">
          
          {(camError || mpError) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 p-8 text-center">
              <div className="text-red-400 text-5xl mb-4">⚠️</div>
              <p className="text-white mb-4">{camError || mpError}</p>
              <AnimatedButton onClick={startCamera}>Try Camera Again</AnimatedButton>
            </div>
          )}

          {!isActive && !camError && !mpError && (
             <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                <LoadingSpinner message="Starting camera..." />
             </div>
          )}

          {/* Hidden video element for MediaPipe input and 3D background */}
          <video 
            ref={videoRef} 
            className={`absolute inset-0 w-full h-full object-cover ${is3DMode ? 'scale-x-[-1]' : 'hidden'}`} 
            playsInline 
            muted
          />

          {/* Render Canvas */}
          {is3DMode ? (
            <TryOnCanvas3D 
              poseLandmarker={poseLandmarker}
              videoRef={videoRef}
              isActive={isActive}
              clothingItem={selectedClothing}
              scaleAdjustment={scale}
              showLandmarks={showLandmarks}
            />
          ) : (
            <TryOnCanvas 
              poseLandmarker={poseLandmarker}
              videoRef={videoRef}
              isActive={isActive}
              clothingItem={selectedClothing}
              scaleAdjustment={scale}
              showLandmarks={showLandmarks}
            />
          )}

          {/* Mode Toggle */}
          <div className="absolute top-6 right-6 z-20 flex bg-dark-900/80 backdrop-blur-md rounded-lg p-1 border border-white/10">
            <button 
              onClick={() => setIs3DMode(false)}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${!is3DMode ? 'bg-primary-500 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              2D Mode
            </button>
            <button 
              onClick={() => setIs3DMode(true)}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${is3DMode ? 'bg-primary-500 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              3D Mode
            </button>
          </div>

          {/* Floating Camera Controls */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4 bg-dark-900/80 backdrop-blur-md px-6 py-3 rounded-full border border-white/10">
             <button onClick={toggleCamera} className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xl transition-colors" title="Flip Camera">
               🔄
             </button>
             <button onClick={handleCapture} className="w-12 h-12 rounded-full bg-white text-dark-900 hover:scale-110 flex items-center justify-center text-xl transition-transform" title="Capture">
               📸
             </button>
             <button onClick={isActive ? stopCamera : startCamera} className={`w-12 h-12 rounded-full ${isActive ? 'bg-red-500/20 text-red-500' : 'bg-emerald-500/20 text-emerald-500'} hover:bg-opacity-40 flex items-center justify-center text-xl transition-colors`} title={isActive ? "Stop Camera" : "Start Camera"}>
               {isActive ? '⏹' : '▶'}
             </button>
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="lg:col-span-1 overflow-y-auto pr-2">
          <GlassCard className="mb-6">
            <h3 className="text-lg font-bold text-white mb-4">Select Clothing</h3>
            <div className="grid grid-cols-2 gap-3">
              {MOCK_CLOTHING.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedClothing(item)}
                  className={`relative aspect-square rounded-xl border-2 transition-all overflow-hidden bg-white/5 ${selectedClothing?.id === item.id ? 'border-primary-500 shadow-neon' : 'border-transparent hover:border-white/20'}`}
                >
                  {/* Since we don't have real images yet, use a colored block + text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center" style={{ backgroundColor: `${item.color}20` }}>
                    <div className="w-8 h-8 rounded-full mb-2" style={{ backgroundColor: item.color }}></div>
                    <span className="text-xs font-medium text-gray-300">{item.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="text-lg font-bold text-white mb-4">Adjust Fit</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Size/Scale</span>
                  <span>{Math.round(scale * 100)}%</span>
                </div>
                <input 
                  type="range" 
                  min="0.5" 
                  max="1.5" 
                  step="0.05" 
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="w-full accent-primary-500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Stand back 3-5 feet from the camera so your upper body is clearly visible. Ensure good lighting for best tracking.
              </p>
            </div>
          </GlassCard>
        </div>

      </div>
    </div>
  );
};

export default VirtualTryOn;
