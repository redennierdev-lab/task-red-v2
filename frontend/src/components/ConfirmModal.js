import React from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'ELIMINAR', cancelText = 'CANCELAR', type = 'danger' }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" 
                onClick={onClose}
            ></div>
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] shadow-2xl relative overflow-hidden border-2 border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-300">
                {/* Header Decoration */}
                <div className={`h-2 w-full ${type === 'danger' ? 'bg-red-500' : 'bg-orange-500'}`}></div>
                
                <div className="p-8 text-center">
                    <div className={`w-20 h-20 rounded-[2rem] ${type === 'danger' ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'} dark:bg-slate-800 mx-auto flex items-center justify-center mb-6 shadow-inner`}>
                        {type === 'danger' ? <Trash2 size={40} /> : <AlertTriangle size={40} />}
                    </div>
                    
                    <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter italic mb-2">
                        {title || '¿Confirmar Acción?'}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold leading-relaxed px-4 italic">
                        {message || 'Esta operación es irreversible y afectará los registros locales del dispositivo.'}
                    </p>
                </div>

                <div className="p-6 bg-slate-50 dark:bg-slate-950/50 flex gap-3">
                    <button 
                        onClick={onClose}
                        className="flex-1 px-6 py-4 font-black text-slate-400 hover:text-slate-600 dark:hover:text-white uppercase tracking-widest text-[10px] rounded-2xl hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-all italic border border-slate-200 dark:border-slate-800"
                    >
                        {cancelText}
                    </button>
                    <button 
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`flex-1 px-6 py-4 font-black text-white uppercase tracking-widest text-[10px] rounded-2xl shadow-xl transition-all active:scale-95 italic ${type === 'danger' ? 'bg-red-500 shadow-red-500/20 hover:bg-red-600' : 'bg-orange-500 shadow-orange-500/20 hover:bg-orange-600'}`}
                    >
                        {confirmText}
                    </button>
                </div>
                
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-6 text-slate-300 hover:text-slate-500 dark:hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
};

export default ConfirmModal;
