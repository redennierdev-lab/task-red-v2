import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import Modal from '../components/Modal';
import { Layers, CheckCircle2, CircleDashed } from 'lucide-react';
import axios from 'axios';

const Tareas = () => {
  const { tareas, clientes, tecnicos, fetchTareas } = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    cliente_id: '',
    tecnico_id: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/tasks', formData);
      setIsModalOpen(false);
      setFormData({ titulo: '', descripcion: '', cliente_id: '', tecnico_id: '' });
      fetchTareas();
    } catch (error) {
      console.error('Error:', error);
      alert('Hubo un error al crear la tarea');
    }
  };

  const getClienteNombre = (id) => clientes.find(c => c.id == id)?.nombre || 'Cliente Desconocido';
  const getTecnicoNombre = (id) => tecnicos.find(t => t.id == id)?.nombre || 'No asignado';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-primary">Gestión de Tareas</h2>
          <p className="text-gray-500 text-sm mt-1">Control de tickets y asignaciones</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-secondary hover:bg-primary text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm w-full sm:w-auto justify-center"
        >
          <Layers size={20} />
          <span>Crear Nueva Tarea</span>
        </button>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tareas.map((tarea, index) => (
          <div key={tarea.id || index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 group relative">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-bold text-gray-800 line-clamp-1 pr-4">{tarea.titulo}</h3>
              <div className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap
                ${tarea.estado === 'Pendiente' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
                {tarea.estado === 'Pendiente' ? <CircleDashed size={14}/> : <CheckCircle2 size={14}/>}
                <span>{tarea.estado}</span>
              </div>
            </div>
            
            <p className="text-gray-600 text-sm mb-5 line-clamp-2">{tarea.descripcion}</p>
            
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
              <div>
                <span className="block text-gray-400 mb-0.5">Asignado a:</span>
                <span className="font-semibold text-secondary">{getTecnicoNombre(tarea.tecnico_id) || tarea.tecnico_id}</span>
              </div>
              <div className="text-right">
                <span className="block text-gray-400 mb-0.5">Cliente:</span>
                <span className="font-semibold text-gray-700">{getClienteNombre(tarea.cliente_id) || tarea.cliente_id}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {tareas.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
          <p className="text-gray-500">No hay tareas pendientes en el sistema.</p>
        </div>
      )}

      {/* Create Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Crear Nueva Tarea"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título de Tarea</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
              value={formData.titulo}
              onChange={e => setFormData({...formData, titulo: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción de Solicitud</label>
            <textarea 
              required
              rows="3"
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all resize-none"
              value={formData.descripcion}
              onChange={e => setFormData({...formData, descripcion: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                 <select
                   required
                   className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                   value={formData.cliente_id}
                   onChange={e => setFormData({...formData, cliente_id: e.target.value})}
                 >
                   <option value="">Selecciona Cliente</option>
                   {clientes.map(c => (
                     <option key={c.id} value={c.id}>{c.nombre}</option>
                   ))}
                 </select>
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Técnico Asignado</label>
                 <select
                   required
                   className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                   value={formData.tecnico_id}
                   onChange={e => setFormData({...formData, tecnico_id: e.target.value})}
                 >
                   <option value="">Selecciona Técnico</option>
                   {tecnicos.map(t => (
                     <option key={t.id} value={t.id}>{t.nombre}</option>
                   ))}
                 </select>
               </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-primary hover:bg-[#091f42] text-white font-medium py-3 rounded-lg mt-6 shadow-md transition-all active:scale-[0.98]"
          >
            Registrar Ticket
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Tareas;