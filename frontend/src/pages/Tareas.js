import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { Layers, CheckCircle2, CircleDashed, Rocket, ArrowRight, Edit3, Trash2, Wrench, ShieldCheck } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import Modal from '../components/Modal';

const Tareas = () => {
  const { tareas, clientes, tecnicos, fetchTareas, updateRecord, deleteRecord } = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ 
    titulo: '', 
    descripcion: '', 
    estado: 'Pendiente', 
    cliente_id: '', 
    tecnico_admin_id: '', 
    instalador_id: '' 
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateRecord('tasks', editingId, formData);
      } else {
        await axios.post('http://10.51.182.11:5000/api/tasks', formData);
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ titulo: '', descripcion: '', estado: 'Pendiente', cliente_id: '', tecnico_admin_id: '', instalador_id: '' });
      fetchTareas();
    } catch (error) {
      console.error('Error:', error);
      alert('Hubo un error al procesar la solicitud');
    }
  };

  const handleEdit = (e, tarea) => {
    e.stopPropagation();
    setEditingId(tarea.id);
    setFormData({
      titulo: tarea.titulo,
      descripcion: tarea.descripcion,
      estado: tarea.estado,
      cliente_id: tarea.cliente_id,
      tecnico_admin_id: tarea.tecnico_admin_id || '',
      instalador_id: tarea.instalador_id || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    const success = await deleteRecord('tasks', id);
    if (success) {
      alert('Ticket eliminado con éxito');
    } else {
      alert('Error al eliminar el ticket');
    }
  };

  // Autocompletar datos del cliente desde su ficha técnica al seleccionarlo
  const handleClienteChange = async (e) => {
    const cid = e.target.value;
    setFormData({ ...formData, cliente_id: cid });
    if (!cid) return;

    try {
      const res = await axios.get(`http://10.51.182.11:5000/api/customers/${cid}/equipment`);
      if (res.data && res.data.servicio_requerido) {
        const d = res.data;
        let info = `Servicio Requerido: ${d.servicio_requerido}\n`;
        if (d.tipo_instalacion) info += `Tipo de Instalación: ${d.tipo_instalacion}\n`;
        if (d.antena_tipo) info += `Equipos: Antena ${d.antena_tipo} ${d.antena_marca} ${d.antena_modelo} (IP: ${d.antena_ip})\n`;
        if (d.router_modelo) info += `Router: ${d.router_modelo} ${d.router_tipo}\n`;
        
        info += `\n>> Detalles de facturación e instalación de mano de obra pendientes.`;
        setFormData(prev => ({ ...prev, cliente_id: cid, descripcion: prev.descripcion ? prev.descripcion + '\n\n' + info : info }));
      }
    } catch (err) {
      console.error('Error obteniendo ficha tecnica del cliente', err);
    }
  };

  const getClienteNombre = (id) => clientes.find(c => c.id === Number(id))?.nombre || 'Desconocido';
  const getTecnicoNombre = (id) => tecnicos.find(t => t.id === Number(id))?.nombre || 'No asignado';

  return (
    <div className="space-y-8 page-transition">
      <div className="view-header">
        <div className="absolute top-0 right-0 w-64 h-64 bg-logo-gradient opacity-10 blur-[80px] rounded-full -mr-10 -mt-10"></div>
        <div className="relative z-10">
          <h2 className="view-title">Gestión de Tareas</h2>
          <p className="view-subtitle tracking-[0.3em]">Centro Operativo de Tickets</p>
        </div>
        <button 
          onClick={() => { setEditingId(null); setFormData({ titulo: '', descripcion: '', estado: 'Pendiente', cliente_id: '', tecnico_admin_id: '', instalador_id: '' }); setIsModalOpen(true); }}
          className="btn-gradient relative z-10 w-full sm:w-auto"
        >
          <Layers size={18} />
          <span className="uppercase tracking-widest text-[10px]">Nuevo Ticket</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 px-1">
        {tareas.map((tarea) => (
          <div key={tarea.id} className="bg-white rounded-[1.5rem] p-3 border border-slate-100 shadow-sm hover:shadow-md transition-all group flex flex-col relative overflow-hidden h-[180px]">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-orange-400 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-l-full"></div>
            
            <div className="flex justify-between items-center mb-2 pl-3">
                <div className="flex items-center gap-2">
                    <span className="bg-slate-900 text-white font-mono text-[9px] font-black px-2.5 py-1 rounded-md shadow-sm uppercase tracking-widest leading-none">
                        {tarea.ticket_id || `TSK-${tarea.id}`}
                    </span>
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">#{tarea.id}</span>
                </div>
                
                <div className="flex items-center gap-2 z-50">
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                    <button onClick={(e) => handleEdit(e, tarea)} className="p-1.5 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all" title="Editar">
                      <Edit3 size={14} />
                    </button>
                    <button onClick={(e) => handleDelete(e, tarea.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Eliminar">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className={`px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm border
                    ${tarea.estado === 'Pendiente' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                    {tarea.estado === 'Pendiente' ? <CircleDashed size={10} className="animate-spin-slow"/> : <CheckCircle2 size={10}/>}
                    <span className="leading-none">{tarea.estado}</span>
                  </div>
                </div>
            </div>
            
            <div className="relative z-10 flex-1 pl-3 pt-1">
               <h3 className="text-sm font-black text-slate-800 mb-1 group-hover:text-orange-500 transition-colors line-clamp-1">{tarea.titulo}</h3>
               <p className="text-slate-500 text-[11px] mb-3 leading-snug font-medium line-clamp-2 pr-4">{tarea.descripcion}</p>
            </div>
            
            <div className="mt-auto pt-3 border-t border-slate-100 pl-3">
                <div className="flex items-center justify-between">
                   <div className="flex gap-2">
                       <div className="flex flex-col">
                           <span className="text-[7px] font-black uppercase tracking-widest text-slate-400 mb-1">Equipo Designado</span>
                           <div className="flex gap-1.5">
                              <div className="flex items-center gap-1 bg-violet-50 px-2 py-0.5 rounded text-violet-700 border border-violet-100/50">
                                  <ShieldCheck size={10} />
                                  <span className="font-bold text-[9px] uppercase tracking-wider">{getTecnicoNombre(tarea.tecnico_admin_id).split(' ')[0] || 'N/A'}</span>
                              </div>
                              <div className="flex items-center gap-1 bg-orange-50 px-2 py-0.5 rounded text-orange-600 border border-orange-100/50">
                                  <Wrench size={10} />
                                  <span className="font-bold text-[9px] uppercase tracking-wider">{getTecnicoNombre(tarea.instalador_id).split(' ')[0] || 'N/A'}</span>
                              </div>
                           </div>
                       </div>
                   </div>
                   <div className="text-right flex flex-col justify-end">
                       <span className="block text-[7px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Cliente</span>
                       <span className="font-black text-[10px] text-slate-700 line-clamp-1">{getClienteNombre(tarea.cliente_id)}</span>
                   </div>
                </div>
            </div>
          </div>
        ))}
      </div>

      {tareas.length === 0 && (
        <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 shadow-sm px-10">
          <div className="mx-auto w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-8 text-slate-200">
            <Layers size={48} />
          </div>
          <h3 className="text-xl font-black text-slate-300 uppercase tracking-[0.2em] mb-3">Sin tickets activos</h3>
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingId(null); }} title={editingId ? "Actualizar Ticket" : "Generar Ficha de Trabajo"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Cliente Objetivo (Auto-carga ficha técnica)</label>
            <select required className="w-full px-5 py-4 bg-slate-50 border border-transparent rounded-full outline-none focus:bg-white focus:border-slate-200 transition-all font-bold text-slate-700 appearance-none shadow-sm text-sm" value={formData.cliente_id} onChange={handleClienteChange}>
              <option value="">Seleccionar Cliente...</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre} {c.apellidos}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-secondary uppercase tracking-widest ml-0.5">Asunto / Título Operativo</label>
            <input required placeholder="Ej: Instalación de Antena Cliente Nuevo" type="text" className="w-full px-5 py-4 bg-slate-50 border border-transparent rounded-full outline-none focus:bg-white focus:border-secondary/20 transition-all font-bold text-slate-700 shadow-inner text-sm" value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})} />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-accent uppercase tracking-widest ml-0.5">Hoja de Trabajo y Materiales (Descripción)</label>
            <textarea required placeholder="Detalle calculos de puntos de cámara, metraje de cable, etc..." rows="5" className="w-full px-5 py-4 bg-slate-50 border border-transparent rounded-[1.5rem] outline-none focus:bg-white focus:border-accent/20 transition-all font-medium text-slate-600 resize-none shadow-inner text-sm" value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-[2rem] border border-slate-100">
               <div className="space-y-1.5">
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Técnico Administrativo</label>
                 <select required className="w-full p-4 bg-white border border-transparent rounded-full outline-none focus:border-slate-200 transition-all font-bold text-xs text-slate-700 shadow-sm" value={formData.tecnico_admin_id} onChange={e => setFormData({...formData, tecnico_admin_id: e.target.value})}>
                   <option value="">Seleccionar...</option>
                   {tecnicos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                 </select>
               </div>
               <div className="space-y-1.5">
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Instalador en Campo</label>
                 <select required className="w-full p-4 bg-white border border-transparent rounded-full outline-none focus:border-slate-200 transition-all font-bold text-xs text-slate-700 shadow-sm" value={formData.instalador_id} onChange={e => setFormData({...formData, instalador_id: e.target.value})}>
                   <option value="">Seleccionar...</option>
                   {tecnicos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                 </select>
               </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Estado Operativo</label>
            <select className="w-full px-5 py-4 bg-slate-50 border border-transparent rounded-full outline-none focus:bg-white focus:border-slate-200 transition-all font-bold text-slate-700 appearance-none shadow-sm text-sm" value={formData.estado} onChange={e => setFormData({...formData, estado: e.target.value})}>
              <option value="Pendiente">Pendiente</option>
              <option value="Completada">Completada</option>
            </select>
          </div>

          <button type="submit" className="btn-gradient w-full py-4 mt-6 text-sm">
            <span>{editingId ? 'Guardar Cambios' : 'Desplegar Secuencia Operativa'}</span>
            <Rocket size={18} />
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Tareas;