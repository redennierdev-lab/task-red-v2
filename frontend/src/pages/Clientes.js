import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import Modal from '../components/shared/Modal';
import ClientWizard from '../features/clients/components/ClientWizard';
import ComprehensiveDetailModal from '../features/tasks/components/ComprehensiveDetailModal';
import { Search, Edit3, Trash2, Phone, Rocket, Users, MapPin, ChevronDown, Printer, Download } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import ConfirmModal from '../components/shared/ConfirmModal';


const Clientes = () => {
  const { clientes, fetchClientes, deleteRecord, updateRecord, refreshAll } = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  
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

  const handleDeleteTrigger = (e, id) => {
    e.stopPropagation();
    setConfirmDelete({ open: true, id });
  };

  const handleConfirmDelete = async () => {
    if (confirmDelete.id) {
        await deleteRecord('customers', confirmDelete.id);
        if (refreshAll) await refreshAll();
        setConfirmDelete({ open: false, id: null });
    }
  };

  const filteredClientes = clientes.filter(c => 
    c.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.cedula || c.identificacion)?.includes(searchTerm)
  );

  const handlePrint = (cliente) => {
      alert('Iniciando impresión de Ficha de Cliente: ' + cliente.nombre);
  };

  const handleSaveAsFile = async (cliente) => {
      try {
          const content = [
              '================================',
              '       FICHA DE CLIENTE         ',
              '================================',
              `NOMBRE  : ${cliente.nombre}`,
              `ID/RIF  : ${cliente.cedula || cliente.identificacion}`,
              `TEL     : ${cliente.telefono}`,
              `DIR     : ${cliente.direccion}`,
              '--------------------------------',
              'HISTORIAL: Activo',
              '================================',
              '      redennierdev.com          ',
              '================================',
          ].join('\n');

          const fileName = `CV_${cliente.cedula || cliente.id}.txt`;

          if (Capacitor.isNativePlatform()) {
              const savedFile = await Filesystem.writeFile({
                  path: fileName,
                  data: content,
                  directory: Directory.Documents,
                  encoding: 'utf8'
              });
              await Share.share({ title: 'Ficha de Cliente', url: savedFile.uri });
          } else {
              const blob = new Blob([content], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = fileName;
              link.click();
          }
      } catch (e) {
          console.error(e);
      }
  };

  return (
    <div className="space-y-6 page-transition">
      {/* MD3 View Header */}
      <div className="view-header">
        <div className="flex items-center gap-4">
            <div className="brand-icon">
                <Users size={24} />
            </div>
            <div>
              <h1 className="view-title">Directorio de Clientes</h1>
              <p className="view-subtitle">Base de Datos Maestro · RED ENNIER</p>
            </div>
        </div>
        <button onClick={() => setIsWizardOpen(true)} className="btn-gradient px-6 py-3">
          <Users size={17} />
          <span>Nuevo Cliente</span>
        </button>
      </div>

      {/* MD3 Search + Chips */}
      <div className="space-y-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
            <Search size={17} />
          </div>
          <input
            type="text"
            placeholder="Buscar por nombre o identificación…"
            className="md-input pl-11"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {['Todos', 'Corporativo', 'Residencial', 'Internet', 'Soporte'].map(tag => (
            <button
              key={tag}
              onClick={() => setSearchTerm(tag === 'Todos' ? '' : tag)}
              className={`md-chip transition-all ${
                (tag === 'Todos' && searchTerm === '') || searchTerm === tag
                  ? 'md-chip-primary'
                  : 'md-chip-neutral'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {filteredClientes.map((cliente) => (
          <div key={cliente.id} className="compact-task-card group relative p-0 transition-all duration-300 cursor-pointer" onClick={() => { setSelectedClient(cliente); setDetailModalOpen(true); }}>
            <div className="compact-card-accent"></div>
            
            <div className="p-3 bg-white dark:bg-slate-900 flex-1 relative flex flex-col">
              <div className="flex justify-between items-start mb-1.5 relative z-10">
                <div className="w-7 h-7 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-logo-gradient group-hover:text-white transition-all duration-500 shadow-sm border border-slate-100 dark:border-slate-700">
                  <Users size={12} />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={(e) => handleEdit(e, cliente)} className="p-1 bg-white dark:bg-slate-800 text-slate-400 hover:text-indigo-500 dark:hover:text-emerald-400 rounded-lg transition-all border border-slate-50 dark:border-slate-700 shadow-sm">
                    <Edit3 size={11} />
                  </button>
                  <button onClick={(e) => handleDeleteTrigger(e, cliente.id)} className="p-1 bg-white dark:bg-slate-800 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg transition-all border border-slate-50 dark:border-slate-700 shadow-sm">
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
              
              <div className="relative z-10">
                <h3 className="text-[10px] font-black text-slate-800 dark:text-white mb-0.5 uppercase tracking-tight group-hover:text-indigo-500 transition-colors line-clamp-1 italic">{cliente.nombre}</h3>
                <p className="text-[7px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 italic truncate">ID: {cliente.cedula || cliente.identificacion}</p>
                
                <div className="space-y-1.5 pt-2 border-t border-slate-50 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Phone size={8} className="text-indigo-500/50" />
                    <span className="text-[8px] font-bold font-mono">{cliente.telefono}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={8} className="text-indigo-500/50" />
                    <span className="text-[8px] font-black uppercase tracking-wider line-clamp-1 italic">{cliente.direccion}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredClientes.length === 0 && (
        <div className="col-span-full flex flex-col items-center justify-center py-20 rounded-[2rem] border-2 border-dashed border-slate-100 dark:border-slate-800 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
            <Users size={28} className="text-slate-300 dark:text-slate-600" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">Sin resultados</p>
            <p className="text-xs text-slate-300 dark:text-slate-700 mt-1">No se encontraron clientes con ese criterio</p>
          </div>
          <button onClick={() => setSearchTerm('')} className="md-chip md-chip-neutral">
            Limpiar filtro
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
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
            <label className="block text-[10px] font-black text-indigo-500 uppercase tracking-widest ml-0.5">Nombre Completo</label>
            <input 
              required
              type="text" 
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-full outline-none focus:bg-white focus:border-indigo-500 transition-all font-bold text-slate-700 shadow-inner text-sm"
              value={formData.nombre}
              onChange={e => setFormData({...formData, nombre: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="space-y-0.5">
              <label className="block text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-0.5">ID / RIF</label>
              <div className="flex bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-full focus-within:bg-white dark:focus-within:bg-slate-800 focus-within:border-indigo-500 transition-all shadow-inner overflow-hidden">
                  <select className="bg-transparent pl-3 pr-1 font-black text-slate-600 dark:text-slate-400 outline-none border-r border-slate-200 dark:border-slate-700 text-xs py-1.5" value={editPrefijo} onChange={e => { setEditPrefijo(e.target.value); setEditDocNum(''); }}>
                      <option value="V">V</option>
                      <option value="E">E</option>
                      <option value="J">J</option>
                      <option value="G">G</option>
                      <option value="P">P</option>
                  </select>
                  <div className="flex items-center text-slate-400 font-black pl-1.5 text-xs">-</div>
                  <input 
                    required 
                    type="text" 
                    placeholder={['J','G'].includes(editPrefijo) ? "12345678-9" : "12.345.678"} 
                    className="flex-1 bg-transparent px-2 py-1.5 outline-none font-black text-slate-700 dark:text-slate-200 tracking-wider text-xs" 
                    value={formatID(editPrefijo, editDocNum)} 
                    onChange={e => setEditDocNum(e.target.value.replace(/\D/g, ''))} 
                  />
              </div>
            </div>
            <div className="space-y-0.5">
              <label className="block text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-0.5 flex justify-between">
                <span>Teléfono (WhatsApp)</span>
                {editPhoneCode === '+58' && editPhoneNum.length > 0 && editPhoneNum.length !== 7 && <span className="text-red-500 text-[8px]">Incompleto</span>}
              </label>
              <div className={`flex items-center bg-slate-50 dark:bg-slate-800/50 border rounded-full focus-within:bg-white dark:focus-within:bg-slate-800 transition-all shadow-inner overflow-hidden ${editPhoneCode === '+58' && editPhoneNum.length > 0 && editPhoneNum.length !== 7 ? 'border-red-400' : 'border-slate-200 dark:border-slate-700 focus-within:border-indigo-500'}`}>
                  <div className="relative border-r border-slate-200 dark:border-slate-700">
                    <select 
                      className="appearance-none bg-transparent pl-2 pr-5 py-1.5 font-black text-slate-600 dark:text-slate-400 outline-none text-xs" 
                      value={editPhoneCode} 
                      onChange={e => setEditPhoneCode(e.target.value)}
                    >
                        {countries.map(c => (
                            <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                        ))}
                    </select>
                    <ChevronDown size={9} className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                  </div>

                  <div className="relative border-r border-slate-200 dark:border-slate-700 bg-indigo-500/5">
                    <select 
                      className="appearance-none bg-transparent pl-2 pr-5 py-1.5 font-black text-indigo-600 dark:text-indigo-400 outline-none text-xs" 
                      value={editPhoneOperator} 
                      onChange={e => setEditPhoneOperator(e.target.value)}
                    >
                        {vzlaOperators.map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>
                    <ChevronDown size={9} className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-400" />
                  </div>

                  <input 
                    required 
                    type="text" 
                    placeholder={editPhoneCode === '+58' ? "123-4567" : "1234567890"} 
                    className="flex-1 bg-transparent px-2 py-1.5 outline-none font-black text-slate-700 dark:text-slate-200 tracking-widest text-xs" 
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
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-3xl outline-none focus:bg-white focus:border-indigo-500 transition-all font-bold text-slate-700 shadow-inner resize-none text-sm"
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

      <ComprehensiveDetailModal 
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        data={selectedClient}
        type="client"
        onPrint={handlePrint}
        onSave={handleSaveAsFile}
      />

      <ConfirmModal 
        isOpen={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null })}
        onConfirm={handleConfirmDelete}
        title="Eliminar Cliente"
        message="¿Estás seguro de que deseas eliminar definitivamente a este cliente de la boveda local? Esta acción no se puede deshacer."
      />
    </div>
  );
};

export default Clientes;