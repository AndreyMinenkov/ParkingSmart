import React, { useEffect } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#007AFF] to-[#5856D6] flex items-center justify-center animate-fade-in">
      <div className="text-center animate-fade-in">
        <div className="w-24 h-24 bg-white/20 backdrop-blur-2xl rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl border border-white/30">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4-4m-4 4l4 4" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight drop-shadow-lg mb-2">
          ParkingSmart
        </h1>
        <p className="text-xl text-white/80 drop-shadow-md">
          Просто о парковке
        </p>
      </div>
    </div>
  );
};

export default SplashScreen;
