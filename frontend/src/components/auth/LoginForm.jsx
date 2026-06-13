import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import GlassCard from '../ui/GlassCard';
import AnimatedButton from '../ui/AnimatedButton';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/dashboard'); // Or wherever appropriate
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to log in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GlassCard className="w-full max-w-md mx-auto p-8 animate-fade-in-up">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-heading font-bold text-white mb-2">Welcome Back</h2>
        <p className="text-gray-400">Sign in to your FashionAI account</p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field w-full px-4 py-3"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field w-full px-4 py-3"
            placeholder="••••••••"
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center text-gray-400">
            <input type="checkbox" className="mr-2 rounded border-white/20 bg-dark-900 text-primary-500 focus:ring-primary-500 focus:ring-offset-dark-900" />
            Remember me
          </label>
          <a href="#" className="text-primary-400 hover:text-primary-300 transition-colors">Forgot password?</a>
        </div>

        <AnimatedButton type="submit" disabled={isLoading} className="w-full py-3 mt-4">
          {isLoading ? 'Signing In...' : 'Sign In'}
        </AnimatedButton>
      </form>

      <p className="mt-8 text-center text-sm text-gray-400">
        Don't have an account? <Link to="/register" className="text-primary-400 hover:text-white font-medium transition-colors">Sign up</Link>
      </p>
    </GlassCard>
  );
};

export default LoginForm;
