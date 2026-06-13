import React from 'react';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';

const AuthPage = ({ type }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex items-center justify-center min-h-[calc(100vh-16rem)]">
      {type === 'Login' ? <LoginForm /> : <RegisterForm />}
    </div>
  );
};

export default AuthPage;
