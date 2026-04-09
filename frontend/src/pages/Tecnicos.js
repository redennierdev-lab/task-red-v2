import React, { useContext, useState } from 'react';
import { Wrench, Phone, Award, Search, UserPlus, Edit3, Trash2 } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import TecnicoWizard from '../components/TecnicoWizard';

const Tecnicos = () => {
  const { tecnicos, deleteRecord } = useContext(AppContext);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleEdit = (tecnico) => {
    setEditingId(tecnico.id);
    setIsWizardOpen(true);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('¿Eliminar definitivamente a este especialista de la memoria local?')) {
        await deleteRecord('technicians', id);
    }
  };

  const filteredTecnicos = (tecnicos || []).filter(t => 
    t.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.especialidad.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 page-transition pb-20">
      {/* Premium Header */}
      <div className="view-header">
        <div className="relative z-10 flex items-center gap-6">
            <div className="brand-icon">
                <Wrench size={32} />
            </div>
            <div>
              <h2 className="view-title italic uppercase tracking-tighter">Equipo Técnico</h2>
              <p className="view-subtitle tracking-[0.4em] font-black opacity-80 uppercase italic">Staff de Especialistas RED ENNIER</p>
            </div>
        </div>
        <button 
          onClick={() => { setEditingId(null); setIsWizardOpen(true); }}
          className="btn-gradient relative z-10 w-full sm:w-auto px-10 shadow-2xl shadow-orange-500/20"
        >
          <UserPlus size={18} />
          <span>Añadir Especialista</span>
        </button>
      </div>

      {/* Premium Search & Grouped Filter List */}
      <div className="max-w-4xl mx-auto md:mx-0 space-y-6">
        <div className="relative group text-slate-900 dark:text-white">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none transition-all duration-500 text-orange-400 group-focus-within:text-fuchsia-500">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Rastrear especialista..."
            className="w-full pl-12 pr-6 py-2.5 bg-white dark:bg-slate-900 rounded-2xl border-2 border-orange-100 dark:border-slate-800 shadow-lg focus:ring-4 focus:ring-orange-500/5 dark:focus:ring-fuchsia-500/5 focus:border-orange-400 dark:focus:border-fuchsia-500 transition-all outline-none font-bold text-slate-700 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 tracking-wide text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-3 italic">Disciplina:</span>
            <div className="inline-flex flex-wrap p-1 gap-1 bg-white dark:bg-slate-900 border-2 border-orange-50 dark:border-slate-800 rounded-2xl shadow-lg w-fit">
                {['Todos', 'Redes', 'Software', 'Cámaras', 'Instalador'].map(tag => (
                    <button 
                      key={tag}
                      onClick={() => setSearchTerm(tag === 'Todos' ? '' : tag)} 
                      className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${searchTerm === tag || (tag === 'Todos' && searchTerm === '') ? 'bg-logo-gradient text-white shadow-lg shadow-orange-500/30' : 'text-slate-400 dark:text-slate-500 hover:bg-orange-50 dark:hover:bg-slate-800 hover:text-orange-600 dark:hover:text-fuchsia-400'}`}
                    >
                        {tag}
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* Grid of Premium Cards - Compact */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 px-1">
        {filteredTecnicos.map((tecnico) => (
          <div key={tecnico.id} className="premium-card p-0 group flex flex-col relative overflow-hidden transform hover:-translate-y-1 transition-all duration-300">
            <div className="h-1 bg-logo-gradient w-full opacity-80 group-hover:h-1.5 transition-all duration-500"></div>
            <div className="p-3 bg-white dark:bg-slate-900 relative">
            <div className="absolute -right-2 -top-2 w-16 h-16 bg-slate-50 dark:bg-fuchsia-500/5 rounded-full transition-all group-hover:bg-logo-gradient group-hover:opacity-5"></div>
            
            <div className="flex justify-between items-start mb-3 relative z-10">
              <div className="w-8 h-8 bg-slate-900 dark:bg-slate-800 rounded-lg flex items-center justify-center text-white shadow-lg transition-all duration-500 group-hover:scale-110">
                 <Wrench size={14} className={tecnico.status === 'Inactivo' ? 'opacity-30' : ''} />
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={(e) => { e.stopPropagation(); handleEdit(tecnico); }} className="p-1.5 bg-white dark:bg-slate-800 text-slate-400 hover:text-orange-500 dark:hover:text-fuchsia-400 rounded-md transition-all border border-slate-100 dark:border-slate-700 shadow-sm">
                  <Edit3 size={11} />
                </button>
                <button onClick={(e) => handleDelete(e, tecnico.id)} className="p-1.5 bg-white dark:bg-slate-800 text-slate-400 hover:text-red-500 rounded-md transition-all border border-slate-100 dark:border-slate-700 shadow-sm">
                  <Trash2 size={11} />
                </button>
              </div>
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-1.5 mb-1">
                <h3 className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-tight group-hover:text-orange-500 dark:group-hover:text-fuchsia-400 transition-colors italic truncate">{tecnico.nombre}</h3>
                {tecnico.status === 'Inactivo' && <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></div>}
              </div>
              
              <div className="flex items-center gap-2 mb-3">
                <div className="px-2 py-0.5 bg-orange-500/5 dark:bg-fuchsia-500/10 rounded-full text-[7px] font-black text-orange-600 dark:text-fuchsia-400 uppercase tracking-[0.1em] border border-orange-500/10 dark:border-fuchsia-500/20 italic">
                   {tecnico.especialidad}
                </div>
              </div>

              <div className="space-y-1.5 pt-3 border-t border-slate-50 dark:border-slate-800">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <Phone size={9} className="text-orange-500/50" />
                  <span className="text-[9px] font-black font-mono tracking-tighter">{tecnico.telefono}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300 dark:text-slate-600">
                  <Award size={9} className="text-orange-500/30" />
                  <span className="text-[7px] font-black uppercase tracking-widest italic">{tecnico.status === 'Inactivo' ? 'OFFLINE' : 'VERIFICADO'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        ))}
      </div>

      {filteredTecnicos.length === 0 && (
        <div className="text-center py-24 bg-white dark:bg-slate-950/20 rounded-[4rem] border-2 border-dashed border-slate-100 dark:border-slate-800 shadow-inner transition-colors">
          <div className="mx-auto w-24 h-24 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] flex items-center justify-center mb-8 text-slate-200 dark:text-slate-800 animate-bounce">
            <Wrench size={48} />
          </div>
          <h3 className="text-xl font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Bóveda Vacía</h3>
          <p className="text-slate-300 dark:text-slate-600 text-xs mt-3 font-bold uppercase tracking-wider">No se encontraron especialistas en el sistema local</p>
        </div>
      )}

      {/* Modern Wizard Replacement */}
      <TecnicoWizard 
        isOpen={isWizardOpen} 
        setIsOpen={setIsWizardOpen} 
        editingId={editingId}
        setEditingId={setEditingId}
      />
    </div>
  );
};

export default Tecnicos;