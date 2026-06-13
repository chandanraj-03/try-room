/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0effe',
          100: '#dddafd',
          200: '#bbb5fb',
          300: '#9990f8',
          400: '#776bf5',
          500: '#6C63FF',
          600: '#5a4fe6',
          700: '#4840bf',
          800: '#363099',
          900: '#242072',
        },
        secondary: {
          50: '#e6fbff',
          100: '#b3f3ff',
          200: '#80ebff',
          300: '#4de3ff',
          400: '#1adbff',
          500: '#00D9FF',
          600: '#00aecc',
          700: '#008299',
          800: '#005766',
          900: '#002b33',
        },
        dark: {
          50: '#e8eaf0',
          100: '#c5c9d6',
          200: '#9ea4b8',
          300: '#767f9a',
          400: '#586383',
          500: '#3a476c',
          600: '#2d3755',
          700: '#1A1F35',
          800: '#111827',
          900: '#0A0E1A',
        }
      },
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-mesh': 'linear-gradient(135deg, #0A0E1A 0%, #1A1F35 50%, #0A0E1A 100%)',
        'accent-gradient': 'linear-gradient(135deg, #6C63FF 0%, #00D9FF 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'slide-in-right': 'slideInRight 0.4s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'border-glow': 'borderGlow 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'gradient-x': 'gradientX 3s ease infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(108, 99, 255, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(108, 99, 255, 0.6)' },
        },
        borderGlow: {
          '0%, 100%': { borderColor: 'rgba(108, 99, 255, 0.3)' },
          '50%': { borderColor: 'rgba(0, 217, 255, 0.5)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        gradientX: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
        'glass-lg': '0 12px 40px rgba(108, 99, 255, 0.15)',
        'neon': '0 0 30px rgba(108, 99, 255, 0.4)',
        'neon-cyan': '0 0 30px rgba(0, 217, 255, 0.4)',
      }
    },
  },
  plugins: [],
}
