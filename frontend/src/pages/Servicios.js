import React, { useContext, useState } from 'react';
import { Sparkles, DollarSign, Search, Plus, Edit3, Trash2, LayoutGrid, FileText, Zap, ShieldCheck, Rocket } from 'lucide-react';
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
    <div className="space-y-8 page-transition pb-20">
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
        <div className="relative group">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none transition-all duration-500 text-emerald-400 group-focus-within:text-emerald-600 group-focus-within:scale-110">
            <Search size={22} />
          </div>
          <input
            type="text"
            placeholder="Filtrar servicios por alcance..."
            className="w-full pl-16 pr-8 py-5 bg-white rounded-[2rem] border-2 border-emerald-100 shadow-xl focus:ring-8 focus:ring-emerald-500/5 focus:border-emerald-400 transition-all outline-none font-bold text-slate-700 placeholder:text-slate-300 tracking-wide text-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-4 mb-1 italic">Categoría de Servicio:</span>
            <div className="inline-flex flex-wrap p-1 gap-1 bg-white border-2 border-emerald-50 rounded-[2rem] shadow-lg w-fit">
                {['Todos', 'Internet', 'Instalación', 'Cámaras', 'Hardware', 'Software'].map(tag => (
                    <button 
                      key={tag}
                      onClick={() => setSearchTerm(tag === 'Todos' ? '' : tag)} 
                      className={`px-8 py-3 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${searchTerm === tag || (tag === 'Todos' && searchTerm === '') ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'text-slate-400 hover:bg-emerald-50 hover:text-emerald-600'}`}
                    >
                        {tag}
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* Grid of Premium Catalog Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-1">
        {filteredServicios.map((servicio) => (
          <div key={servicio.id} className="premium-card p-0 group flex flex-col relative overflow-hidden bg-white border-slate-100 hover:border-emerald-200 transition-all duration-500 transform hover:-translate-y-2">
            {/* Top Banner with Gradient */}
            <div className="h-1.5 bg-logo-gradient w-full opacity-80 group-hover:h-2 transition-all duration-500"></div>
            
            <div className="p-5 pt-4">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-logo-gradient group-hover:text-white transition-all duration-700 shadow-sm border border-slate-100">
                  <Sparkles size={16} />
                </div>
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0">
                  <button onClick={() => handleEdit(servicio)} className="p-2.5 bg-white border border-slate-100 text-slate-400 hover:text-emerald-600 rounded-xl hover:shadow-lg transition-all">
                    <Edit3 size={16} />
                  </button>
                  <button onClick={(e) => handleDelete(e, servicio.id)} className="p-2.5 bg-white border border-slate-100 text-slate-400 hover:text-red-500 rounded-xl hover:shadow-lg transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                   <Zap size={12} className="text-emerald-500 fill-emerald-500/20" />
                   <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Solución Activa</span>
                </div>
                <h3 className="text-base font-black text-slate-900 mb-1 uppercase tracking-tight group-hover:text-emerald-600 transition-colors line-clamp-1 italic">{servicio.nombre}</h3>
                <p className="text-slate-400 text-[9px] mb-6 font-bold leading-relaxed line-clamp-2 italic">{servicio.descripcion || 'Sin descripción'}</p>
                
                <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[7px] font-black uppercase tracking-widest text-slate-300 italic">Inversión</span>
                    <div className="flex items-center gap-1 text-slate-900 mt-0.5">
                      <DollarSign size={12} className="text-emerald-500" />
                      <span className="text-lg font-black tracking-tighter italic">{parseFloat(servicio.precio).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                     <ShieldCheck size={14} className="text-slate-200" />
                     <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest italic">RED</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Action Card: Add New */}
        <div 
          onClick={() => { setEditingId(null); setIsWizardOpen(true); }}
          className="rounded-3xl border-3 border-dashed border-slate-100 p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-emerald-500/20 hover:bg-emerald-500/5 transition-all group min-h-[180px]"
        >
           <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:scale-110 group-hover:text-emerald-500 transition-all mb-3">
              <Plus size={24} />
           </div>
           <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 group-hover:text-emerald-500 italic">Agregar item</span>
        </div>
      </div>

      {filteredServicios.length === 0 && (
        <div className="text-center py-24 bg-slate-50/50 rounded-[4rem] border-2 border-dashed border-slate-200 shadow-inner">
            <div className="mx-auto w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mb-8 text-slate-100 shadow-xl">
                <FileText size={48} />
            </div>
            <h3 className="text-xl font-black text-slate-400 uppercase tracking-[0.3em]">Catálogo Vacío</h3>
            <p className="text-slate-300 text-[10px] mt-4 font-black uppercase tracking-widest px-10 leading-loose">
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