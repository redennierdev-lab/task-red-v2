import React, { useContext, useState } from 'react';
import { Layers, CheckCircle2, CircleDashed, Rocket, Edit3, Trash2, Wrench, ShieldCheck, Search, LayoutGrid, Calendar, FileText } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import TareaWizard from '../components/TareaWizard';

const Tareas = () => {
  const { tareas, clientes, tecnicos, deleteRecord } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const handleEdit = (tarea) => {
    setEditingId(tarea.id);
    setIsWizardOpen(true);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('¿Eliminar definitivamente este ticket de la boveda local?')) {
        await deleteRecord('tasks', id);
    }
  };

  const getClienteNombre = (id) => (clientes || []).find(c => c.id === Number(id))?.nombre || 'Desconocido';
  const getTecnicoNombre = (id) => (tecnicos || []).find(t => t.id === Number(id))?.nombre || 'No asignado';

  const filteredTareas = (tareas || []).filter(t => 
    t.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.estado?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getClienteNombre(t.cliente_id).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 page-transition pb-20">
      {/* Header Premium */}
      <div className="view-header">
        <div className="relative z-10 flex items-center gap-6">
            <div className="brand-icon">
                <FileText size={32} />
            </div>
            <div>
              <h2 className="view-title italic uppercase tracking-tighter">Gestión Operativa</h2>
              <p className="view-subtitle tracking-[0.4em] font-black opacity-80 uppercase italic">Tickets de Despliegue Técnico</p>
            </div>
        </div>
        <button 
          onClick={() => { setEditingId(null); setIsWizardOpen(true); }}
          className="btn-gradient relative z-10 w-full sm:w-auto px-10 shadow-2xl shadow-orange-500/20"
        >
          <Layers size={18} />
          <span>Nuevo Ticket</span>
        </button>
      </div>

      {/* Premium Search & Grouped Filter List */}
      <div className="max-w-4xl mx-auto md:mx-0 space-y-6">
        <div className="relative group text-slate-900 dark:text-white">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none transition-all duration-500 text-orange-400 group-focus-within:text-fuchsia-500 group-focus-within:scale-110">
            <Search size={22} />
          </div>
          <input
            type="text"
            placeholder="Rastrear ticket o cliente desplegado..."
            className="w-full pl-16 pr-8 py-5 bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-orange-100 dark:border-slate-800 shadow-xl focus:ring-8 focus:ring-orange-500/5 focus:border-orange-400 Transition-all outline-none font-bold text-slate-700 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 tracking-wide text-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 ml-4 mb-1 italic">Estado Operativo:</span>
            <div className="inline-flex flex-wrap p-1 gap-1 bg-white dark:bg-slate-900 border-2 border-orange-50 dark:border-slate-800 rounded-[2rem] shadow-lg w-fit">
                {['Todos', 'Pendiente', 'En proceso', 'Completada'].map(tag => (
                    <button 
                      key={tag}
                      onClick={() => setSearchTerm(tag === 'Todos' ? '' : tag)} 
                      className={`px-8 py-3 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${searchTerm === tag || (tag === 'Todos' && searchTerm === '') ? 'bg-logo-gradient text-white shadow-lg shadow-orange-500/30' : 'text-slate-400 dark:text-slate-500 hover:bg-orange-50 dark:hover:bg-slate-800 hover:text-orange-600 dark:hover:text-fuchsia-400'}`}
                    >
                        {tag}
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* Grid de Tickets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-1">
        {filteredTareas.map((tarea) => (
          <div key={tarea.id} className="premium-card p-6 flex flex-col relative overflow-hidden transform hover:-translate-y-2 transition-all duration-300 min-h-[220px]">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-logo-gradient opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                    <span className="bg-slate-900 dark:bg-slate-800 text-white font-mono text-[10px] font-black px-3 py-1.5 rounded-xl shadow-lg uppercase tracking-widest">
                        {tarea.ticket_id || `TSK-${tarea.id}`}
                    </span>
                    <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 border
                      ${tarea.estado === 'Pendiente' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20' : 
                        tarea.estado === 'En proceso' ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-500/20' :
                        'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20'}`}>
                      {tarea.estado === 'Pendiente' ? <CircleDashed size={10} className="animate-spin-slow"/> : <CheckCircle2 size={10}/>}
                      {tarea.estado}
                    </div>
                </div>
                
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => handleEdit(tarea)} className="p-2.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-secondary rounded-xl hover:shadow-lg transition-all">
                    <Edit3 size={16} />
                  </button>
                  <button onClick={(e) => handleDelete(e, tarea.id)} className="p-2.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-red-500 rounded-xl hover:shadow-lg transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
            </div>
            
            <div className="flex-1 pt-2 relative z-10">
               <h3 className="text-lg font-black text-slate-800 dark:text-white mb-2 uppercase tracking-tight group-hover:text-secondary dark:group-hover:text-fuchsia-400 transition-colors line-clamp-1 italic">{tarea.titulo}</h3>
               <p className="text-slate-400 dark:text-slate-500 text-xs mb-6 leading-relaxed font-medium line-clamp-2 italic pr-4">{tarea.descripcion || 'Ficha técnica no cargada.'}</p>
            </div>
            
            <div className="mt-auto pt-5 border-t border-slate-50 dark:border-slate-800">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-300 dark:text-slate-600 mb-2 italic">Equipo Desplegado</span>
                        <div className="flex gap-2">
                            <div className="flex items-center gap-1.5 bg-violet-50 dark:bg-violet-500/10 px-3 py-1 rounded-full text-violet-700 dark:text-violet-400 border border-violet-100/50 dark:border-violet-500/20" title="Supervisor">
                                <ShieldCheck size={12} />
                                <span className="font-black text-[9px] uppercase tracking-widest">{getTecnicoNombre(tarea.tecnico_admin_id).split(' ')[0] || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-500/10 px-3 py-1 rounded-full text-orange-600 dark:text-orange-400 border border-orange-100/50 dark:border-orange-500/20" title="Instalador">
                                <Wrench size={12} />
                                <span className="font-black text-[9px] uppercase tracking-widest">{getTecnicoNombre(tarea.instalador_id).split(' ')[0] || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                   <div className="text-right shrink-0">
                       <span className="block text-[8px] font-black uppercase tracking-[0.2em] text-slate-300 dark:text-slate-600 mb-1 italic">Cliente Final</span>
                       <span className="font-black text-[11px] text-slate-800 dark:text-slate-200 uppercase tracking-tight line-clamp-1 max-w-[120px]">{getClienteNombre(tarea.cliente_id)}</span>
                   </div>
                </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTareas.length === 0 && (
        <div className="text-center py-32 bg-slate-50/50 dark:bg-slate-950/20 rounded-[4rem] border-2 border-dashed border-slate-200 dark:border-slate-800 shadow-inner group transition-colors">
          <div className="mx-auto w-24 h-24 bg-white dark:bg-slate-900 rounded-[2.5rem] flex items-center justify-center mb-8 text-slate-100 dark:text-slate-800 shadow-xl group-hover:scale-110 transition-transform duration-700">
            <LayoutGrid size={48} />
          </div>
          <h3 className="text-2xl font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-4">Mesa Silenciosa</h3>
          <p className="text-slate-300 dark:text-slate-600 text-[10px] uppercase font-black tracking-widest px-10 leading-loose mx-auto max-w-lg">
            No se han registrado secuencias operativas activas en este dispositivo. <br/> Despliegue su primer ticket con el botón superior.
          </p>
        </div>
      )}

      {/* Modern Wizard Implementation */}
      <TareaWizard 
        isOpen={isWizardOpen} 
        setIsOpen={setIsWizardOpen} 
        editingId={editingId}
        setEditingId={setEditingId}
      />
    </div>
  );
};

export default Tareas;