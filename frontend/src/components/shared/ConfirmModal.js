import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

/**
 * MD3 Confirm Dialog
 * Props: isOpen, onClose, onConfirm, title, message,
 *        confirmText, cancelText, type = 'danger' | 'warning'
 */
const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title       = '¿Confirmar acción?',
  message     = 'Esta operación es irreversible y afectará los registros del dispositivo.',
  confirmText = 'Eliminar',
  cancelText  = 'Cancelar',
  type        = 'danger',
}) => {
  if (!isOpen) return null;

  const isDanger = type === 'danger';

  return (
    <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center p-4 sm:p-6">
      {/* Scrim */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog surface — MD3 Basic Dialog */}
      <div
        className="relative w-full max-w-sm bg-white dark:bg-[#251D1A] overflow-hidden animate-in
          fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300"
        style={{
          borderRadius: '28px',
          boxShadow: '0 6px 10px 4px rgba(0,0,0,0.15), 0 2px 3px rgba(0,0,0,0.3)',
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
      >
        {/* Top accent line */}
        <div className={`h-1 w-full ${isDanger ? 'bg-red-500' : 'bg-amber-500'}`} />

        {/* Body */}
        <div className="p-7 text-center">
          {/* Icon container */}
          <div
            className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-5 ${
              isDanger
                ? 'bg-red-50 dark:bg-red-500/10 text-red-500'
                : 'bg-amber-50 dark:bg-amber-500/10 text-amber-500'
            }`}
          >
            {isDanger ? <Trash2 size={32} /> : <AlertTriangle size={32} />}
          </div>

          {/* Headline */}
          <h3
            id="confirm-dialog-title"
            className="text-[18px] font-bold text-slate-900 dark:text-white tracking-tight leading-tight mb-2"
          >
            {title}
          </h3>

          {/* Supporting text */}
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed px-2">
            {message}
          </p>
        </div>

        {/* Actions — MD3 Dialog footer */}
        <div className="flex gap-2 px-6 pb-6">
          {/* Text button — Cancel */}
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-2xl text-sm font-semibold
              text-slate-600 dark:text-slate-400
              hover:bg-slate-100 dark:hover:bg-slate-800
              transition-colors duration-150 ripple"
          >
            {cancelText}
          </button>

          {/* Filled tonal button — Confirm */}
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={`flex-1 py-3 px-4 rounded-2xl text-sm font-bold text-white
              transition-all duration-150 active:scale-95 ripple
              ${isDanger
                ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/25'
                : 'bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/25'
              }`}
          >
            {confirmText}
          </button>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center
            rounded-full hover:bg-slate-100 dark:hover:bg-slate-800
            text-slate-400 transition-colors"
          aria-label="Cerrar"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default ConfirmModal;
