import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import Modal from '../components/Modal';
import { UserPlus, Phone, MapPin, Search } from 'lucide-react';
import axios from 'axios';

const Clientes = () => {
  const { clientes, fetchClientes } = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    nombre: '',
    identificacion: '',
    telefono: '',
    direccion: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/customers', formData);
      setIsModalOpen(false);
      setFormData({ nombre: '', identificacion: '', telefono: '', direccion: '' });
      fetchClientes(); // Refresh list
    } catch (error) {
      console.error('Error:', error);
      alert('Hubo un error al guardar el cliente');
    }
  };

  const filteredClientes = clientes.filter(c => 
    c.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.cedula?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-primary">Directorio de Clientes</h2>
          <p className="text-gray-500 text-sm mt-1">Gestiona la cartera de clientes de RED ENNIER</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-secondary hover:bg-primary text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm w-full sm:w-auto justify-center"
        >
          <UserPlus size={20} />
          <span>Nuevo Cliente</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Buscar por nombre o cédula..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none"
        />
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredClientes.map((cliente, index) => (
          <div key={cliente.id || index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-secondary opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <div className="pl-2">
              <h3 className="text-lg font-bold text-gray-800 line-clamp-1">{cliente.nombre}</h3>
              <p className="text-sm font-medium text-secondary mb-4">ID: {cliente.cedula || cliente.identificacion}</p>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-gray-400" />
                  <span>{cliente.telefono || 'Sin teléfono'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-gray-400 min-w-[16px]" />
                  <span className="line-clamp-2">{cliente.direccion || 'Sin dirección'}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredClientes.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
          <p className="text-gray-500">No se encontraron clientes.</p>
        </div>
      )}

      {/* Create Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Registrar Nuevo Cliente"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
              value={formData.nombre}
              onChange={e => setFormData({...formData, nombre: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cédula / RIF</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
              value={formData.identificacion}
              onChange={e => setFormData({...formData, identificacion: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
              value={formData.telefono}
              onChange={e => setFormData({...formData, telefono: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección Física</label>
            <textarea 
              required
              rows="3"
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all resize-none"
              value={formData.direccion}
              onChange={e => setFormData({...formData, direccion: e.target.value})}
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-primary hover:bg-[#091f42] text-white font-medium py-3 rounded-lg mt-6 shadow-md transition-all active:scale-[0.98]"
          >
            Guardar Cliente
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Clientes;