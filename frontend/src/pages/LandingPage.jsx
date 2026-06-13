import React from 'react';
import { Link } from 'react-router-dom';
import GlassCard from '../components/ui/GlassCard';
import AnimatedButton from '../components/ui/AnimatedButton';

const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden flex flex-col items-center justify-center min-h-[80vh]">
        {/* Background Decorative Elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-500/20 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-gray-300 mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-secondary-400 animate-pulse"></span>
            AI-Powered Fashion Intelligence
          </div>
          
          <h1 className="text-5xl md:text-7xl font-heading font-extrabold tracking-tight mb-6 animate-fade-in-up">
            Shop Smarter with <br />
            <span className="gradient-text">FashionAI</span>
          </h1>
          
          <p className="mt-4 text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-10 animate-fade-in-up animate-delay-100 text-balance">
            Analyze thousands of reviews in seconds, try clothes on virtually, and find your perfect size before you buy.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animate-delay-200">
            <Link to="/analyze">
              <AnimatedButton className="w-full sm:w-auto px-8 py-4 text-lg">
                Get Started Free &rarr;
              </AnimatedButton>
            </Link>
            <Link to="/try-on">
              <AnimatedButton variant="secondary" className="w-full sm:w-auto px-8 py-4 text-lg">
                Try Demo
              </AnimatedButton>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-dark-800/50 border-y border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title">Everything you need to buy with confidence</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Our platform combines advanced NLP and Computer Vision to eliminate the guesswork from online shopping.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon="🧠" 
              title="Review Intelligence" 
              desc="We read thousands of reviews so you don't have to. Get sentiment analysis, pros/cons, and a Buy Confidence Score."
              delay="0"
            />
            <FeatureCard 
              icon="📸" 
              title="Virtual Try-On" 
              desc="See how clothes look on you before purchasing. Uses real-time body tracking via your webcam."
              delay="100"
            />
            <FeatureCard 
              icon="📏" 
              title="Size Prediction" 
              desc="No more returns. Input your measurements and body type for accurate size recommendations."
              delay="200"
            />
            <FeatureCard 
              icon="🖼️" 
              title="Screenshot Fallback" 
              desc="URL scraping blocked? Just upload a screenshot of the product page and our OCR engine extracts the details."
              delay="0"
            />
            <FeatureCard 
              icon="⚖️" 
              title="Product Comparison" 
              desc="Compare price, rating, and AI sentiment across multiple products side-by-side to find the best value."
              delay="100"
            />
            <FeatureCard 
              icon="🌐" 
              title="Multi-Platform" 
              desc="Works seamlessly with Amazon, Flipkart, Myntra, Ajio, and other major fashion retailers."
              delay="200"
            />
          </div>
        </div>
      </section>
      
      {/* How it works */}
      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
           <h2 className="section-title mb-16">How it works</h2>
           <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-4 relative">
             {/* Desktop connecting line */}
             <div className="hidden md:block absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary-500/20 via-secondary-500/50 to-primary-500/20 -z-10"></div>
             
             <Step number="1" title="Paste URL" desc="Copy a product link from any supported e-commerce site." />
             <Step number="2" title="AI Analyzes" desc="Our engine extracts data, reads reviews, and calculates scores." />
             <Step number="3" title="Try & Decide" desc="View summaries, try it on virtually, and make a confident purchase." />
           </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc, delay }) => (
  <GlassCard className={`animate-fade-in-up`} style={{ animationDelay: `${delay}ms` }}>
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-xl font-heading font-bold text-white mb-2">{title}</h3>
    <p className="text-gray-400">{desc}</p>
  </GlassCard>
);

const Step = ({ number, title, desc }) => (
  <div className="flex flex-col items-center max-w-xs relative bg-dark-900/80 p-6 rounded-2xl border border-white/5">
    <div className="w-12 h-12 rounded-full bg-accent-gradient flex items-center justify-center text-white font-bold text-xl shadow-neon mb-4">
      {number}
    </div>
    <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
    <p className="text-sm text-gray-400">{desc}</p>
  </div>
);

export default LandingPage;
