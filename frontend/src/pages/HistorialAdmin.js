import React, { useState, useEffect } from 'react';
import { db } from '../db/db';
import { History, Clock, Database, User, Search, Printer, Bluetooth as BluetoothIcon } from 'lucide-react';
import BluetoothPrinter from '../utils/BluetoothPrinter';
import PrinterModal from '../components/PrinterModal';
import { Capacitor } from '@capacitor/core';

const HistorialAdmin = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [printingLog, setPrintingLog] = useState(null);
  
  const [selectedAddress, setSelectedAddress] = useState(localStorage.getItem('printer_address') || '');
  const [isPrinting, setIsPrinting] = useState(false);
  const [showPrinterModal, setShowPrinterModal] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);


  const handlePrint = async (log) => {
      if (!Capacitor.isNativePlatform()) {
          setPrintingLog(log);
          setTimeout(() => {
              window.print();
              setPrintingLog(null);
          }, 500);
          return;
      }

      setPrintingLog(log);
      if (!selectedAddress) {
          setShowPrinterModal(true);
          return;
      }
      await executePrint(log, selectedAddress);
  };

  const executePrint = async (log, address) => {
      setIsPrinting(true);
      const connected = await BluetoothPrinter.connect(address);
      if (connected) {
          const fecha = new Date(log.timestamp).toLocaleDateString();
          const hora = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const text = [
              '================================',
              '       RECIBO AUDITORIA         ',
              '        RED ENNIER C.A          ',
              '================================',
              `ID ACCION: #${log.id}`,
              `FECHA    : ${fecha}`,
              `HORA     : ${hora}`,
              '--------------------------------',
              `USUARIO  : ${log.usuario.toUpperCase()}`,
              `ACCION   : ${log.accion.toUpperCase()}`,
              `MODULO   : ${log.tabla.toUpperCase()}`,
              `REG ID   : ${log.registro_id}`,
              '--------------------------------',
              `DETALLE:`,
              `${log.detalle.substring(0, 31)}`,
              `${log.detalle.substring(31, 62)}`,
              `${log.detalle.substring(62, 93)}`,
              '--------------------------------',
              '    VERIFICACION DE SISTEMA     ',
              '================================',
              '\n\n\n'
          ].join('\n');

          await BluetoothPrinter.printRaw(text);
          await BluetoothPrinter.disconnect();
          setPrintingLog(null);
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
      if (printingLog) executePrint(printingLog, addr);
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await db.audit_logs.orderBy('timestamp').reverse().toArray();
      setLogs(res);
    } catch (error) {
      console.error("Error fetching local logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => 
    log.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.accion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.tabla.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.detalle && log.detalle.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getActionColor = (accion) => {
    switch (accion) {
      case 'CREACIÓN': return 'text-emerald-500 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20';
      case 'ELIMINACIÓN': return 'text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20';
      case 'EDICIÓN': return 'text-amber-500 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20';
      default: return 'text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20';
    }
  };

  return (
    <>
      {/* Vista de Impresión (Formato Ticket Bluetooth 58mm) */}
      {printingLog && (
        <div id="audit-print" className="hidden print:block absolute top-0 left-0 bg-white text-black p-4 w-[300px] mx-auto font-mono text-[12px] z-50">
          {/* Header */}
          <div className="text-center border-b-2 border-black pb-4 mb-4 mt-2">
              <h1 className="text-xl font-black uppercase tracking-tighter mb-1">RECIBO DE SOPORTE</h1>
              <p className="text-[10px] font-bold uppercase">SOLUCIONES Y SERVICIOS</p>
              <p className="text-[14px] font-black uppercase tracking-widest mt-1">RED ENNIER C.A</p>
              <p className="text-[10px] font-bold uppercase mt-1">RIF J- 502342257</p>
              <p className="text-[10px] font-bold uppercase mt-1">+58 414 851 0693</p>
          </div>

          {/* Audit Info */}
          <div className="mb-4">
              <div className="flex justify-between font-black text-[10px] uppercase">
                  <span>AUDITORÍA:</span>
                  <span>#{printingLog.id || Math.random().toString(36).substring(7, 12).toUpperCase()}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                  <span>FECHA:</span>
                  <span>{new Date(printingLog.timestamp).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                  <span>HORA:</span>
                  <span>{new Date(printingLog.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
          </div>

          {/* Details */}
          <div className="border-t border-dashed border-black pt-4 mb-4">
              <h2 className="text-[10px] font-black uppercase mb-1">USUARIO RESPONSABLE:</h2>
              <p className="text-[14px] font-black uppercase leading-tight mb-3">{printingLog.usuario}</p>
              
              <h2 className="text-[10px] font-black uppercase mb-1">TIPO DE ACCIÓN:</h2>
              <p className="text-[12px] font-black uppercase leading-tight mb-3">{printingLog.accion}</p>

              <h2 className="text-[10px] font-black uppercase mb-1">MÓDULO AFECTADO:</h2>
              <p className="text-[12px] font-black uppercase leading-tight mb-3">{printingLog.tabla}</p>

              <h2 className="text-[10px] font-black uppercase mb-1">ID DEL REGISTRO:</h2>
              <p className="text-[11px] font-black uppercase leading-tight mb-2 font-mono">{printingLog.registro_id}</p>
          </div>

          <div className="border-t border-dashed border-black pt-4 mb-4">
              <h2 className="text-[10px] font-black uppercase mb-1">DETALLE OPERACIÓN:</h2>
              <p className="text-[10px] leading-tight italic break-words whitespace-pre-wrap">{printingLog.detalle}</p>
          </div>

          {/* Footer Logo */}
          <div className="mt-8 pt-6 border-t-2 border-black text-center pb-4">
              {/* Logo Placeholder */}
              <div className="w-12 h-12 border-2 border-black mx-auto mb-4 flex items-center justify-center">
                  <div className="grid grid-cols-2 gap-0.5">
                      <div className="w-3 h-3 bg-black"></div>
                      <div className="w-3 h-3 bg-black"></div>
                      <div className="w-3 h-3 bg-black"></div>
                      <div className="w-3 h-3 bg-slate-200"></div>
                  </div>
              </div>
              
              <p className="text-[9px] font-black uppercase leading-relaxed px-1 mb-2">
                  Buen Retiro Calle Orinoco<br/>
                  Local #2 Manzana #83<br/>
                  (Oficina de Localizacion)
              </p>
              <p className="text-[8px] uppercase tracking-[0.2em] font-medium mt-3 border-t border-black pt-2 mx-4 inline-block">REDENNIER.COM</p>
          </div>
        </div>
      )}

      <div className={`space-y-8 page-transition pb-20 ${printingLog ? 'print:hidden' : ''}`}>
        <div className="view-header">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center w-full gap-8">
              <div className="flex items-center gap-6">
                  <div className="brand-icon">
                      <History size={32} />
                  </div>
                  <div>
                     <h2 className="view-title">Auditoría de Sistema</h2>
                     <p className="view-subtitle">Registro Maestro de Movimientos</p>
                  </div>
              </div>
            
              <button 
                onClick={fetchLogs} 
                className="btn-gradient relative overflow-hidden group px-10 shadow-2xl shadow-orange-500/20"
              >
                <Clock size={16}/> <span>Sincronizar Auditoría</span>
              </button>
          </div>
        </div>

        {/* Premium Search for Audit Logs */}
        <div className="max-w-4xl mx-auto md:mx-0">
          <div className="relative group text-slate-900 dark:text-white">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none transition-all duration-500 text-orange-400 group-focus-within:text-fuchsia-500">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Rastrear bitácora..."
              className="w-full pl-12 pr-6 py-2.5 bg-white dark:bg-slate-900 rounded-2xl border-2 border-orange-100 dark:border-slate-800 shadow-lg focus:ring-4 focus:ring-orange-500/5 dark:focus:ring-fuchsia-500/5 focus:border-orange-400 dark:focus:border-fuchsia-500 transition-all outline-none font-bold text-slate-700 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 tracking-wide text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors relative">
          <div className="h-1 bg-logo-gradient w-full opacity-80 group-hover:h-1.5 transition-all duration-500"></div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600">Timestamp</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600">Usuario</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600">Acción</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600">Módulo</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600">Registro ID</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600">Detalle</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Clock size={12} className="text-slate-300 dark:text-slate-700"/>
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 font-mono italic">
                           {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <User size={12} className="text-secondary dark:text-fuchsia-400"/>
                        <span className="text-[10px] font-black text-slate-700 dark:text-slate-200 uppercase italic">{log.usuario}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-[8px] font-black border uppercase tracking-widest ${getActionColor(log.accion)}`}>
                        {log.accion}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                         <Database size={12} className="text-slate-300 dark:text-slate-700"/>
                         <span className="text-[10px] font-bold text-slate-600 dark:text-slate-500 uppercase italic">{log.tabla}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-[10px] font-black text-slate-900 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                        {log.registro_id}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="text-[8px] sm:text-[10px] font-medium text-slate-500 dark:text-slate-400 italic max-w-xs truncate" title={log.detalle}>
                        {log.detalle}
                      </p>
                    </td>
                    <td className="p-4">
                        <button 
                          onClick={() => handlePrint(log)}
                          className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-200"
                        >
                          <Printer size={14} />
                        </button>
                    </td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && !loading && (
                  <tr>
                     <td colSpan="7" className="p-20 text-center">
                        <History size={40} className="mx-auto text-slate-100 dark:text-slate-800 mb-4"/>
                        <p className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest italic">No hay registros de auditoría que coincidan</p>
                     </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

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
                  <p className="font-black uppercase text-xl italic tracking-tighter">Imprimiendo Auditoría...</p>
              </div>
          </div>
      )}
    </>
  );
};

export default HistorialAdmin;
