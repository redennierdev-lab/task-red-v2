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
    <div className={`fixed inset-0 z-[999] bg-slate-950 transition-opacity duration-700 ${isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'} will-change-[opacity] flex flex-col items-center justify-center overflow-hidden`}>
      {/* Video Container in a Circle */}
      <div className="relative z-10 mb-12">
        <div className="w-56 h-56 md:w-72 md:h-72 rounded-full overflow-hidden border-4 border-orange-500/30 shadow-[0_0_50px_rgba(249,115,22,0.4)] relative animate-in zoom-in duration-1000">
          <video 
            src="/videologo.mp4" 
            autoPlay 
            muted 
            playsInline
            onEnded={() => setVideoEnded(true)}
            className="w-full h-full object-cover"
          />
          {/* Internal Glow Overlay */}
          <div className="absolute inset-0 rounded-full shadow-[inset_0_0_40px_rgba(0,0,0,0.5)]"></div>
        </div>
        {/* Outer Pulsing Ring */}
        <div className="absolute -inset-4 border border-orange-500/20 rounded-full animate-ping pointer-events-none"></div>
      </div>

      <div className="relative z-10 text-center w-full px-8 mt-auto pb-12">
        <h1 className="text-3xl font-black text-white tracking-[0.3em] uppercase mb-6 drop-shadow-2xl italic">Task Red</h1>
        
        {/* Loading Bar - Minimalist */}
        <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden mx-auto mb-4 backdrop-blur-md">
           <div 
             className="h-full bg-gradient-to-r from-orange-500 via-fuchsia-500 to-amber-400 transition-all duration-300 ease-out shadow-[0_0_15px_rgba(249,115,22,0.6)]"
             style={{ width: `${progress}%` }}
           ></div>
        </div>
        
        <p className="text-[10px] font-black text-white/70 tracking-[0.4em] font-mono uppercase italic">Cargando Sistema {progress}%</p>
      </div>
    </div>
  );
};

export default SplashScreen;
