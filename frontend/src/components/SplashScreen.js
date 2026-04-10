import React, { useEffect, useState } from 'react';

const SplashScreen = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const [readyToFinish, setReadyToFinish] = useState(false);

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 15) + 5;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        setReadyToFinish(true);
      }
      setProgress(current);
    }, 200);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (readyToFinish && videoEnded) {
      setTimeout(() => setIsFading(true), 400); 
      setTimeout(() => onFinish(), 1200); 
    }
  }, [readyToFinish, videoEnded, onFinish]);

  return (
    <div className={`fixed inset-0 z-[999] transition-opacity duration-700 ${isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'} will-change-[opacity] flex items-center justify-center overflow-hidden bg-black`}>
      
      {/* Universe Watermark - Firm but subtle on black */}
      <div 
        className="absolute inset-0 opacity-40 pointer-events-none bg-center bg-cover mix-blend-screen"
        style={{ backgroundImage: 'url("/universe.png")' }}
      ></div>

      {/* Main Container */}
      <div className="relative z-10 flex items-center justify-center">
        {/* SVG Circular Progress Bar - Core Compatible (Orange/Amber) */}
        <svg className="absolute w-[265px] h-[265px] md:w-[325px] md:h-[325px] -rotate-90 pointer-events-none" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke="rgba(249,115,22,0.1)"
            strokeWidth="1"
          />
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke="url(#coreGradient)"
            strokeWidth="3"
            strokeDasharray="301.59"
            strokeDashoffset={301.59 - (301.59 * progress) / 100}
            strokeLinecap="round"
            className="transition-all duration-300 ease-out shadow-[0_0_15px_rgba(249,115,22,0.5)]"
          />
          <defs>
            <linearGradient id="coreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FB923C" /> {/* orange-400 */}
              <stop offset="50%" stopColor="#F97316" /> {/* orange-500 */}
              <stop offset="100%" stopColor="#FB923C" />
            </linearGradient>
          </defs>
        </svg>

        {/* Logo Container */}
        <div className="w-56 h-56 md:w-72 md:h-72 rounded-full overflow-hidden border-2 border-orange-500/20 shadow-[0_0_60px_rgba(249,115,22,0.2)] relative animate-in zoom-in duration-1000">
          <video 
            src="/newlogo.mp4" 
            autoPlay 
            muted 
            playsInline
            onEnded={() => setVideoEnded(true)}
            className="w-full h-full object-cover"
          />
          {/* Internal Shadow for Depth */}
          <div className="absolute inset-0 rounded-full shadow-[inset_0_0_60px_rgba(0,0,0,0.9)]"></div>
          {/* Core Glow Reflection */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(249,115,22,0.1),transparent_60%)] pointer-events-none"></div>
        </div>
        
        {/* Decorative Pulsing Ring - Minimalist Orange */}
        <div className="absolute -inset-12 border border-orange-500/5 rounded-full animate-ping pointer-events-none"></div>
      </div>
    </div>
  );
};

export default SplashScreen;
