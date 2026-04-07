import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { History, ShieldAlert, Clock, Database, User } from 'lucide-react';

const HistorialAdmin = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await axios.get('http://10.51.182.11:5000/api/audit');
      setLogs(res.data);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (accion) => {
    switch (accion) {
      case 'CREACIÓN': return 'text-emerald-500 bg-emerald-50 border-emerald-100';
      case 'ELIMINACIÓN': return 'text-red-500 bg-red-50 border-red-100';
      case 'EDICIÓN': return 'text-amber-500 bg-amber-50 border-amber-100';
      default: return 'text-blue-500 bg-blue-50 border-blue-100';
    }
  };

  return (
    <div className="space-y-6 page-transition">
      <div className="view-header">
        <div className="absolute top-0 right-0 w-64 h-64 bg-logo-gradient opacity-10 blur-[80px] rounded-full -mr-10 -mt-10"></div>
        <div className="relative z-10">
          <h2 className="view-title flex items-center gap-2"><ShieldAlert className="text-secondary"/> Auditoría de Sistema</h2>
          <p className="view-subtitle tracking-[0.3em]">Registro Histórico de Movimientos</p>
        </div>
        <button onClick={fetchLogs} className="btn-gradient rounded-full px-6 py-2">
            <Clock size={14}/> <span>Refrescar</span>
        </button>
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
              {logs.map(log => (
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
              {logs.length === 0 && !loading && (
                <tr>
                   <td colSpan="6" className="p-20 text-center">
                      <History size={40} className="mx-auto text-slate-100 mb-4"/>
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No hay registros de auditoría</p>
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
