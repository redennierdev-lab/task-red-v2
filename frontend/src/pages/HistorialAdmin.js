import React, { useState, useEffect } from 'react';
import { db } from '../db/db';
import { History, ShieldAlert, Clock, Database, User, Search } from 'lucide-react';

const HistorialAdmin = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

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
    <div className="space-y-8 page-transition pb-20">
      <div className="view-header">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center w-full gap-8">
            <div className="flex items-center gap-6">
                <div className="brand-icon">
                    <ShieldAlert size={32} />
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
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none transition-all duration-500 text-orange-400 group-focus-within:text-fuchsia-500 group-focus-within:scale-110">
            <Search size={22} />
          </div>
          <input
            type="text"
            placeholder="Rastrear usuario, acción o detalle en la bitácora..."
            className="w-full pl-16 pr-8 py-5 bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-orange-100 dark:border-slate-800 shadow-xl focus:ring-8 focus:ring-orange-500/5 dark:focus:ring-fuchsia-500/5 focus:border-orange-400 dark:focus:border-fuchsia-500 transition-all outline-none font-bold text-slate-700 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 tracking-wide text-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
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
                    <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 italic max-w-xs truncate" title={log.detalle}>
                      {log.detalle}
                    </p>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && !loading && (
                <tr>
                   <td colSpan="6" className="p-20 text-center">
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
  );
};

export default HistorialAdmin;
