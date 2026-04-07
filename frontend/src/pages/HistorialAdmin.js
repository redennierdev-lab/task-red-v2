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
      case 'CREACIÓN': return 'text-emerald-500 bg-emerald-50 border-emerald-100';
      case 'ELIMINACIÓN': return 'text-red-500 bg-red-50 border-red-100';
      case 'EDICIÓN': return 'text-amber-500 bg-amber-50 border-amber-100';
      default: return 'text-blue-500 bg-blue-50 border-blue-100';
    }
  };

  return (
    <div className="space-y-8 page-transition">
      <div className="view-header">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center w-full gap-8">
            <div className="flex items-center gap-6">
                <div className="brand-icon">
                    <ShieldAlert size={32} />
                </div>
                <div>
                   <h2 className="view-title italic uppercase">Auditoría de Sistema</h2>
                   <p className="view-subtitle tracking-[0.4em] font-black opacity-80 uppercase italic">Registro Maestro de Movimientos</p>
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
        <div className="relative group">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none transition-all duration-500 text-orange-400 group-focus-within:text-fuchsia-500 group-focus-within:scale-110">
            <Search size={22} />
          </div>
          <input
            type="text"
            placeholder="Rastrear usuario, acción o detalle en la bitácora..."
            className="w-full pl-16 pr-8 py-5 bg-white rounded-[2rem] border-2 border-orange-100 shadow-xl focus:ring-8 focus:ring-orange-500/5 focus:border-orange-400 transition-all outline-none font-bold text-slate-700 placeholder:text-slate-300 tracking-wide text-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Timestamp</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Usuario</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Acción</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Módulo</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Registro ID</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Clock size={12} className="text-slate-300"/>
                      <span className="text-[10px] font-bold text-slate-500 font-mono">
                         {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <User size={12} className="text-secondary"/>
                      <span className="text-[10px] font-black text-slate-700 uppercase">{log.usuario}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-[8px] font-black border uppercase tracking-widest ${getActionColor(log.accion)}`}>
                      {log.accion}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                       <Database size={12} className="text-slate-300"/>
                       <span className="text-[10px] font-bold text-slate-600 uppercase italic">{log.tabla}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-[10px] font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg">
                      {log.registro_id}
                    </span>
                  </td>
                  <td className="p-4">
                    <p className="text-[10px] font-medium text-slate-500 italic max-w-xs truncate" title={log.detalle}>
                      {log.detalle}
                    </p>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && !loading && (
                <tr>
                   <td colSpan="6" className="p-20 text-center">
                      <History size={40} className="mx-auto text-slate-100 mb-4"/>
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No hay registros de auditoría que coincidan</p>
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
