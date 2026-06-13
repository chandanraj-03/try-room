import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import GlassCard from '../ui/GlassCard';
import AnimatedButton from '../ui/AnimatedButton';

const RegisterForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await register(name, email, password);
      navigate('/dashboard'); 
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GlassCard className="w-full max-w-md mx-auto p-8 animate-fade-in-up">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-heading font-bold text-white mb-2">Create Account</h2>
        <p className="text-gray-400">Join FashionAI to save your measurements and history</p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field w-full px-4 py-3"
            placeholder="John Doe"
            minLength="2"
          />
        </div>

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
            minLength="6"
          />
        </div>

        <AnimatedButton type="submit" disabled={isLoading} className="w-full py-3 mt-4">
          {isLoading ? 'Creating Account...' : 'Sign Up'}
        </AnimatedButton>
      </form>

      <p className="mt-8 text-center text-sm text-gray-400">
        Already have an account? <Link to="/login" className="text-primary-400 hover:text-white font-medium transition-colors">Sign in</Link>
      </p>
    </GlassCard>
  );
};

export default RegisterForm;
