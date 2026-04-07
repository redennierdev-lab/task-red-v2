import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import Modal from '../components/Modal';
import ClientWizard from '../components/ClientWizard';
import { Search, Edit3, Trash2, Phone, Rocket, Users, MapPin } from 'lucide-react';
import axios from 'axios';

const Clientes = () => {
  const { clientes, fetchClientes, deleteRecord, updateRecord } = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    nombre: '',
    identificacion: '',
    telefono: '',
    direccion: ''
  });

  const [editPrefijo, setEditPrefijo] = useState('V');
  const [editDocNum, setEditDocNum] = useState('');
  const [editPhoneCode, setEditPhoneCode] = useState('+58');
  const [editPhoneNum, setEditPhoneNum] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (editingId) {
        payload.identificacion = `${editPrefijo}-${editDocNum}`;
        payload.telefono = `${editPhoneCode}${editPhoneNum}`;
        await updateRecord('customers', editingId, payload);
      } else {
        await axios.post('http://10.51.182.11:5000/api/customers', formData);
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ nombre: '', identificacion: '', telefono: '', direccion: '' });
      fetchClientes();
    } catch (error) {
      console.error('Error:', error);
      alert('Hubo un error al procesar la solicitud');
    }
  };

  const handleEdit = (e, cliente) => {
    e.stopPropagation();
    setEditingId(cliente.id);
    
    let docFull = cliente.cedula || cliente.identificacion || 'V-';
    let p = docFull.split('-')[0] || 'V';
    let num = docFull.split('-')[1] || '';
    setEditPrefijo(['V','E','J','G','P'].includes(p) ? p : 'V');
    setEditDocNum(num);

    let telFull = cliente.telefono || '';
    if (telFull.startsWith('+58')) {
        setEditPhoneCode('+58');
        setEditPhoneNum(telFull.substring(3));
    } else if (telFull.startsWith('+1')) {
        setEditPhoneCode('+1');
        setEditPhoneNum(telFull.substring(2));
    } else if (telFull.startsWith('+57')) {
        setEditPhoneCode('+57');
        setEditPhoneNum(telFull.substring(3));
    } else {
        setEditPhoneCode('+58');
        setEditPhoneNum(telFull);
    }

    setFormData({
      nombre: cliente.nombre,
      identificacion: docFull,
      telefono: telFull,
      direccion: cliente.direccion
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    console.log(`🗑️ FRONTEND: Iniciando eliminación de cliente ID: ${id}`);
    const success = await deleteRecord('customers', id);
    if (success) {
      alert('Cliente eliminado con éxito');
    } else {
      alert('Error al eliminar el cliente');
    }
  };

  const filteredClientes = clientes.filter(c => 
    c.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.cedula || c.identificacion)?.includes(searchTerm)
  );

  return (
    <div className="space-y-8 page-transition">
      {/* Premium Header */}
      <div className="view-header bg-slate-900">
        <div className="absolute top-0 right-0 w-64 h-64 bg-logo-gradient opacity-10 blur-[80px] rounded-full -mr-10 -mt-10"></div>
        <div className="relative z-10">
          <h2 className="view-title text-white">Directorio de Clientes</h2>
          <p className="view-subtitle tracking-[0.3em] text-slate-400">Gestión de Base de Datos</p>
        </div>
      </div>

      {/* Modern Search */}
      <div className="relative group max-w-md px-1">
        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-slate-400 group-focus-within:text-orange-500 transition-colors">
          <Search size={18} />
        </div>
        <input
          type="text"
          placeholder="Buscar por nombre o ID..."
          className="w-full pl-14 pr-6 py-4 bg-white rounded-3xl border border-slate-100 shadow-sm focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/20 transition-all outline-none font-medium text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Grid of Premium Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 px-1">
        {filteredClientes.map((cliente) => (
          <div key={cliente.id} className="premium-card p-4 group flex flex-col relative overflow-hidden bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all">
            <div className="absolute -right-3 -top-3 w-20 h-20 bg-slate-50 rounded-full transition-all group-hover:bg-orange-500 group-hover:opacity-5"></div>
            
            <div className="flex justify-between items-start mb-3 relative z-10">
              <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-orange-500 group-hover:text-white transition-all duration-500 shadow-sm">
                <Users size={16} />
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0">
                <button onClick={(e) => handleEdit(e, cliente)} className="p-2 bg-white text-slate-400 hover:text-orange-500 hover:shadow-md rounded-lg transition-all border border-slate-50">
                  <Edit3 size={14} />
                </button>
                <button onClick={(e) => handleDelete(e, cliente.id)} className="p-2 bg-white text-slate-400 hover:text-red-500 hover:shadow-md rounded-lg transition-all border border-slate-50">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div className="relative z-10">
              <h3 className="text-base font-black text-slate-800 mb-0.5 uppercase tracking-tight group-hover:text-orange-500 transition-colors line-clamp-1 italic">{cliente.nombre}</h3>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-3 italic">ID: {cliente.cedula || cliente.identificacion}</p>
              
              <div className="space-y-2 pt-3 border-t border-slate-50">
                <div className="flex items-center gap-2.5 text-slate-500">
                  <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                    <Phone size={12} />
                  </div>
                  <span className="text-xs font-bold">{cliente.telefono}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                    <MapPin size={10} />
                  </div>
                  <span className="text-[10px] font-bold line-clamp-1">{cliente.direccion}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredClientes.length === 0 && (
        <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 shadow-sm">
          <div className="mx-auto w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 text-slate-200">
            <Users size={40} />
          </div>
          <h3 className="text-lg font-black text-slate-400 uppercase tracking-widest">No se encontraron clientes</h3>
          <p className="text-slate-300 text-sm mt-2 font-medium">Prueba con otros términos de búsqueda</p>
        </div>
      )}

      {/* Create/Edit Modal for EDITING ONLY */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingId(null);
        }}
        title="Actualizar Cliente"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-[10px] font-black text-orange-500 uppercase tracking-widest ml-0.5">Nombre Completo</label>
            <input 
              required
              type="text" 
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-full outline-none focus:bg-white focus:border-orange-500 transition-all font-bold text-slate-700 shadow-inner text-sm"
              value={formData.nombre}
              onChange={e => setFormData({...formData, nombre: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-secondary uppercase tracking-widest ml-0.5">ID / RIF</label>
              <div className="flex bg-slate-50 border border-slate-200 rounded-full focus-within:bg-white focus-within:border-orange-500 transition-all shadow-inner overflow-hidden">
                  <select className="bg-transparent pl-4 pr-1 font-black text-slate-600 outline-none border-r border-slate-200" value={editPrefijo} onChange={e => setEditPrefijo(e.target.value)}>
                      <option value="V">V</option>
                      <option value="E">E</option>
                      <option value="J">J</option>
                      <option value="G">G</option>
                      <option value="P">P</option>
                  </select>
                  <div className="flex items-center text-slate-400 font-black pl-2">-</div>
                  <input required type="text" placeholder="12345678" className="flex-1 bg-transparent px-3 py-3.5 outline-none font-black text-slate-700 tracking-wider text-sm" value={editDocNum} onChange={e=>setEditDocNum(e.target.value.replace(/\D/g, ''))} />
              </div>
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-secondary uppercase tracking-widest ml-0.5 flex justify-between">
                <span>Teléfono</span>
                {!/^(412|414|424|416|426|422|286)\d{7}$/.test(editPhoneNum) && editPhoneNum.length > 2 && <span className="text-red-500 text-[8px]">Invalido</span>}
              </label>
              <div className={`flex bg-slate-50 border rounded-full focus-within:bg-white transition-all shadow-inner overflow-hidden ${!/^(412|414|424|416|426|422|286)\d{7}$/.test(editPhoneNum) && editPhoneNum.length > 2 ? 'border-red-400' : 'border-slate-200 focus-within:border-orange-500'}`}>
                  <select className="bg-transparent pl-4 pr-1 font-black text-slate-600 outline-none border-r border-slate-200" value={editPhoneCode} onChange={e => setEditPhoneCode(e.target.value)}>
                      <option value="+58">🇻🇪 +58</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+57">🇨🇴 +57</option>
                  </select>
                  <input required type="text" placeholder="4141234567" className="flex-1 bg-transparent px-3 py-3.5 outline-none font-black text-slate-700 tracking-wider text-sm" value={editPhoneNum} onChange={(e) => {
                      let val = e.target.value.replace(/\D/g, '');
                      if (val.length > 10) val = val.substring(0, 10);
                      setEditPhoneNum(val);
                  }} />
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <label className="block text-[10px] font-black text-accent uppercase tracking-widest ml-0.5">Dirección Física</label>
            <textarea 
              required
              rows="2"
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-[1.5rem] outline-none focus:bg-white focus:border-orange-500 transition-all font-bold text-slate-700 shadow-inner resize-none text-sm"
              value={formData.direccion}
              onChange={e => setFormData({...formData, direccion: e.target.value})}
            />
          </div>
          <button 
            type="submit"
            className="btn-gradient w-full mt-6 py-4 rounded-full"
          >
            <span>Confirmar Registro</span>
            <Rocket size={18} />
          </button>
        </form>
      </Modal>

      <ClientWizard />
    </div>
  );
};

export default Clientes;