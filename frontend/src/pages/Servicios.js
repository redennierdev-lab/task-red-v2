import React, { useContext, useState } from 'react';
import { Sparkles, DollarSign, Search, Plus, Edit3, Trash2, FileText, Zap, ShieldCheck, Rocket } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import ServicioWizard from '../components/ServicioWizard';

const Servicios = () => {
  const { servicios, deleteRecord } = useContext(AppContext);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleEdit = (servicio) => {
    setEditingId(servicio.id);
    setIsWizardOpen(true);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('¿Eliminar este servicio del catálogo local definitivamente?')) {
        await deleteRecord('services', id);
    }
  };

  const filteredServicios = (servicios || []).filter(s => 
    s.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.descripcion && s.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 page-transition pb-20">
      {/* Premium Header */}
      <div className="view-header">
        <div className="relative z-10 flex items-center gap-6">
            <div className="brand-icon">
                <Rocket size={32} />
            </div>
            <div>
              <h2 className="view-title italic uppercase tracking-tighter">Red de Servicios</h2>
              <p className="view-subtitle tracking-[0.4em] font-black opacity-80 uppercase italic">Catálogo de Operaciones RED ENNIER</p>
            </div>
        </div>
        <button 
          onClick={() => { setEditingId(null); setIsWizardOpen(true); }}
          className="btn-gradient relative z-10 w-full sm:w-auto px-10 shadow-2xl shadow-orange-500/20"
        >
          <Rocket size={18} />
          <span>Nuevo Servicio</span>
        </button>
      </div>

      {/* Premium Search & Grouped Filter List */}
      <div className="max-w-4xl mx-auto md:mx-0 space-y-6">
        <div className="relative group text-slate-900 dark:text-white">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none transition-all duration-500 text-emerald-400 group-focus-within:text-emerald-500">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Filtrar servicios..."
            className="w-full pl-12 pr-6 py-2.5 bg-white dark:bg-slate-900 rounded-2xl border-2 border-emerald-100 dark:border-emerald-500/20 shadow-lg focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-400 dark:focus:border-emerald-500 transition-all outline-none font-bold text-slate-700 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 tracking-wide text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-3 italic">Categoría:</span>
            <div className="inline-flex flex-wrap p-1 gap-1 bg-white dark:bg-slate-900 border-2 border-emerald-50 dark:border-emerald-500/10 rounded-2xl shadow-lg w-fit">
                {['Todos', 'Internet', 'Instalación', 'Cámaras', 'Hardware', 'Software'].map(tag => (
                    <button 
                      key={tag}
                      onClick={() => setSearchTerm(tag === 'Todos' ? '' : tag)} 
                      className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${searchTerm === tag || (tag === 'Todos' && searchTerm === '') ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'text-slate-400 dark:text-slate-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-600'}`}
                    >
                        {tag}
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* Grid of Premium Catalog Cards - Compact */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 px-1">
        {filteredServicios.map((servicio) => (
          <div key={servicio.id} className="premium-card p-0 group flex flex-col relative overflow-hidden transform hover:-translate-y-1">
            <div className="h-1 bg-logo-gradient w-full opacity-80 group-hover:h-1.5 transition-all duration-500"></div>
            
            <div className="p-3">
              <div className="flex justify-between items-start mb-2">
                <div className="w-8 h-8 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-logo-gradient group-hover:text-white transition-all duration-700 shadow-sm border border-slate-100 dark:border-slate-700">
                  <Sparkles size={14} />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => handleEdit(servicio)} className="p-1.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-emerald-600 rounded-md transition-all shadow-sm">
                    <Edit3 size={11} />
                  </button>
                  <button onClick={(e) => handleDelete(e, servicio.id)} className="p-1.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-red-500 rounded-md transition-all shadow-sm">
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-1 mb-1">
                   <Zap size={9} className="text-emerald-500 fill-emerald-500/20" />
                   <span className="text-[7px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 italic">Red Item</span>
                </div>
                <h3 className="text-[11px] font-black text-slate-900 dark:text-white mb-0.5 uppercase tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1 italic">{servicio.nombre}</h3>
                <p className="text-slate-400 dark:text-slate-500 text-[8px] font-bold leading-tight line-clamp-1 italic">{servicio.descripcion || 'Sin descripción'}</p>
                
                <div className="mt-auto pt-2 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-0.5 text-slate-900 dark:text-white mt-0.5">
                      <DollarSign size={10} className="text-emerald-500" />
                      <span className="text-sm font-black tracking-tighter italic">{parseFloat(servicio.precio).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                     <ShieldCheck size={10} className="text-slate-200 dark:text-slate-700" />
                     <span className="text-[7px] font-black text-slate-300 dark:text-slate-600 uppercase italic">RED</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Action Card: Add New - Compact */}
        <div 
          onClick={() => { setEditingId(null); setIsWizardOpen(true); }}
          className="rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800 p-3 flex flex-col items-center justify-center text-center cursor-pointer hover:border-emerald-500/20 hover:bg-emerald-500/5 dark:hover:bg-emerald-500/10 transition-all group min-h-[100px]"
        >
           <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-600 group-hover:scale-110 group-hover:text-emerald-500 transition-all mb-1.5 shadow-sm">
              <Plus size={16} />
           </div>
           <span className="text-[8px] font-black uppercase tracking-widest text-slate-300 dark:text-slate-600 group-hover:text-emerald-500 italic">Añadir</span>
        </div>
      </div>

      {filteredServicios.length === 0 && (
        <div className="text-center py-24 bg-slate-50/50 dark:bg-slate-950/20 rounded-[4rem] border-2 border-dashed border-slate-200 dark:border-slate-800 shadow-inner transition-colors">
            <div className="mx-auto w-24 h-24 bg-white dark:bg-slate-900 rounded-[2.5rem] flex items-center justify-center mb-8 text-slate-100 dark:text-slate-800 shadow-xl">
                <FileText size={48} />
            </div>
            <h3 className="text-xl font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Catálogo Vacío</h3>
            <p className="text-slate-300 dark:text-slate-600 text-[10px] mt-4 font-black uppercase tracking-widest px-10 leading-loose">
                No se han registrado servicios maestros en tu base de datos local.
            </p>
        </div>
      )}

      {/* Wizard Implementation */}
      <ServicioWizard 
        isOpen={isWizardOpen} 
        setIsOpen={setIsWizardOpen} 
        editingId={editingId} 
        setEditingId={setEditingId} 
      />
    </div>
  );
};

export default Servicios;