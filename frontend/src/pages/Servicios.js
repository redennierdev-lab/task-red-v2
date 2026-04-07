import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import Modal from '../components/Modal';
import { Archive, Banknote } from 'lucide-react';
import axios from 'axios';

const Servicios = () => {
  const { servicios, fetchServicios } = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', precio: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/services', { ...formData, precio: parseFloat(formData.precio) });
      setIsModalOpen(false);
      setFormData({ nombre: '', precio: '' });
      fetchServicios();
    } catch (error) {
      console.error('Error:', error);
      alert('Hubo un error al guardar el servicio');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-primary">Catálogo de Servicios</h2>
          <p className="text-gray-500 text-sm mt-1">Servicios ofrecidos y tarifario</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-secondary hover:bg-primary text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm w-full sm:w-auto justify-center"
        >
          <Archive size={20} />
          <span>Agregar Servicio</span>
        </button>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {servicios.map((servicio, index) => (
          <div key={servicio.id || index} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:border-secondary transition-colors">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-secondary flex items-center justify-center shrink-0">
              <Archive size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-gray-800 line-clamp-1">{servicio.nombre}</h3>
              <div className="text-sm font-medium text-secondary mt-1 flex items-center gap-1">
                <Banknote size={14} className="text-gray-400" />
                <span>${parseFloat(servicio.precio || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {servicios.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
          <p className="text-gray-500">El catálogo de servicios está vacío.</p>
        </div>
      )}

      {/* Create Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Crear Servicio"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Servicio</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
              value={formData.nombre}
              onChange={e => setFormData({ ...formData, nombre: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio Asignado ($)</label>
            <input 
              required
              type="number" 
              step="0.01"
              min="0"
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
              value={formData.precio}
              onChange={e => setFormData({ ...formData, precio: e.target.value })}
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-primary hover:bg-[#091f42] text-white font-medium py-3 rounded-lg mt-6 shadow-md transition-all active:scale-[0.98]"
          >
            Guardar en Catálogo
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Servicios;