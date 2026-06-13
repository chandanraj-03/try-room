import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';

// Placeholder Pages
import LandingPage from './pages/LandingPage';
import AnalyzePage from './pages/AnalyzePage';
import VirtualTryOn from './pages/VirtualTryOn';
import ComparePage from './pages/ComparePage';
import AuthPage from './pages/AuthPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<LandingPage />} />
            <Route path="analyze" element={<AnalyzePage />} />
            <Route path="try-on" element={<VirtualTryOn />} />
            <Route path="compare" element={<ComparePage />} />
            <Route path="dashboard" element={<div className="p-8 text-center">Dashboard</div>} />
            <Route path="login" element={<AuthPage type="Login" />} />
            <Route path="register" element={<AuthPage type="Register" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
