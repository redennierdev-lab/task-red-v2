import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import Modal from '../components/Modal';
import { Wrench, ShieldCheck, Contact } from 'lucide-react';
import axios from 'axios';

const Tecnicos = () => {
  const { tecnicos, fetchTecnicos } = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ nombre: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/technicians', formData);
      setIsModalOpen(false);
      setFormData({ nombre: '' });
      fetchTecnicos();
    } catch (error) {
      console.error('Error:', error);
      alert('Hubo un error al guardar el técnico');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-primary">Plantilla de Técnicos</h2>
          <p className="text-gray-500 text-sm mt-1">Personal operativo capacitado</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-secondary hover:bg-primary text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm w-full sm:w-auto justify-center"
        >
          <Contact size={20} />
          <span>Registrar Técnico</span>
        </button>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {tecnicos.map((tecnico, index) => (
          <div key={tecnico.id || index} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-secondary flex items-center justify-center mb-4">
              <Wrench size={32} />
            </div>
            <h3 className="text-lg font-bold text-primary mb-1">{tecnico.nombre}</h3>
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-600 text-xs font-semibold mt-auto">
              <ShieldCheck size={14} />
              <span>{tecnico.status || 'Activo'}</span>
            </div>
          </div>
        ))}
      </div>

      {tecnicos.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
          <p className="text-gray-500">Aún no hay técnicos registrados.</p>
        </div>
      )}

      {/* Create Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Registrar Técnico"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre y Apellido</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
              value={formData.nombre}
              onChange={e => setFormData({ nombre: e.target.value })}
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-primary hover:bg-[#091f42] text-white font-medium py-3 rounded-lg mt-6 shadow-md transition-all active:scale-[0.98]"
          >
            Guardar Técnico
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Tecnicos;