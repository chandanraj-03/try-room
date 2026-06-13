import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-dark-900 border-t border-white/5 pt-12 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-accent-gradient flex items-center justify-center text-white font-bold text-xs">
              F
            </div>
            <span className="font-heading font-bold text-lg text-white">FashionAI</span>
          </div>
          
          <div className="flex gap-6 text-sm text-gray-400">
            <Link to="/analyze" className="hover:text-primary-400 transition-colors">Analyzer</Link>
            <Link to="/try-on" className="hover:text-primary-400 transition-colors">Virtual Try-On</Link>
            <Link to="/compare" className="hover:text-primary-400 transition-colors">Compare</Link>
            <a href="#" className="hover:text-primary-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary-400 transition-colors">Terms</a>
          </div>
        </div>
        
        <div className="mt-8 text-center text-xs text-gray-600">
          &copy; {new Date().getFullYear()} Universal AI Fashion Try-On Platform. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
