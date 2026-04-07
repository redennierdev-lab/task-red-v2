import React, { useContext, useState } from 'react';
import { Wrench, Phone, Award, Search, UserPlus, Edit3, Trash2 } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { db } from '../db/db';
import TecnicoWizard from '../components/TecnicoWizard';

const Tecnicos = () => {
  const { tecnicos, deleteRecord, refreshAll } = useContext(AppContext);
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
    <div className="space-y-8 page-transition pb-20">
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
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none transition-all duration-500 text-orange-400 group-focus-within:text-fuchsia-500 group-focus-within:scale-110">
            <Search size={22} />
          </div>
          <input
            type="text"
            placeholder="Rastrear especialista o disciplina..."
            className="w-full pl-16 pr-8 py-5 bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-orange-100 dark:border-slate-800 shadow-xl focus:ring-8 focus:ring-orange-500/5 dark:focus:ring-fuchsia-500/5 focus:border-orange-400 dark:focus:border-fuchsia-500 transition-all outline-none font-bold text-slate-700 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 tracking-wide text-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 ml-4 mb-1 italic">Disciplina Técnica:</span>
            <div className="inline-flex flex-wrap p-1 gap-1 bg-white dark:bg-slate-900 border-2 border-orange-50 dark:border-slate-800 rounded-[2rem] shadow-lg w-fit">
                {['Todos', 'Redes', 'Software', 'Cámaras', 'Instalador'].map(tag => (
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

      {/* Grid of Premium Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-1">
        {filteredTecnicos.map((tecnico) => (
          <div key={tecnico.id} className="premium-card p-5 group flex flex-col relative overflow-hidden transform hover:-translate-y-1 transition-all duration-300">
            <div className="absolute -right-3 -top-3 w-16 h-16 bg-slate-50 dark:bg-fuchsia-500/5 rounded-full transition-all group-hover:bg-logo-gradient group-hover:opacity-5"></div>
            
            <div className="flex justify-between items-start mb-5 relative z-10">
              <div className="w-12 h-12 bg-slate-900 dark:bg-slate-800 rounded-[1.2rem] flex items-center justify-center text-white shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                 <Wrench size={22} className={tecnico.status === 'Inactivo' ? 'opacity-30' : ''} />
              </div>
              <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0">
                <button onClick={(e) => { e.stopPropagation(); handleEdit(tecnico); }} className="p-2.5 bg-white dark:bg-slate-800 text-slate-400 hover:text-secondary dark:hover:text-fuchsia-400 hover:shadow-lg rounded-xl transition-all border border-slate-100 dark:border-slate-700">
                  <Edit3 size={16} />
                </button>
                <button onClick={(e) => handleDelete(e, tecnico.id)} className="p-2.5 bg-white dark:bg-slate-800 text-slate-400 hover:text-red-500 rounded-xl hover:shadow-lg transition-all border border-slate-100 dark:border-slate-700">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight group-hover:text-secondary dark:group-hover:text-fuchsia-400 transition-colors italic truncate">{tecnico.nombre}</h3>
                {tecnico.status === 'Inactivo' && <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></div>}
              </div>
              
              <div className="flex items-center gap-2 mb-6">
                <div className="px-3 py-1 bg-secondary/5 dark:bg-fuchsia-500/10 rounded-full text-[9px] font-black text-secondary dark:text-fuchsia-400 uppercase tracking-[0.2em] border border-secondary/10 dark:border-fuchsia-500/20 italic">
                   {tecnico.especialidad}
                </div>
              </div>

              <div className="space-y-3 pt-5 border-t border-slate-50 dark:border-slate-800">
                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-400 group-hover:bg-secondary/10 dark:group-hover:bg-fuchsia-500/10 group-hover:text-secondary dark:group-hover:text-fuchsia-400 transition-all">
                    <Phone size={14} />
                  </div>
                  <span className="text-[11px] font-black font-mono tracking-widest">{tecnico.telefono}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300 dark:text-slate-600">
                  <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-200 dark:text-slate-700">
                    <Award size={14} />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest">{tecnico.status === 'Inactivo' ? 'Status: Fuera de Línea' : 'Staff Verificado'}</span>
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