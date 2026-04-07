import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { History, CheckCircle2, XCircle } from 'lucide-react';

const Historial = () => {
  const { tareas, clientes } = useContext(AppContext);

  // Consider "Completada" and "No completada" as history for a technician
  const historialTareas = tareas.filter(t => t.estado === 'Completada' || t.estado === 'No completada');

  const getCliente = (id) => clientes.find(c => c.id === Number(id)) || {};

  return (
    <div className="space-y-8 page-transition">
      <div className="view-header">
        <div className="absolute top-0 right-0 w-64 h-64 bg-logo-gradient opacity-10 blur-[80px] rounded-full -mr-10 -mt-10"></div>
        <div className="relative z-10">
          <h2 className="view-title flex items-center gap-2"><History className="text-secondary"/> Historial</h2>
          <p className="view-subtitle tracking-[0.3em]">Registro Histórico Técnico</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {historialTareas.map(tarea => {
            const cliente = getCliente(tarea.cliente_id);
            return (
              <div key={tarea.id} className="premium-card p-6 flex flex-col relative overflow-hidden grayscale hover:grayscale-0 transition-all duration-500">
                <div className="absolute top-4 right-6">
                    <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5 shadow-sm border
                        ${tarea.estado === 'Completada' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                        {tarea.estado === 'Completada' ? <CheckCircle2 size={12}/> : <XCircle size={12}/>}
                        <span>{tarea.estado}</span>
                    </div>
                </div>
                
                <h3 className="text-lg font-black text-slate-800 mb-1 pr-24 uppercase tracking-tight italic">{tarea.ticket_id || `TSK-${tarea.id}`} - {tarea.titulo}</h3>
                <p className="text-slate-400 text-[11px] mb-4 font-medium line-clamp-2">{tarea.descripcion}</p>
                <div className="mt-auto border-t border-slate-50 pt-4 flex justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{cliente.nombre}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">({cliente.direccion || 'Sin dirección'})</span>
                </div>
              </div>
            );
        })}
      </div>

      {historialTareas.length === 0 && (
         <div className="text-center py-20">
             <History size={48} className="mx-auto text-slate-200 mb-4"/>
             <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Sin registros inactivos</p>
         </div>
      )}
    </div>
  );
};

export default Historial;
