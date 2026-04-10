import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { History, CheckCircle2, XCircle, Search, Printer } from 'lucide-react';
import ReciboTicket from '../features/printer/components/ReciboTicket';
import PrinterModal from '../features/printer/components/PrinterModal';
import BluetoothPrinter from '../features/printer/services/BluetoothPrinter';

import { Capacitor } from '@capacitor/core';

const Historial = () => {
  const { tareas, clientes } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [printingTask, setPrintingTask] = useState(null);
  const [printingClient, setPrintingClient] = useState(null);

  // Bluetooth Printer States
  const [showPrinterModal, setShowPrinterModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(localStorage.getItem('printer_address') || '');
  const [isPrinting, setIsPrinting] = useState(false);


  const handlePrint = async (tarea, cliente) => {
      if (!Capacitor.isNativePlatform()) {
          setPrintingTask(tarea);
          setPrintingClient(cliente);
          setTimeout(() => {
              window.print();
              setPrintingTask(null);
              setPrintingClient(null);
          }, 500);
          return;
      }

      setPrintingTask(tarea);
      setPrintingClient(cliente);
      
      if (!selectedAddress) {
          setShowPrinterModal(true);
          return;
      }
      await executePrint(tarea, cliente, selectedAddress);
  };

  const executePrint = async (tarea, cliente, address) => {
      setIsPrinting(true);
      const connected = await BluetoothPrinter.connect(address);
      if (connected) {
          const fecha = new Date().toLocaleString('es-DO', { dateStyle: 'medium', timeStyle: 'short' });
          const text = [
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
              '      redennierdev.com          ',
              '================================',
              '\n\n\n',
          ].join('\n');

          await BluetoothPrinter.printRaw(text);
          await BluetoothPrinter.disconnect();
          setPrintingTask(null);
          setPrintingClient(null);
      } else {
          setShowPrinterModal(true);
      }
      setIsPrinting(false);
  };

  const handleSelectPrinter = (addr, name) => {
      setSelectedAddress(addr);
      localStorage.setItem('printer_address', addr);
      localStorage.setItem('printer_name', name || 'Impresora');
      setShowPrinterModal(false);
      if (printingTask) executePrint(printingTask, printingClient, addr);
  };

  // Consider "Completada" and "No completada" as history for a technician
  const historialTareas = tareas.filter(t => 
    (t.estado === 'Completada' || t.estado === 'No completada') &&
    (t.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || 
     (t.ticket_id && t.ticket_id.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const getCliente = (id) => clientes.find(c => c.id === Number(id)) || {};

  return (
    <div className="space-y-6 page-transition">
      <div className="view-header">
        <div className="flex items-center gap-4">
            <div className="brand-icon">
                <History size={24} />
            </div>
            <div>
              <h1 className="view-title">Historial Técnico</h1>
              <p className="view-subtitle">Registro Operativo Finalizado · RED ENNIER</p>
            </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
          <Search size={17} />
        </div>
        <input
          type="text"
          placeholder="Rastrear registros finalizados por título o ticket…"
          className="md-input pl-11"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 pb-6 px-1">
        {historialTareas.map(tarea => {
            const cliente = getCliente(tarea.cliente_id);
            return (
              <div key={tarea.id} className="compact-task-card group relative p-0 transition-all duration-300">
                <div className="compact-card-accent opacity-100 bg-slate-200 dark:bg-slate-800"></div>
                
                <div className="p-3 bg-white dark:bg-slate-900 relative z-10">
                  <div className="flex justify-between items-start mb-1.5">
                    <div className="flex items-center gap-1">
                      <span className="mini-tag">
                        {tarea.ticket_id || `TSK-${tarea.id}`}
                      </span>
                      <div className={`mini-badge
                        ${tarea.estado === 'Completada' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20' : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-500/20'}`}>
                        {tarea.estado === 'Completada' ? <CheckCircle2 size={8}/> : <XCircle size={8}/>}
                        <span>{tarea.estado}</span>
                      </div>
                    </div>


                  </div>
                  
                  <div className="flex-1 pt-0.5">
                    <h3 className="text-[10px] font-black text-slate-800 dark:text-white mb-0.5 uppercase tracking-tight group-hover:text-orange-500 transition-colors line-clamp-1 italic">{tarea.titulo}</h3>
                    <p className="text-slate-400 dark:text-slate-500 text-[8px] mb-2 leading-tight font-medium line-clamp-1 italic">{tarea.descripcion}</p>
                  </div>

                  <div className="mt-auto border-t border-slate-50 dark:border-slate-800 pt-2 flex items-center justify-between gap-1">
                      <span className="text-[7px] font-black text-slate-800 dark:text-slate-300 uppercase italic tracking-tighter line-clamp-1 max-w-[60px]">{cliente.nombre || 'SF'}</span>
                      <span className="text-[6px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest line-clamp-1 italic">{cliente.direccion?.substring(0, 15) || 'S/D'}</span>
                  </div>
                </div>
              </div>
            );
        })}
      </div>

      {/* Printable Area */}
      {printingTask && <ReciboTicket data={printingTask} cliente={printingClient} />}

      {historialTareas.length === 0 && (
         <div className="text-center py-20 transition-colors">
             <History size={48} className="mx-auto text-slate-200 dark:text-slate-800 mb-4"/>
             <p className="text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest text-xs italic">Sin registros inactivos</p>
         </div>
      )}

      <PrinterModal 
        isOpen={showPrinterModal}
        onClose={() => setShowPrinterModal(false)}
        onSelect={handleSelectPrinter}
        selectedAddress={selectedAddress}
      />

      {/* Overlay de impresión */}
      {isPrinting && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/90 backdrop-blur-sm">
              <div className="text-center text-white space-y-4">
                  <Printer size={64} className="mx-auto text-orange-400 animate-bounce" />
                  <p className="font-black uppercase text-xl italic tracking-tighter">Imprimiendo Ticket...</p>
              </div>
          </div>
      )}
    </div>
  );
};

export default Historial;
