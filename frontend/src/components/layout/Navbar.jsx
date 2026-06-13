import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'active text-white' : '';

  return (
    <nav className="sticky top-0 z-40 w-full bg-dark-900/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent-gradient flex items-center justify-center text-white font-bold text-xl shadow-neon">
                F
              </div>
              <span className="font-heading font-bold text-xl tracking-tight text-white">
                Fashion<span className="text-primary-400">AI</span>
              </span>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link to="/analyze" className={`nav-link px-3 py-2 rounded-md font-medium ${isActive('/analyze')}`}>
                Analyze
              </Link>
              <Link to="/try-on" className={`nav-link px-3 py-2 rounded-md font-medium ${isActive('/try-on')}`}>
                Virtual Try-On
              </Link>
              <Link to="/compare" className={`nav-link px-3 py-2 rounded-md font-medium ${isActive('/compare')}`}>
                Compare
              </Link>
            </div>
          </div>

          <div className="hidden md:block">
            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/dashboard" className="text-sm font-medium text-gray-300 hover:text-white">
                  {user.name}
                </Link>
                <button 
                  onClick={logout}
                  className="px-4 py-2 rounded-lg text-sm font-medium border border-white/10 hover:bg-white/5 transition-colors text-gray-300 hover:text-white"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                  Log in
                </Link>
                <Link to="/register" className="px-4 py-2 rounded-lg text-sm font-medium bg-primary-600 hover:bg-primary-500 text-white transition-colors shadow-lg shadow-primary-500/20">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
