import React, { useContext, useState } from 'react';
import axios from 'axios';
import { Rocket, DollarSign, Plus, Edit3, Trash2, Zap, ShieldCheck } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import Modal from '../components/Modal';

const Servicios = () => {
  const { servicios, fetchServicios, deleteRecord, updateRecord } = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ nombre: '', descripcion: '', precio: '' });
  const [searchTerm] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateRecord('services', editingId, formData);
      } else {
        await axios.post('http://10.51.182.11:5000/api/services', formData);
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ nombre: '', descripcion: '', precio: '' });
      fetchServicios();
    } catch (error) {
       console.error('Error:', error);
       alert('Error procesando servicio');
    }
  };

  const handleEdit = (servicio) => {
    setEditingId(servicio.id);
    setFormData({
      nombre: servicio.nombre,
      descripcion: servicio.descripcion,
      precio: servicio.precio
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    console.log(`🗑️ FRONTEND: Iniciando eliminación de servicio ID: ${id}`);
    const success = await deleteRecord('services', id);
    if (success) {
      alert('Servicio eliminado con éxito');
    } else {
      alert('Error al eliminar');
    }
  };

  const filteredServicios = servicios.filter(s => 
    s.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 page-transition">
      {/* Premium Header */}
      <div className="view-header">
        <div className="absolute top-0 right-0 w-64 h-64 bg-logo-gradient opacity-10 blur-[80px] rounded-full -mr-10 -mt-10"></div>
        <div className="relative z-10">
          <h2 className="view-title">Catálogo</h2>
          <p className="view-subtitle tracking-[0.3em]">Servicios & Soluciones</p>
        </div>
        <button 
          onClick={() => { setEditingId(null); setFormData({ nombre: '', descripcion: '', precio: '' }); setIsModalOpen(true); }}
          className="btn-gradient relative z-10 w-full sm:w-auto"
        >
          <Plus size={18} />
          <span className="uppercase tracking-widest text-[10px]">Añadir Servicio</span>
        </button>
      </div>

      {/* Grid of Premium Catalog Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredServicios.map((servicio) => (
          <div key={servicio.id} className="premium-card p-0 group flex flex-col relative overflow-hidden">
            {/* Top Banner with Gradient */}
            <div className="h-1.5 bg-logo-gradient w-full opacity-80 group-hover:h-2 transition-all duration-500"></div>
            
            <div className="p-5 pt-4">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-logo-gradient group-hover:text-white transition-all duration-700 shadow-sm border border-slate-100">
                  <Rocket size={16} />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0">
                  <button onClick={(e) => { e.stopPropagation(); handleEdit(servicio); }} className="p-2 bg-white text-slate-400 hover:text-secondary hover:shadow-md rounded-lg transition-all border border-slate-50">
                    <Edit3 size={14} />
                  </button>
                  <button onClick={(e) => handleDelete(e, servicio.id)} className="p-2 bg-white text-slate-400 hover:text-red-500 hover:shadow-md rounded-lg transition-all border border-slate-50">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                   <Zap size={12} className="text-orange-500 fill-orange-500/20" />
                   <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Solución Activa</span>
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-1 uppercase tracking-tight group-hover:text-secondary transition-colors line-clamp-1 italic">{servicio.nombre}</h3>
                <p className="text-slate-400 text-[9px] mb-6 font-bold leading-relaxed line-clamp-2 italic">{servicio.descripcion}</p>
                
                <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[7px] font-black uppercase tracking-widest text-slate-300 italic">Inversión</span>
                    <div className="flex items-center gap-1 text-slate-900 mt-0.5">
                      <DollarSign size={12} className="text-emerald-500" />
                      <span className="text-lg font-black tracking-tighter">{servicio.precio}</span>
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
          onClick={() => { setEditingId(null); setFormData({ nombre: '', descripcion: '', precio: '' }); setIsModalOpen(true); }}
          className="rounded-3xl border-3 border-dashed border-slate-100 p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-orange-500/20 hover:bg-orange-500/5 transition-all group"
        >
           <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:scale-110 group-hover:text-orange-500 transition-all mb-3">
              <Plus size={24} />
           </div>
           <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 group-hover:text-orange-500 italic">Agregar item</span>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingId(null);
        }}
        title={editingId ? "Actualizar Solución" : "Nuevo Servicio en Catálogo"}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-secondary uppercase tracking-widest ml-4">Nombre del Servicio</label>
            <input 
              required
              type="text" 
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-full outline-none focus:bg-white focus:border-secondary transition-all font-bold text-slate-700 shadow-inner"
              value={formData.nombre}
              onChange={e => setFormData({...formData, nombre: e.target.value})}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-accent uppercase tracking-widest ml-4">Descripción de Alcance</label>
            <textarea 
              required
              rows="3"
              className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-[2rem] outline-none focus:bg-white focus:border-accent transition-all font-medium text-slate-600 resize-none shadow-inner"
              value={formData.descripcion}
              onChange={e => setFormData({...formData, descripcion: e.target.value})}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Precio Unitario / Base</label>
            <div className="relative">
              <DollarSign size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500" />
              <input 
                required
                type="text" 
                className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-transparent rounded-full outline-none focus:bg-white focus:border-slate-300 transition-all font-black text-slate-800 shadow-inner"
                value={formData.precio}
                onChange={e => setFormData({...formData, precio: e.target.value})}
              />
            </div>
          </div>
          <button 
            type="submit"
            className="btn-gradient w-full py-5 text-sm uppercase tracking-[0.2em] shadow-2xl rounded-full"
          >
            <span>{editingId ? 'Confirmar Cambios' : 'Registrar en Catálogo'}</span>
            <Rocket size={20} />
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Servicios;