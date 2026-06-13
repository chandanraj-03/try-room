import React, { useState, useRef } from 'react';
import GlassCard from './ui/GlassCard';
import AnimatedButton from './ui/AnimatedButton';

const ScreenshotUpload = ({ onUpload, isLoading, onCancel }) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    if (selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = () => {
    if (file) {
      onUpload(file);
    }
  };

  return (
    <GlassCard className="mb-6 border-warning/50 relative overflow-hidden animate-fade-in-up">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-warning to-danger"></div>
      
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-heading font-bold text-amber-400 flex items-center gap-2">
          <span>⚠️</span> Scraping Failed
        </h3>
        <button onClick={onCancel} className="text-gray-400 hover:text-white transition-colors">
          ✕
        </button>
      </div>
      
      <p className="text-gray-300 text-sm mb-6">
        We couldn't scrape the data directly from that URL. Please upload a screenshot of the product page containing the title, price, and rating. Our OCR engine will extract the details.
      </p>

      {!preview ? (
        <div 
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${dragActive ? 'border-primary-500 bg-primary-500/10' : 'border-white/20 bg-white/5 hover:border-primary-400/50'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp"
            onChange={handleChange}
            className="hidden"
          />
          <div className="text-4xl mb-4">📸</div>
          <p className="text-white font-medium mb-1">Click to upload or drag and drop</p>
          <p className="text-gray-400 text-sm">PNG, JPG or WEBP (max. 5MB)</p>
        </div>
      ) : (
        <div className="bg-dark-800 rounded-xl overflow-hidden border border-white/10 mb-6">
          <div className="relative h-48 bg-dark-900 flex items-center justify-center overflow-hidden group">
            <img src={preview} alt="Preview" className="max-w-full max-h-full object-contain" />
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => { setFile(null); setPreview(null); }}
                className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg backdrop-blur-md"
              >
                Remove Image
              </button>
            </div>
          </div>
          <div className="p-3 bg-white/5 border-t border-white/10 flex justify-between items-center text-sm">
            <span className="text-gray-300 truncate pr-4">{file.name}</span>
            <span className="text-gray-500 flex-shrink-0">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
          </div>
        </div>
      )}

      {preview && (
        <AnimatedButton 
          onClick={handleSubmit} 
          disabled={isLoading} 
          className="w-full mt-4"
          icon="✨"
        >
          {isLoading ? 'Extracting Data via OCR...' : 'Analyze Screenshot'}
        </AnimatedButton>
      )}
    </GlassCard>
  );
};

export default ScreenshotUpload;
