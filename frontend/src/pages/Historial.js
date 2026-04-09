import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { History, CheckCircle2, XCircle, Search, Printer } from 'lucide-react';
import ReciboTicket from '../components/ReciboTicket';
import PrinterModal from '../components/PrinterModal';
import BluetoothPrinter from '../utils/BluetoothPrinter';
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
    <div className="space-y-8 page-transition">
      <div className="view-header">
        <div className="relative z-10 flex items-center gap-6">
            <div className="brand-icon">
                <History size={32} />
            </div>
            <div>
              <h2 className="view-title italic uppercase tracking-tighter">Historial Técnico</h2>
              <p className="view-subtitle tracking-[0.4em] font-black opacity-80 uppercase italic">Registro Operativo Finalizado RED ENNIER</p>
            </div>
        </div>
      </div>

      {/* Consistency Search */}
      <div className="max-w-4xl mx-auto md:mx-0">
        <div className="relative group text-slate-900 dark:text-white">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none transition-all duration-500 text-orange-400 group-focus-within:text-fuchsia-500 group-focus-within:scale-110">
            <Search size={22} />
          </div>
          <input
            type="text"
            placeholder="Rastrear registros operativos finalizados..."
            className="w-full pl-16 pr-8 py-5 bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-orange-100 dark:border-slate-800 shadow-xl focus:ring-8 focus:ring-orange-500/5 dark:focus:ring-fuchsia-500/5 focus:border-orange-400 dark:focus:border-fuchsia-500 transition-all outline-none font-bold text-slate-700 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 tracking-wide text-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 pb-20 px-1">
        {historialTareas.map(tarea => {
            const cliente = getCliente(tarea.cliente_id);
            return (
              <div key={tarea.id} className="premium-card p-3 flex flex-col relative overflow-hidden group">
                <div className="absolute top-2 right-2 flex items-center gap-1 z-20">
                    <button 
                        onClick={() => handlePrint(tarea, cliente)}
                        className="p-1.5 bg-slate-900 text-white rounded-lg hover:bg-black transition-colors shadow-lg"
                    >
                        <Printer size={10}/>
                    </button>
                    <div className={`px-1.5 py-0.5 rounded-full text-[7px] font-black uppercase tracking-tighter flex items-center gap-0.5 border
                        ${tarea.estado === 'Completada' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20' : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-500/20'}`}>
                        {tarea.estado === 'Completada' ? <CheckCircle2 size={8}/> : <XCircle size={8}/>}
                        <span>{tarea.estado}</span>
                    </div>
                </div>
                
                <div className="flex-1 pt-1 pr-12">
                   <h3 className="text-[10px] font-black text-slate-800 dark:text-white mb-0.5 uppercase tracking-tight group-hover:text-orange-500 dark:group-hover:text-fuchsia-400 transition-colors line-clamp-1 italic">{tarea.titulo}</h3>
                   <p className="text-slate-400 dark:text-slate-500 text-[8px] mb-2 leading-tight font-medium line-clamp-1 italic">{tarea.descripcion}</p>
                </div>

                <div className="mt-auto border-t border-slate-50 dark:border-slate-800 pt-2 flex items-center justify-between gap-1">
                    <span className="text-[7px] font-black text-slate-800 dark:text-slate-300 uppercase italic tracking-tighter line-clamp-1 max-w-[60px]">{cliente.nombre || 'SF'}</span>
                    <span className="text-[6px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest line-clamp-1 italic">{cliente.direccion?.substring(0, 15) || 'S/D'}</span>
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
