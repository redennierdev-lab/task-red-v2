import React, { useContext, useState } from 'react';
import axios from 'axios';
import { Wrench, Phone, Award, Search, UserPlus, Edit3, Trash2, Rocket } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import Modal from '../components/Modal';

const Tecnicos = () => {
  const { tecnicos, fetchTecnicos, deleteRecord, updateRecord } = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ nombre: '', especialidad: '', telefono: '' });
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateRecord('technicians', editingId, formData);
      } else {
        await axios.post('http://localhost:5000/api/technicians', formData);
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ nombre: '', especialidad: '', telefono: '' });
      fetchTecnicos();
    } catch (error) {
      console.error('Error:', error);
      alert('Error procesando técnico');
    }
  };

  const handleEdit = (tecnico) => {
    setEditingId(tecnico.id);
    setFormData({
      nombre: tecnico.nombre,
      especialidad: tecnico.especialidad,
      telefono: tecnico.telefono
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    console.log(`🗑️ FRONTEND: Iniciando eliminación de técnico ID: ${id}`);
    const success = await deleteRecord('technicians', id);
    if (success) {
      alert('Especialista eliminado con éxito');
    } else {
      alert('Error al eliminar');
    }
  };

  const filteredTecnicos = tecnicos.filter(t => 
    t.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.especialidad.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 page-transition">
      {/* Premium Header */}
      <div className="view-header">
        <div className="absolute top-0 right-0 w-64 h-64 bg-logo-gradient opacity-10 blur-[80px] rounded-full -mr-10 -mt-10"></div>
        <div className="relative z-10">
          <h2 className="view-title">Equipo Técnico</h2>
          <p className="view-subtitle tracking-[0.3em]">Staff de Especialistas</p>
        </div>
        <button 
          onClick={() => { setEditingId(null); setFormData({ nombre: '', especialidad: '', telefono: '' }); setIsModalOpen(true); }}
          className="btn-gradient relative z-10 w-full sm:w-auto"
        >
          <UserPlus size={18} />
          <span className="uppercase tracking-widest text-[10px]">Añadir Especialista</span>
        </button>
      </div>

      {/* Modern Search */}
      <div className="relative group max-w-md px-1">
        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-slate-400 group-focus-within:text-orange-500 transition-colors">
          <Search size={18} />
        </div>
        <input
          type="text"
          placeholder="Buscar especialista o disciplina..."
          className="w-full pl-14 pr-6 py-4 bg-white rounded-3xl border border-slate-100 shadow-sm focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/20 transition-all outline-none font-medium text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Grid of Premium Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-1">
        {filteredTecnicos.map((tecnico) => (
          <div key={tecnico.id} className="premium-card p-6 group flex flex-col relative overflow-hidden">
            <div className="absolute -right-3 -top-3 w-16 h-16 bg-slate-50 rounded-full transition-all group-hover:bg-logo-gradient group-hover:opacity-5"></div>
            
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                 <Wrench size={18} />
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0">
                <button onClick={(e) => { e.stopPropagation(); handleEdit(tecnico); }} className="p-2 bg-white text-slate-400 hover:text-secondary hover:shadow-md rounded-lg transition-all border border-slate-50">
                  <Edit3 size={14} />
                </button>
                <button onClick={(e) => handleDelete(e, tecnico.id)} className="p-2 bg-white text-slate-400 hover:text-red-500 hover:shadow-md rounded-lg transition-all border border-slate-50">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="relative z-10">
              <h3 className="text-lg font-black text-slate-800 mb-1 uppercase tracking-tight group-hover:text-secondary transition-colors italic">{tecnico.nombre}</h3>
              
              <div className="flex items-center gap-2 mb-4">
                <div className="px-2.5 py-0.5 bg-secondary/10 rounded-full text-[8.5px] font-black text-secondary uppercase tracking-widest border border-secondary/10 italic">
                   {tecnico.especialidad}
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-50">
                <div className="flex items-center gap-3 text-slate-500">
                  <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                    <Phone size={12} />
                  </div>
                  <span className="text-xs font-bold font-mono">{tecnico.telefono}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500">
                  <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                    <Award size={12} />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 italic">Staff Verificado</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTecnicos.length === 0 && (
        <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 shadow-sm">
          <div className="mx-auto w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 text-slate-200">
            <Wrench size={40} />
          </div>
          <h3 className="text-lg font-black text-slate-400 uppercase tracking-widest">Sin resultados</h3>
          <p className="text-slate-300 text-sm mt-2 font-medium">Amplía tus criterios de búsqueda</p>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingId(null);
        }}
        title={editingId ? "Perfil Especialista" : "Alta de Técnico"}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-secondary uppercase tracking-widest ml-4">Nombre Completo</label>
            <input 
              required
              type="text" 
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-full outline-none focus:bg-white focus:border-secondary transition-all font-bold text-slate-700 shadow-inner"
              value={formData.nombre}
              onChange={e => setFormData({...formData, nombre: e.target.value})}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-accent uppercase tracking-widest ml-4">Especialidad Operativa</label>
            <input 
              required
              placeholder="Ej: Redes / Software / Cámaras"
              type="text" 
              className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-full outline-none focus:bg-white focus:border-accent transition-all font-bold text-slate-700 shadow-inner"
              value={formData.especialidad}
              onChange={e => setFormData({...formData, especialidad: e.target.value})}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Contacto Celular</label>
            <input 
              required
              type="text" 
              className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-full outline-none focus:bg-white focus:border-slate-300 transition-all font-mono font-bold text-slate-700 shadow-inner"
              value={formData.telefono}
              onChange={e => setFormData({...formData, telefono: e.target.value})}
            />
          </div>
          <button 
            type="submit"
            className="btn-gradient w-full py-4 mt-6 rounded-full"
          >
            <span>{editingId ? 'Actualizar Perfil' : 'Dar de Alta'}</span>
            <Rocket size={18} />
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Tecnicos;