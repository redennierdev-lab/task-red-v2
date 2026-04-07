import React, { useEffect, useState } from 'react';

const SplashScreen = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      // Avanzar rápidamente en saltos
      current += Math.floor(Math.random() * 15) + 5;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        setTimeout(() => setIsFading(true), 500); // 500ms al 100% antes de transicionar
        setTimeout(() => onFinish(), 1300); // Darle tiempo al fadeout
      }
      setProgress(current);
    }, 150);
    
    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <div className={`fixed inset-0 z-[999] flex flex-col items-center justify-center bg-slate-900 transition-opacity duration-700 ${isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/20 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-500/20 blur-[100px] rounded-full pointer-events-none"></div>
      
      {/* Bouncing Logo Ball Container */}
      <div className="relative mb-6 animate-bounce">
         <div className="w-24 h-24 bg-white/10 p-2 rounded-3xl backdrop-blur-md shadow-[0_0_50px_rgba(249,115,22,0.3)] border border-white/20">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain filter drop-shadow-xl" />
         </div>
         {/* Shadow under the bouncing ball */}
         <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-16 h-2 bg-black/40 blur-[4px] rounded-full animate-pulse"></div>
      </div>

      <div className="text-center z-10">
        <h1 className="text-2xl font-black text-white tracking-[0.2em] uppercase mb-4">Task Red</h1>
        
        {/* Loading Bar */}
        <div className="w-64 h-1.5 bg-white/10 rounded-full overflow-hidden mx-auto mb-3 shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]">
           <div 
             className="h-full bg-gradient-to-r from-orange-500 via-fuchsia-500 to-amber-400 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(249,115,22,0.8)]"
             style={{ width: `${progress}%` }}
           ></div>
        </div>
        
        <p className="text-xs font-bold text-white/50 tracking-[0.3em] font-mono">{progress}%</p>
      </div>
    </div>
  );
};

export default SplashScreen;
