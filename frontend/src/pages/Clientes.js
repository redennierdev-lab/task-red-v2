import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import Modal from '../components/Modal';
import ClientWizard from '../components/ClientWizard';
import { Search, Edit3, Trash2, Phone, Rocket, Users, MapPin, ChevronDown } from 'lucide-react';

const Clientes = () => {
  const { clientes, fetchClientes, deleteRecord, updateRecord } = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
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
  const [editPhoneOperator, setEditPhoneOperator] = useState('414');
  const [editPhoneNum, setEditPhoneNum] = useState('');

  const countries = useMemo(() => [
    { code: '+58', flag: '🇻🇪', name: 'Venezuela' },
    { code: '+1', flag: '🇺🇸', name: 'USA' },
    { code: '+57', flag: '🇨🇴', name: 'Colombia' },
    { code: '+34', flag: '🇪🇸', name: 'España' },
    { code: '+507', flag: '🇵🇦', name: 'Panamá' },
  ], []);

  const vzlaOperators = useMemo(() => [
    { value: '414', label: '0414' },
    { value: '424', label: '0424' },
    { value: '412', label: '0412' },
    { value: '416', label: '0416' },
    { value: '426', label: '0426' },
    { value: '286', label: '0286' },
    { value: '212', label: '0212' },
  ], []);

  const formatID = (prefijo, val) => {
    const num = String(val).replace(/\D/g, '');
    if (['V', 'E', 'P'].includes(prefijo)) {
        const limited = num.substring(0, 9);
        return limited.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    } else if (['J', 'G'].includes(prefijo)) {
        const limited = num.substring(0, 9);
        if (limited.length > 8) {
            return limited.slice(0, 8) + "-" + limited.slice(8, 9);
        }
        return limited;
    }
    return num;
  };

  const formatPhoneLocal = (num) => {
    if (num.length > 3) {
        return num.slice(0, 3) + "-" + num.slice(3);
    }
    return num;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (editingId) {
        const fullPhone = `${editPhoneCode}${editPhoneCode === '+58' ? editPhoneOperator : ''}${editPhoneNum}`;
        payload.identificacion = `${editPrefijo}-${formatID(editPrefijo, editDocNum)}`;
        payload.cedula = payload.identificacion;
        payload.telefono = fullPhone;
        payload.whatsapp = fullPhone;
        await updateRecord('customers', editingId, payload);
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ nombre: '', identificacion: '', telefono: '', direccion: '' });
      // Clientes refresh is handled by updateRecord -> refreshAll
    } catch (error) {
      console.error('Error updating client locally:', error);
      alert('Hubo un error al procesar la actualización en la base de datos local');
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
        // Extraer operadora (3 dígitos después del +58)
        const possibleOp = telFull.substring(3, 6);
        if (vzlaOperators.some(o => o.value === possibleOp)) {
            setEditPhoneOperator(possibleOp);
            setEditPhoneNum(telFull.substring(6));
        } else {
            setEditPhoneOperator('414');
            setEditPhoneNum(telFull.substring(3));
        }
    } else {
        const country = countries.find(c => telFull.startsWith(c.code));
        if (country) {
            setEditPhoneCode(country.code);
            setEditPhoneNum(telFull.substring(country.code.length));
        } else {
            setEditPhoneCode('+58');
            setEditPhoneNum(telFull);
        }
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
    <div className="space-y-6 page-transition">
      {/* Premium Header */}
      <div className="view-header">
        <div className="relative z-10 flex items-center gap-6">
            <div className="brand-icon">
                <Users size={32} />
            </div>
            <div>
              <h2 className="view-title italic uppercase">Directorio de Clientes</h2>
              <p className="view-subtitle tracking-[0.4em] font-black opacity-80 uppercase italic">Gestión de Base de Datos Maestro</p>
            </div>
        </div>
        <button onClick={() => setIsWizardOpen(true)} className="btn-gradient relative z-10 w-full sm:w-auto">
          <Users size={18} />
          <span>Nuevo Cliente</span>
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
            placeholder="Rastrear identidad o nombre..."
            className="w-full pl-12 pr-6 py-2.5 bg-white dark:bg-slate-900 rounded-2xl border-2 border-orange-100 dark:border-slate-800 shadow-lg focus:ring-4 focus:ring-orange-500/5 dark:focus:ring-fuchsia-500/5 focus:border-orange-400 dark:focus:border-fuchsia-500 transition-all outline-none font-bold text-slate-700 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 tracking-wide text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-3 italic">Segmento:</span>
            <div className="inline-flex flex-wrap p-1 gap-1 bg-white dark:bg-slate-900 border-2 border-orange-50 dark:border-slate-800 rounded-2xl shadow-lg w-fit">
                {['Todos', 'Corporativo', 'Residencial', 'Internet', 'Soporte'].map(tag => (
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
        {filteredClientes.map((cliente) => (
          <div key={cliente.id} className="premium-card p-0 group flex flex-col relative overflow-hidden transition-all duration-300 transform hover:-translate-y-1">
            <div className="h-1 bg-logo-gradient w-full opacity-80 group-hover:h-1.5 transition-all duration-500"></div>
            <div className="p-3 bg-white dark:bg-slate-900 flex-1 relative flex flex-col">
            <div className="absolute -right-2 -top-2 w-16 h-16 bg-slate-50 dark:bg-fuchsia-500/5 rounded-full transition-all group-hover:bg-orange-500 dark:group-hover:bg-fuchsia-500 group-hover:opacity-5"></div>
            
            <div className="flex justify-between items-start mb-2 relative z-10">
              <div className="w-7 h-7 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-orange-500 dark:group-hover:bg-fuchsia-500 group-hover:text-white transition-all duration-500 shadow-sm border border-slate-100 dark:border-slate-700">
                <Users size={12} />
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={(e) => handleEdit(e, cliente)} className="p-1.5 bg-white dark:bg-slate-800 text-slate-400 hover:text-orange-500 dark:hover:text-fuchsia-400 rounded-md transition-all border border-slate-50 dark:border-slate-700 shadow-sm">
                  <Edit3 size={11} />
                </button>
                <button onClick={(e) => handleDelete(e, cliente.id)} className="p-1.5 bg-white dark:bg-slate-800 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded-md transition-all border border-slate-50 dark:border-slate-700 shadow-sm">
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
            <div className="relative z-10">
              <h3 className="text-[11px] font-black text-slate-800 dark:text-white mb-0.5 uppercase tracking-tight group-hover:text-orange-500 dark:group-hover:text-fuchsia-400 transition-colors line-clamp-1 italic">{cliente.nombre}</h3>
              <p className="text-[7px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 italic">ID: {cliente.cedula || cliente.identificacion}</p>
              
              <div className="space-y-1.5 pt-2 border-t border-slate-50 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Phone size={9} className="text-orange-500/50" />
                  <span className="text-[9px] font-bold font-mono">{cliente.telefono}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={9} className="text-orange-500/50" />
                  <span className="text-[8px] font-black uppercase tracking-wider line-clamp-1 italic">{cliente.direccion}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        ))}
      </div>

      {filteredClientes.length === 0 && (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
          <div className="mx-auto w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-6 text-slate-200 dark:text-slate-700">
            <Users size={40} />
          </div>
          <h3 className="text-lg font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">No se encontraron clientes</h3>
          <p className="text-slate-300 dark:text-slate-600 text-sm mt-2 font-medium">Prueba con otros términos de búsqueda</p>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-0.5">ID / RIF</label>
              <div className="flex bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-full focus-within:bg-white dark:focus-within:bg-slate-800 focus-within:border-orange-500 transition-all shadow-inner overflow-hidden">
                  <select className="bg-transparent pl-4 pr-1 font-black text-slate-600 dark:text-slate-400 outline-none border-r border-slate-200 dark:border-slate-700" value={editPrefijo} onChange={e => { setEditPrefijo(e.target.value); setEditDocNum(''); }}>
                      <option value="V">V</option>
                      <option value="E">E</option>
                      <option value="J">J</option>
                      <option value="G">G</option>
                      <option value="P">P</option>
                  </select>
                  <div className="flex items-center text-slate-400 font-black pl-2">-</div>
                  <input 
                    required 
                    type="text" 
                    placeholder={['J','G'].includes(editPrefijo) ? "12345678-9" : "12.345.678"} 
                    className="flex-1 bg-transparent px-3 py-3.5 outline-none font-black text-slate-700 dark:text-slate-200 tracking-wider text-sm" 
                    value={formatID(editPrefijo, editDocNum)} 
                    onChange={e => setEditDocNum(e.target.value.replace(/\D/g, ''))} 
                  />
              </div>
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-0.5 flex justify-between">
                <span>Teléfono (WhatsApp)</span>
                {editPhoneCode === '+58' && editPhoneNum.length > 0 && editPhoneNum.length !== 7 && <span className="text-red-500 text-[8px]">Incompleto</span>}
              </label>
              <div className={`flex items-center bg-slate-50 dark:bg-slate-800/50 border rounded-full focus-within:bg-white dark:focus-within:bg-slate-800 transition-all shadow-inner overflow-hidden ${editPhoneCode === '+58' && editPhoneNum.length > 0 && editPhoneNum.length !== 7 ? 'border-red-400' : 'border-slate-200 dark:border-slate-700 focus-within:border-orange-500'}`}>
                  <div className="relative border-r border-slate-200 dark:border-slate-700">
                    <select 
                      className="appearance-none bg-transparent pl-4 pr-7 py-3.5 font-black text-slate-600 dark:text-slate-400 outline-none" 
                      value={editPhoneCode} 
                      onChange={e => { setEditPhoneCode(e.target.value); setEditPhoneNum(''); }}
                    >
                        {countries.map(c => (
                            <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                        ))}
                    </select>
                    <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                  </div>

                  {editPhoneCode === '+58' && (
                    <div className="relative border-r border-slate-200 dark:border-slate-700 bg-orange-500/5">
                      <select 
                        className="appearance-none bg-transparent pl-4 pr-7 py-3.5 font-black text-orange-600 dark:text-orange-400 outline-none" 
                        value={editPhoneOperator} 
                        onChange={e => setEditPhoneOperator(e.target.value)}
                      >
                          {vzlaOperators.map(o => (
                              <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                      </select>
                      <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-orange-400" />
                    </div>
                  )}

                  <input 
                    required 
                    type="text" 
                    placeholder={editPhoneCode === '+58' ? "123-4567" : "1234567890"} 
                    className="flex-1 bg-transparent px-3 py-3.5 outline-none font-black text-slate-700 dark:text-slate-200 tracking-widest text-sm" 
                    value={editPhoneCode === '+58' ? formatPhoneLocal(editPhoneNum) : editPhoneNum} 
                    onChange={e => {
                      let val = e.target.value.replace(/\D/g, '');
                      if (editPhoneCode === '+58' && val.length > 7) val = val.substring(0, 7);
                      setEditPhoneNum(val);
                    }} 
                  />
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

      <ClientWizard isOpen={isWizardOpen} setIsOpen={setIsWizardOpen} />
    </div>
  );
};

export default Clientes;