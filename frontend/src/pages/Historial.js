import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { History, CheckCircle2, XCircle, Search } from 'lucide-react';

const Historial = () => {
  const { tareas, clientes } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');

  // Consider "Completada" and "No completada" as history for a technician
  const historialTareas = tareas.filter(t => 
    (t.estado === 'Completada' || t.estado === 'No completada') &&
    (t.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || 
     (t.ticket_id && t.ticket_id.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const getCliente = (id) => clientes.find(c => c.id === Number(id)) || {};

  return (
    <div className="space-y-8 page-transition">
      <div className="view-header">
        <div className="relative z-10 flex items-center gap-6">
            <div className="brand-icon">
                <History size={32} />
            </div>
            <div>
              <h2 className="view-title italic uppercase tracking-tighter">Historial Técnico</h2>
              <p className="view-subtitle tracking-[0.4em] font-black opacity-80 uppercase italic">Registro Operativo Finalizado RED ENNIER</p>
            </div>
        </div>
      </div>

      {/* Consistency Search */}
      <div className="max-w-4xl mx-auto md:mx-0">
        <div className="relative group">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none transition-all duration-500 text-orange-400 group-focus-within:text-fuchsia-500 group-focus-within:scale-110">
            <Search size={22} />
          </div>
          <input
            type="text"
            placeholder="Rastrear registros operativos finalizados..."
            className="w-full pl-16 pr-8 py-5 bg-white rounded-[2rem] border-2 border-orange-100 shadow-xl focus:ring-8 focus:ring-orange-500/5 focus:border-orange-400 transition-all outline-none font-bold text-slate-700 placeholder:text-slate-300 tracking-wide text-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
