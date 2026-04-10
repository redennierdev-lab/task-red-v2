import React, { useContext, useState } from 'react';
import { Layers, CheckCircle2, CircleDashed, Edit3, Trash2, Wrench, ShieldCheck, Search, LayoutGrid, FileText, Printer } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import TareaWizard from '../components/TareaWizard';
import ConfirmModal from '../components/ConfirmModal';
import PrinterActionModal from '../components/PrinterActionModal';
import BluetoothPrinter from '../utils/BluetoothPrinter';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

const Tareas = () => {
  const { tareas, clientes, tecnicos, deleteRecord, refreshAll } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Modal States
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  const [printerModal, setPrinterModal] = useState({ open: false, task: null, client: null });
  const [isPrinting, setIsPrinting] = useState(false);

  const handleEdit = (tarea) => {
    setEditingId(tarea.id);
    setIsWizardOpen(true);
  };

  const handleDeleteTrigger = (e, id) => {
    e.stopPropagation();
    setConfirmDelete({ open: true, id });
  };

  const handleConfirmDelete = async () => {
    if (confirmDelete.id) {
        await deleteRecord('tasks', confirmDelete.id);
        if (refreshAll) await refreshAll();
        setConfirmDelete({ open: false, id: null });
    }
  };

  const handlePrintTrigger = (e, tarea) => {
    e.stopPropagation();
    const cliente = (clientes || []).find(c => c.id === Number(tarea.cliente_id));
    setPrinterModal({ open: true, task: tarea, client: cliente });
  };

  const executePrint = async (tarea, cliente) => {
      const address = localStorage.getItem('printer_address');
      if (!address) {
          alert("No hay impresora configurada. Por favor, vincúlala desde el Dashboard.");
          return;
      }
      setIsPrinting(true);
      const connected = await BluetoothPrinter.connect(address);
      if (connected) {
          const fecha = new Date().toLocaleString('es-DO', { dateStyle: 'medium', timeStyle: 'short' });
          const receiptText = [
              '================================',
              '       RED ENNIER TASK          ',
              '================================',
              `TICKET  : ${tarea.ticket_id || `TSK-${tarea.id}`}`,
              `FECHA   : ${fecha}`,
              '--------------------------------',
              `CLIENTE : ${cliente?.nombre || 'N/A'}`,
              `TEL     : ${cliente?.telefono || 'N/A'}`,
              `DIR     : ${cliente?.direccion || 'N/A'}`,
              '--------------------------------',
              `SERVICIO: ${tarea.titulo}`,
              `ESTADO  : ${tarea.estado}`,
              '--------------------------------',
              `TOTAL   :  $${tarea.monto || '0.00'} USD`,
              '================================',
              '   GRACIAS POR SU PREFERENCIA  ',
              '================================',
              '\n\n\n',
          ].join('\n');

          const sent = await BluetoothPrinter.printRaw(receiptText);
          await BluetoothPrinter.disconnect();
          if (sent) {
              // Notificar éxito sin alert ruidoso si es posible, o usar algo suave
          }
      } else {
          alert("Error de conexión con la impresora.");
      }
      setIsPrinting(false);
      setPrinterModal({ open: false, task: null, client: null });
  };

  const handleSaveAsFile = async (tarea, cliente) => {
      try {
          const fecha = new Date().toLocaleString('es-DO', { dateStyle: 'medium', timeStyle: 'short' });
          const content = [
              '--------------------------------',
              '       RED ENNIER TASK          ',
              '--------------------------------',
              `TICKET  : ${tarea.ticket_id || ('TSK-' + tarea.id)}`,
              `FECHA   : ${fecha}`,
              `CLIENTE : ${cliente?.nombre || 'N/A'}`,
              `TÉRMINO : ${tarea.titulo}`,
              `ESTADO  : ${tarea.estado}`,
              `TOTAL   : $${tarea.monto || '0.00'} USD`,
              '--------------------------------',
          ].join('\n');

          const fileName = `Recibo_${tarea.ticket_id || tarea.id}.txt`;

          if (Capacitor.isNativePlatform()) {
              const savedFile = await Filesystem.writeFile({
                  path: fileName,
                  data: content,
                  directory: Directory.Documents,
                  encoding: 'utf8',
              });
              await Share.share({
                  title: 'Recibo Digital Red Ennier',
                  url: savedFile.uri,
              });
          } else {
              const blob = new Blob([content], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = fileName;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
          }
          setPrinterModal({ open: false, task: null, client: null });
      } catch (error) {
          console.error('Error al guardar:', error);
      }
  };

  const getClienteNombre = (id) => (clientes || []).find(c => c.id === Number(id))?.nombre || 'Desconocido';
  const getTecnicoNombre = (id) => (tecnicos || []).find(t => t.id === Number(id))?.nombre || 'No asignado';

  const filteredTareas = (tareas || []).filter(t => 
    t.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.estado?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getClienteNombre(t.cliente_id).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 page-transition pb-20">
      {/* Header Premium */}
      <div className="view-header">
        <div className="relative z-10 flex items-center gap-6">
            <div className="brand-icon">
                <FileText size={32} />
            </div>
            <div>
              <h2 className="view-title italic uppercase tracking-tighter">Gestión Operativa</h2>
              <p className="view-subtitle tracking-[0.4em] font-black opacity-80 uppercase italic">Tickets de Despliegue Técnico</p>
            </div>
        </div>
        <button 
          onClick={() => { setEditingId(null); setIsWizardOpen(true); }}
          className="btn-gradient relative z-10 w-full sm:w-auto px-10 shadow-2xl shadow-orange-500/20"
        >
          <Layers size={18} />
          <span>Nuevo Ticket</span>
        </button>
      </div>

      {/* Premium Search & Filters */}
      <div className="max-w-4xl mx-auto md:mx-0 space-y-6">
        <div className="relative group text-slate-900 dark:text-white">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none transition-all duration-500 text-orange-400 group-focus-within:text-fuchsia-500">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Rastrear ticket o cliente..."
            className="w-full pl-12 pr-6 py-2.5 bg-white dark:bg-slate-900 rounded-2xl border-2 border-orange-100 dark:border-slate-800 shadow-lg focus:ring-4 focus:ring-orange-500/5 focus:border-orange-400 transition-all outline-none font-bold text-slate-700 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 tracking-wide text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-3 italic">Estado:</span>
            <div className="inline-flex flex-wrap p-1 gap-1 bg-white dark:bg-slate-900 border-2 border-orange-50 dark:border-slate-800 rounded-2xl shadow-lg w-fit">
                {['Todos', 'Pendiente', 'En proceso', 'Completada'].map(tag => (
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

      {/* Grid de Tickets */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 px-1">
        {filteredTareas.map((tarea) => (
          <div key={tarea.id} className="compact-task-card group relative p-0 transition-all duration-300 overflow-hidden">
            <div className="h-0.5 bg-logo-gradient w-full opacity-60"></div>
            <div className="compact-card-accent"></div>
            
            <div className="p-2.5 bg-white dark:bg-slate-900 relative">
              <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-1">
                      <span className="mini-tag">
                          {tarea.ticket_id || `TSK-${tarea.id}`}
                      </span>
                      <div className={`mini-badge
                        ${tarea.estado === 'Pendiente' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20' : 
                          tarea.estado === 'En proceso' ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-500/20' :
                          'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20'}`}>
                        {tarea.estado === 'Pendiente' ? <CircleDashed size={6} className="animate-spin-slow"/> : <CheckCircle2 size={6}/>}
                        {tarea.estado}
                      </div>
                  </div>
                  
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={(e) => handlePrintTrigger(e, tarea)} className="p-1 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-blue-500 rounded-md shadow-sm transition-all">
                      <Printer size={10} />
                    </button>
                    <button onClick={() => handleEdit(tarea)} className="p-1 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-orange-500 rounded-md shadow-sm transition-all">
                      <Edit3 size={10} />
                    </button>
                    <button onClick={(e) => handleDeleteTrigger(e, tarea.id)} className="p-1 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-red-500 rounded-md shadow-sm transition-all">
                      <Trash2 size={10} />
                    </button>
                  </div>
              </div>
              
              <div className="flex-1 pt-0.5 relative z-10">
                 <h3 className="text-[10px] font-black text-slate-800 dark:text-white mb-0.5 uppercase tracking-tight group-hover:text-orange-500 transition-colors line-clamp-1 italic">{tarea.titulo}</h3>
                 <p className="text-slate-400 dark:text-slate-500 text-[8px] mb-1.5 leading-tight font-medium line-clamp-1 italic pr-1">{tarea.descripcion || 'Sin descripción.'}</p>
              </div>
              
              <div className="mt-auto pt-1.5 border-t border-slate-50 dark:border-slate-800">
                  <div className="flex items-center justify-between gap-1">
                      <div className="flex flex-col">
                          <div className="flex gap-1">
                              <div className="flex items-center gap-0.5 bg-violet-50 dark:bg-violet-500/5 px-1 py-0.5 rounded-full text-violet-700 dark:text-violet-400 border border-violet-100/50 dark:border-violet-500/20">
                                  <ShieldCheck size={7} />
                                  <span className="font-black text-[7px] uppercase truncate max-w-[40px]">{getTecnicoNombre(tarea.tecnico_admin_id).split(' ')[0] || 'N/A'}</span>
                              </div>
                              <div className="flex items-center gap-0.5 bg-orange-50 dark:bg-orange-500/5 px-1 py-0.5 rounded-full text-orange-600 dark:text-orange-400 border border-orange-100/50 dark:border-orange-500/20">
                                  <Wrench size={7} />
                                  <span className="font-black text-[7px] uppercase truncate max-w-[40px]">{getTecnicoNombre(tarea.instalador_id).split(' ')[0] || 'N/A'}</span>
                              </div>
                          </div>
                      </div>
                     <div className="text-right shrink-0">
                         <span className="font-black text-[8px] text-slate-800 dark:text-slate-300 uppercase italic tracking-tighter line-clamp-1 max-w-[70px]">{getClienteNombre(tarea.cliente_id)}</span>
                     </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTareas.length === 0 && (
        <div className="text-center py-32 bg-slate-50/50 dark:bg-slate-950/20 rounded-[4rem] border-2 border-dashed border-slate-200 dark:border-slate-800 shadow-inner group transition-colors">
          <div className="mx-auto w-24 h-24 bg-white dark:bg-slate-900 rounded-[2.5rem] flex items-center justify-center mb-8 text-slate-100 dark:text-slate-800 shadow-xl group-hover:scale-110 transition-transform duration-700">
            <LayoutGrid size={48} />
          </div>
          <h3 className="text-2xl font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-4">Mesa Silenciosa</h3>
          <p className="text-slate-300 dark:text-slate-600 text-[10px] uppercase font-black tracking-widest px-10 leading-loose mx-auto max-w-lg">
            No se han registrado secuencias operativas activas en este dispositivo. <br/> Despliegue su primer ticket con el botón superior.
          </p>
        </div>
      )}

      {/* Modern Wizard Implementation */}
      <TareaWizard 
        isOpen={isWizardOpen} 
        setIsOpen={setIsWizardOpen} 
        editingId={editingId}
        setEditingId={setEditingId}
      />

      {/* Confirmación de Eliminación */}
      <ConfirmModal 
        isOpen={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null })}
        onConfirm={handleConfirmDelete}
        title="Eliminar Ticket"
        message="¿Estás seguro de que deseas eliminar este ticket de la boveda local? Esta acción es irreversible."
      />

      {/* Modal de Impresión / Guardar */}
      <PrinterActionModal 
        isOpen={printerModal.open}
        onClose={() => setPrinterModal({ open: false, task: null, client: null })}
        task={printerModal.task}
        client={printerModal.client}
        onPrint={executePrint}
        onSave={handleSaveAsFile}
      />

      {/* Overlay de Carga de Impresión */}
      {isPrinting && (
          <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-slate-950/90 backdrop-blur-sm">
              <div className="text-center text-white space-y-4">
                  <Printer size={64} className="mx-auto text-orange-400 animate-bounce" />
                  <p className="font-black uppercase text-xl italic tracking-tighter">Enviando a impresora...</p>
                  <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">Asegúrate de que el Bluetooth esté activo</p>
              </div>
          </div>
      )}
    </div>
  );
};

export default Tareas;