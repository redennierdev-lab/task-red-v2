import React from 'react';
import { X, Printer, Download, Bluetooth, XCircle, FileText } from 'lucide-react';

const PrinterActionModal = ({ isOpen, onClose, onPrint, onSave, task, client }) => {
    if (!isOpen || !task) return null;

    const fecha = new Date().toLocaleDateString('es-VE', { dateStyle: 'medium' });

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" 
                onClick={onClose}
            ></div>
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl border-2 border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-300 relative">
                <div className="p-6 border-b dark:border-slate-800 flex justify-between items-center bg-logo-gradient text-white">
                    <h3 className="font-black uppercase tracking-widest text-xs flex items-center gap-2 italic">
                        <Printer size={18}/> Salida de Documento
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                        <X size={20}/>
                    </button>
                </div>
                
                <div className="p-6 bg-slate-50 dark:bg-slate-950/50">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-inner border border-slate-200 dark:border-slate-800 font-mono text-[9px] text-slate-700 dark:text-slate-300 whitespace-pre leading-tight">
{`================================
       RED ENNIER TASK          
================================
TICKET  : ${task.ticket_id || `TSK-${task.id}`}
FECHA   : ${fecha}
--------------------------------
CLIENTE : ${client?.nombre || 'N/A'}
SERVICIO: ${task.titulo}
ESTADO  : ${task.estado}
--------------------------------
TOTAL   : $${task.monto || '0.00'} USD
================================
   GRACIAS POR SU PREFERENCIA  
================================`}
                    </div>
                </div>

                <div className="p-6 grid grid-cols-2 gap-3">
                    <button 
                        onClick={() => onPrint(task, client)}
                        className="flex flex-col items-center justify-center gap-2 p-4 bg-orange-50 dark:bg-orange-500/10 border-2 border-orange-100 dark:border-orange-500/20 text-orange-600 dark:text-orange-400 rounded-2xl hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-all group"
                    >
                        <Bluetooth size={24} className="group-hover:scale-110 transition-transform"/>
                        <span className="text-[8px] font-black uppercase tracking-widest italic text-center">Imprimir Bluetooth</span>
                    </button>
                    <button 
                        onClick={() => onSave(task, client)}
                        className="flex flex-col items-center justify-center gap-2 p-4 bg-emerald-50 dark:bg-emerald-500/10 border-2 border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-all group"
                    >
                        <Download size={24} className="group-hover:scale-110 transition-transform"/>
                        <span className="text-[8px] font-black uppercase tracking-widest italic text-center">Guardar en Teléfono</span>
                    </button>
                    <button 
                        onClick={onClose}
                        className="col-span-2 py-3 text-[9px] font-black uppercase text-slate-400 dark:text-slate-600 hover:text-red-500 transition-colors italic tracking-[0.2em]"
                    >
                        DESCARTAR OPERACIÓN
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PrinterActionModal;
