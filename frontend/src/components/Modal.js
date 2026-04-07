import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Dynamic Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
        onClick={onClose} 
      />
      
      {/* Modal Container */}
      <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-[0_30px_60px_rgba(0,0,0,0.12)] relative z-10 overflow-hidden border border-white/50 animate-in zoom-in-95 slide-in-from-bottom-6 duration-400 ease-out flex flex-col max-h-[95vh]">
        
        {/* Header Decorator Gradient */}
        <div className="h-1.5 w-full bg-logo-gradient shrink-0"></div>
        
        <div className="px-6 py-5 flex items-center justify-between border-b border-slate-50 shrink-0">
          <div>
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight italic">{title}</h2>
            <div className="h-1 w-10 bg-logo-gradient rounded-full mt-1"></div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-slate-100 rounded-xl transition-all active:scale-90"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {children}
        </div>

        {/* Footer Decorator (Subtle) */}
        <div className="px-6 py-3 bg-slate-50/50 flex justify-center shrink-0">
           <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.3em] font-outfit">RED ENNIER TASK MANAGER V2.0 PREMIUM</span>
        </div>
      </div>
    </div>
  );
};

export default Modal;
