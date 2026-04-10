import React, { useContext, useEffect, useState, useMemo } from 'react';
import { 
  LayoutDashboard, Download, Database, Users, Wrench, FileText, 
  Printer, CircleDashed, Edit3, XCircle, MessageCircle, Navigation, Play, Pause, ClipboardCheck,
  TrendingUp, LayoutList, Bluetooth, CheckCircle2, ChevronRight, Plus, Search, Trash2, 
  Building2, UserCircle, ShieldCheck, Calendar, Wifi, MapPin, Sparkles, History
} from 'lucide-react';

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { db, logAction, exportData } from '../services/database';
import BluetoothPrinter from '../features/printer/services/BluetoothPrinter';
import PrinterModal from '../features/printer/components/PrinterModal';
import PrinterActionModal from '../features/printer/components/PrinterActionModal';
import ComprehensiveDetailModal from '../features/tasks/components/ComprehensiveDetailModal';
import ReciboTicket from '../features/printer/components/ReciboTicket';


const AdminView = ({ stats, tareas, clientes, onPrint, onViewDetail, onNavigate }) => {
  const { theme } = useContext(AppContext);
  const [dbStatus, setDbStatus] = useState({ state: 'checking', ping: 0 });
  const [isExporting, setIsExporting] = useState(false);

  const isDark = theme === 'dark';

  // Fetch real income data
  const rawIncomes = useLiveQuery(() => db.incomes.toArray(), []);

  const handleBackup = async () => {
    try {
        setIsExporting(true);
        const data = await exportData();
        const fileName = `RedEnnier_Backup_${new Date().toISOString().split('T')[0]}.json`;
        const content = JSON.stringify(data, null, 2);

        if (Capacitor.isNativePlatform()) {
            // Android Path
            const savedFile = await Filesystem.writeFile({
                path: fileName,
                data: content,
                directory: Directory.Cache,
                encoding: 'utf8'
            });

            await Share.share({
                title: 'Respaldo Maestro Red Ennier',
                text: 'Archivo de respaldo de la base de datos local.',
                url: savedFile.uri,
                dialogTitle: 'Enviar o Guardar Respaldo',
            });
        } else {
            // Web Path
            const blob = new Blob([content], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
        
        await logAction('Admin', 'RESPALDO', 'System', 0, 'Se generó un respaldo maestro de la base de datos');
        if (!Capacitor.isNativePlatform()) alert('Respaldo generado y descargado con éxito.');
    } catch (error) {
        console.error('Error en respaldo:', error);
        alert('Error al generar el respaldo: ' + error.message);
    } finally {
        setIsExporting(false);
    }
  };

  useEffect(() => {
    const checkLocalDB = async () => {
        try {
            const start = Date.now();
            await db.on('ready');
            setDbStatus({ state: 'online', ping: Date.now() - start });
        } catch (e) {
            setDbStatus({ state: 'error', ping: 0 });
        }
    };
    checkLocalDB();
  }, []);

  // Metricas de Tareas
  const pendientes = (tareas || []).filter(t => t.estado === 'Pendiente').length;
  const enProceso = (tareas || []).filter(t => t.estado === 'En proceso').length;
  const completadas = (tareas || []).filter(t => t.estado === 'Completada').length;
  const fallidas = (tareas || []).filter(t => t.estado === 'No completada').length;

  const taskData = [
    { name: 'Completadas', value: completadas, color: '#10b981' }, // emerald
    { name: 'En Proceso', value: enProceso, color: '#4F46E5' }, // indigo
    { name: 'Pendientes', value: pendientes, color: '#64748b' }, // slate
    { name: 'Fallidas', value: fallidas, color: '#EF4444' }     // red
  ];

  // Ingresos Reales
  const totalIngreso = useMemo(() => {
      return (rawIncomes || []).reduce((sum, i) => sum + (parseFloat(i.monto) || 0), 0);
  }, [rawIncomes]);

  const ingresosTimeline = useMemo(() => {
      if (!rawIncomes) return [];
      return rawIncomes.slice(-10).map(i => ({
          name: i.fecha ? i.fecha.split('-').slice(1).join('/') : '?',
          ingreso: parseFloat(i.monto) || 0
      }));
  }, [rawIncomes]);

  return (
    <div className="space-y-6 page-transition pb-20">
      {/* Welcome Header & DB Monitor Refined */}
      <div className="view-header">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center w-full gap-6">
            <div className="flex items-center gap-4">
                <div className="brand-icon w-12 h-12">
                    <LayoutDashboard size={24} />
                </div>
                <div>
                   <h2 className="view-title">Centro de Mando</h2>
                   <p className="view-subtitle">RED ENNIER V3</p>
                </div>
            </div>
          
            <div className="flex flex-wrap gap-3 justify-center md:justify-end items-center">
                <button 
                  onClick={handleBackup}
                  disabled={isExporting}
                  className="btn-gradient px-6 py-2.5 shadow-xl shadow-indigo-500/10"
                >
                  <Download size={14} className={isExporting ? 'animate-bounce' : ''} />
                  <span className="relative z-10 text-[9px]">{isExporting ? 'Generando...' : 'Respaldo Maestro'}</span>
                </button>

                <div className="flex items-center gap-3 bg-indigo-50 dark:bg-slate-800 px-4 py-2.5 rounded-2xl border border-indigo-100 dark:border-slate-700">
                    <div className="relative flex h-3 w-3">
                      {(dbStatus.state === 'online') && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                      <span className={`relative inline-flex rounded-full h-3 w-3 ${dbStatus.state === 'online' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase italic leading-none">
                            Vault <span className="text-indigo-500 opacity-60 ml-0.5">{dbStatus.ping}ms</span>
                        </span>
                    </div>
                </div>
            </div>
        </div>
      </div>
      {/* Text Carousel - Compact & Professional */}
      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-2 px-6 py-2 bg-slate-100/50 dark:bg-slate-800/20 rounded-2xl border border-slate-200/50 dark:border-slate-700/30 overflow-hidden w-full">
          <div className="flex-1 w-full min-w-0">
              <marquee className="text-[10px] sm:text-[11px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-[0.2em] italic flex items-center pt-0.5">
                  DIOS PRIMERO CARLOS.! SALMOS 16:8
              </marquee>
          </div>
          <div className="hidden sm:flex items-center gap-2 border-l border-slate-200 dark:border-slate-700 pl-8 shrink-0">
              <Database size={12} className="text-indigo-500/50" />
              <span className="text-[8px] font-bold uppercase text-slate-400 tracking-[0.2em] italic">MODO AUTÓNOMO</span>
          </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
        {stats.map((stat, idx) => (
          <div 
            key={idx} 
            className="premium-card p-0 flex flex-col group overflow-hidden relative transform hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            onClick={() => stat.path && onNavigate(stat.path)}
          >
            <div className="h-1 bg-logo-gradient w-full opacity-80 group-hover:h-1.5 transition-all duration-500"></div>
            <div className="p-3 flex flex-col justify-between h-full relative">
            <div className="absolute top-0 right-0 w-12 h-12 bg-orange-50 dark:bg-fuchsia-500/5 rounded-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
            <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-slate-800 flex items-center justify-center mb-1.5 transition-all duration-500 group-hover:rotate-12 text-indigo-500 dark:text-fuchsia-400 group-hover:bg-logo-gradient group-hover:text-white relative z-10">
              {React.cloneElement(stat.icon, { size: 14 })}
            </div>
            <div className="relative z-10">
              <div className="flex items-end justify-between mb-0">
                <span className="text-lg font-black tracking-tighter text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-fuchsia-400 transition-colors italic">{stat.value}</span>
              </div>
              <p className="text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-[0.1em] text-[7px] italic truncate">{stat.label}</p>
            </div>
            </div>
            {stat.label === 'Operaciones Cola' && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    const firstPending = (tareas || []).find(t => t.estado === 'Pendiente');
                    if (firstPending) {
                        const cliente = (clientes || []).find(c => String(c.id) === String(firstPending.cliente_id));
                        onPrint(firstPending, cliente);
                    } else {
                        alert('No hay tareas pendientes.');
                    }
                  }} 
                  className="tactical-icon-button absolute bottom-2 right-2 bg-orange-100 text-orange-600 rounded-full hover:bg-orange-200 z-20 shadow-sm active:scale-95"
                >
                    <Printer size={13}/>
                </button>
            )}
          </div>
        ))}
      </div>

      {/* ANALYTICS Refined */}
      {/* Widget de Tasas Manuales y ANALYTICS */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
              <div className="premium-card p-4 flex flex-col justify-between bg-gradient-to-br from-indigo-500 to-indigo-700 text-white border-none shadow-2xl relative overflow-hidden group transition-all duration-500 hover:scale-[1.02] h-40">
                  <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all"></div>
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-white/70 mb-1 italic">Capital Captado Mensual</p>
                      <h3 className="text-3xl font-black text-white tracking-tighter">${totalIngreso.toLocaleString()}<span className="text-xs text-white/40 ml-1">.00</span></h3>
                    </div>
                    <div className="mt-4 flex items-center gap-2 bg-white/20 w-fit px-3 py-1 rounded-full backdrop-blur-md border border-white/20">
                        <TrendingUp size={10} className="text-white fill-white" />
                        <span className="text-[8px] font-black uppercase tracking-widest italic">Flujo Positivo</span>
                    </div>
                  </div>
                  <div className="absolute bottom-4 right-4 w-12 h-12 bg-white/20 rounded-[1.5rem] flex items-center justify-center text-white backdrop-blur-xl shadow-inner z-10 border border-white/30 transform rotate-3">
                      <TrendingUp size={20} />
                  </div>
              </div>
          </div>

          <div className="lg:col-span-1 premium-card p-6 relative overflow-hidden group">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-6 flex items-center gap-2 italic">
                 <LayoutDashboard size={18} className="text-fuchsia-500"/> Distribución de Tareas
              </h3>
              <div className="h-[200px] w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                          <Pie 
                            data={taskData} 
                            cx="50%" cy="50%" 
                            innerRadius={70} 
                            outerRadius={90} 
                            paddingAngle={8} 
                            dataKey="value"
                            stroke="none"
                          >
                              {taskData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                          </Pie>
                          <Tooltip 
                              contentStyle={{ 
                                  backgroundColor: isDark ? '#0f172a' : '#fff', 
                                  borderColor: isDark ? '#334155' : '#f1f5f9', 
                                  borderRadius: '1.5rem', 
                                  boxShadow: '0 20px 50px rgba(0,0,0,0.1)', 
                                  fontSize: '11px', 
                                  color: isDark ? '#fff' : '#1e293b', 
                                  fontWeight: 900, 
                                  textTransform: 'uppercase' 
                              }} 
                              itemStyle={{ color: isDark ? '#fff' : '#1e293b' }}
                          />
                      </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-2xl font-black text-slate-900 dark:text-white">{(tareas || []).length}</span>
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Total</span>
                  </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                  {taskData.map(d => (
                      <div key={d.name} className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{backgroundColor: d.color}}></div>
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{d.name} ({d.value})</span>
                      </div>
                  ))}
              </div>
          </div>

          <div className="lg:col-span-2 premium-card p-6 flex flex-col justify-between border-2 border-emerald-50 dark:border-slate-800 transition-all duration-500 hover:border-emerald-400">
              <div className="flex justify-between items-center mb-6">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-2 italic">
                    <TrendingUp size={14} className="text-emerald-500"/> Rendimiento de Cobros Anual
                </p>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-[8px] font-black uppercase text-slate-400">Ingresos</span>
                </div>
              </div>
              
              <div className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ingresosTimeline} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#f1f5f9'} />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: isDark ? '#475569' : '#cbd5e1', fontWeight: 900 }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: isDark ? '#475569' : '#cbd5e1', fontWeight: 900 }} />
                          <Tooltip 
                              cursor={{fill: isDark ? '#1e293b' : '#f8fafc', opacity: 0.5}} 
                              contentStyle={{ 
                                  backgroundColor: isDark ? '#0f172a' : '#fff', 
                                  border: 'none', 
                                  borderRadius: '1.5rem', 
                                  boxShadow: '0 20px 50px rgba(0,0,0,0.1)', 
                                  color: isDark ? '#fff' : '#1e293b', 
                                  fontSize: '10px', 
                                  fontWeight: 900, 
                                  textTransform: 'uppercase' 
                              }} 
                          />
                          <Bar dataKey="ingreso" fill="#10b981" radius={[8, 8, 0, 0]} maxBarSize={30} />
                      </BarChart>
                  </ResponsiveContainer>
              </div>
          </div>
      {/* Recent Operations Monitoring (Synced with new UI) */}
      <div className="space-y-4 mt-8">
          <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.3em] italic flex items-center gap-2">
                  <LayoutList size={14} className="text-indigo-500"/> Monitor de Operaciones Recientes
              </h3>
              <button onClick={() => onNavigate('/tasks')} className="text-[9px] font-black text-indigo-500 uppercase tracking-widest italic hover:underline">Ver Historial Maestro</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
              {(tareas || []).slice(-6).reverse().map(t => (
                  <div key={t.id} onClick={() => onViewDetail(t)} className="compact-task-card group relative p-0 transition-all duration-300 cursor-pointer overflow-hidden border-2 border-orange-50 dark:border-slate-800 hover:border-indigo-500">
                      <div className="p-3 bg-white dark:bg-slate-900 flex flex-col justify-between h-full relative h-[100px]">
                          <div className="flex justify-between items-start mb-1">
                              <span className="mini-tag">#{t.ticket_id || t.id}</span>
                              <div className={`mini-badge text-[6px] px-1 py-0.5
                                  ${t.estado === 'Completada' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse'}`}>
                                  {t.estado}
                              </div>
                          </div>
                          <div>
                              <h4 className="text-[9px] font-black text-slate-800 dark:text-white uppercase leading-tight line-clamp-1 italic group-hover:text-indigo-500">{t.titulo}</h4>
                              <div className="flex items-center gap-1 mt-1 opacity-60">
                                  <Wrench size={7} className="text-indigo-500"/>
                                  <p className="text-[7px] font-black text-slate-400 uppercase italic truncate">{t.operador || 'Sistema'}</p>
                              </div>
                          </div>
                      </div>
                  </div>
              ))}
            </div>
        </div>
      </div>
    </div>
  );
};

const TaskTimer = ({ started_at }) => {
    const [elapsed, setElapsed] = useState('00h 00m');

    useEffect(() => {
        if (!started_at) return;
        
        const update = () => {
            const diff = Date.now() - started_at;
            const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
            const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
            setElapsed(`${h}h ${m}m`);
        };

        update();
        const interval = setInterval(update, 60000); // 1 MINUTO en lugar de 1 SEGUNDO
        return () => clearInterval(interval);
    }, [started_at]);

    return (
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-2xl border border-emerald-500/20 font-mono text-[10px] font-black tracking-tighter shadow-inner">
            <TrendingUp size={12} className="animate-pulse" />
            {elapsed}
        </div>
    );
};

const TechnicianView = ({ tareas, clientes, updateRecord, refreshAll, onPrint, onViewDetail, onDelete, onEdit }) => {
  const activas = (tareas || []).filter(t => t.estado !== 'Completada' && t.estado !== 'No completada');

  const updateEstado = async (id, nuevoEstado) => {
      try {
          const tarea = (tareas || []).find(t => t.id === id);
          const payload = { estado: nuevoEstado };
          
          if (nuevoEstado === 'En proceso') {
              payload.started_at = Date.now();
          }

          // AUTOMATIZACIÓN DE INGRESOS
          if (nuevoEstado === 'Completada' && tarea && parseFloat(tarea.monto) > 0) {
              const incomeExists = await db.incomes.where('origen_id').equals(id).count();
              if (incomeExists === 0) {
                  await db.incomes.add({
                      categoria: 'Tarea',
                      monto: parseFloat(tarea.monto),
                      metodo_pago: 'Efectivo',
                      fecha: new Date().toISOString().split('T')[0],
                      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
                      descripcion: `Abone automático - Tarea: ${tarea.titulo}`,
                      origen_id: id,
                      tipo_origen: 'Automático'
                  });
                  await logAction('Sistema', 'AUTO_INGRESO', 'Incomes', id, `Cobro detectado por tarea completada: $${tarea.monto}`);
              }
          }

          await updateRecord('tasks', id, payload);
          await logAction('Técnico', 'ESTADO', 'Tasks', id, `Ticket ${id} movido a: ${nuevoEstado}`);
      } catch (error) {
          console.error("Error actualizando estado localmente:", error);
      }
  };

  return (
    <div className="space-y-8 page-transition pb-20">
      <div className="view-header">
        <div className="relative z-10 flex items-center gap-6">
            <div className="brand-icon">
                <FileText size={32} />
            </div>
            <div>
                <h2 className="view-title">Tablero de Ejecución</h2>
                <p className="view-subtitle">Control Operativo de Campo</p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-2">
          {(activas || []).map(t => {
              const cliente = (clientes || []).find(c => String(c.id) === String(t.cliente_id));
              const enProceso = t.estado === 'En proceso';
              const pausada = t.estado === 'Pausada';
              
              const phone = cliente?.whatsapp || cliente?.telefono || '';
              const coords = cliente?.coordenadas || '';

              return (
                  <div key={t.id} className={`compact-task-card group relative p-0 transition-all duration-300 overflow-hidden ${enProceso ? 'ring-2 ring-emerald-500/20 shadow-lg' : ''}`}>
                      <div className="h-0.5 bg-logo-gradient w-full opacity-60 group-hover:h-1 transition-all duration-500"></div>
                      <div className="compact-card-accent"></div>
                      {enProceso && <div className="absolute top-0 left-0 w-full h-0.5 bg-emerald-500 animate-pulse z-20"></div>}

                      <div className="p-2.5 bg-white dark:bg-slate-900 flex-1 flex flex-col relative">
                          <div className="flex justify-between items-start mb-1">
                              <div className="flex items-center gap-1">
                                  <span className="mini-tag">
                                      {t.ticket_id || `TSK-${t.id}`}
                                  </span>
                                  <div className={`mini-badge
                                      ${enProceso ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20' : 
                                        pausada ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20' : 
                                        'bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-700'}`}>
                                      {enProceso ? <TrendingUp size={6} className="animate-pulse"/> : <CircleDashed size={6} className="animate-spin-slow" />}
                                      {t.estado}
                                  </div>
                              </div>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                  <button onClick={(e) => { e.stopPropagation(); onEdit?.(t); }} className="tactical-icon-button bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-orange-500 rounded-xl shadow-sm">
                                      <Edit3 size={11}/>
                                  </button>
                                  <button onClick={(e) => { e.stopPropagation(); onDelete?.(t.id); }} className="tactical-icon-button bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-red-500 rounded-xl shadow-sm">
                                      <XCircle size={11}/>
                                  </button>
                              </div>
                          </div>

                          <div className="flex-1 pt-0.5 relative z-10 cursor-pointer" onClick={() => onViewDetail(t)}>
                              <h3 className="text-[10px] font-black text-slate-800 dark:text-white mb-0.5 uppercase tracking-tight group-hover:text-orange-500 transition-colors line-clamp-1 italic">
                                  {t.titulo}
                              </h3>
                              <p className="text-slate-400 dark:text-slate-500 text-[8px] mb-1.5 leading-tight font-medium line-clamp-1 italic pr-1">
                                  {t.descripcion || 'Sin descripción.'}
                              </p>
                          </div>

                          <div className="mt-auto pt-1.5 border-t border-slate-50 dark:border-slate-800">
                              <div className="flex items-center justify-between gap-1">
                                  <div className="flex flex-col">
                                      <div className="flex gap-1">
                                          <div className="flex items-center gap-0.5 bg-violet-50 dark:bg-violet-500/5 px-1 py-0.5 rounded-full text-violet-700 dark:text-violet-400 border border-violet-100/50 dark:border-violet-500/20">
                                              <CircleDashed size={7}/>
                                              <span className="font-black text-[7px] uppercase truncate max-w-[40px]">{t.servicio_tipo || 'Servicio'}</span>
                                          </div>
                                          <div className="flex items-center gap-0.5 bg-orange-50 dark:bg-orange-500/5 px-1 py-0.5 rounded-full text-orange-600 dark:text-orange-400 border border-orange-100/50 dark:border-orange-500/20">
                                              <Wrench size={7}/>
                                              <span className="font-black text-[7px] uppercase truncate max-w-[40px]">Técnico</span>
                                          </div>
                                      </div>
                                  </div>
                                  <div className="text-right shrink-0">
                                      <span className="font-black text-[8px] text-slate-800 dark:text-slate-300 uppercase italic tracking-tighter line-clamp-1 max-w-[70px]">
                                          {t.operador || 'RED'}
                                      </span>
                                  </div>
                              </div>
                              
                              <div className="mt-2 grid grid-cols-6 gap-1">
                                  <a href={`https://wa.me/${phone.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="flex items-center justify-center py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-emerald-500 transition-all border border-slate-100 dark:border-slate-700">
                                      <MessageCircle size={12}/>
                                  </a>
                                  <a href={coords ? `https://www.google.com/maps?q=${coords}` : '#'} target={coords ? "_blank" : "_self"} onClick={() => !coords && alert('No hay coordenadas.')} rel="noreferrer" className="flex items-center justify-center py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-blue-500 transition-all border border-slate-100 dark:border-slate-700">
                                      <Navigation size={12}/>
                                  </a>
                                  <button onClick={() => onViewDetail(t)} className="flex items-center justify-center py-1.5 rounded-lg bg-orange-50 dark:bg-orange-500/10 text-orange-600 hover:bg-orange-100 transition-all border border-orange-100 dark:border-orange-500/20">
                                      <Printer size={12}/>
                                  </button>
                                  {!enProceso ? (
                                      <button onClick={() => updateEstado(t.id, 'En proceso')} className="col-span-3 flex items-center justify-center py-1.5 bg-logo-gradient text-white rounded-lg gap-2 text-[8px] font-bold italic">
                                          <Play size={10}/> INICIAR
                                      </button>
                                  ) : (
                                      <>
                                          <button onClick={() => updateEstado(t.id, 'Pausada')} className="flex items-center justify-center py-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 hover:bg-amber-100 transition-all border border-amber-100 dark:border-amber-500/20">
                                              <Pause size={12}/>
                                          </button>
                                          <button onClick={() => updateEstado(t.id, 'Completada')} className="flex items-center justify-center py-1.5 rounded-lg bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all">
                                              <CheckCircle2 size={12}/>
                                          </button>
                                          <button onClick={() => updateEstado(t.id, 'No completada')} className="flex items-center justify-center py-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-100 transition-all border border-red-100 dark:border-red-500/20">
                                              <XCircle size={12}/>
                                          </button>
                                      </>
                                  )}
                              </div>
                          </div>
                      </div>
                  </div>
              );
          })}
          
          {activas.length === 0 && (
             <div className="col-span-full premium-card py-32 flex flex-col items-center justify-center border-dashed border-4 border-slate-100 dark:border-slate-800 opacity-60">
               <div className="brand-icon w-20 h-20 mb-6 bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 shadow-none rotate-0">
                 <FileText size={40}/>
               </div>
               <h3 className="text-xl font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-2 italic">Cero Tareas Asignadas</h3>
               <p className="text-[10px] text-slate-300 dark:text-slate-600 font-black uppercase tracking-widest mb-8">A la espera de nuevas órdenes operativas</p>
               
               <button 
                onClick={async () => {
                    const cId = await db.customers.add({ nombre: 'Sede Principal', telefono: '0412-1111111', direccion: 'Avenida Libertad, Edf Task Red', status: 'Activo' });
                    await db.tasks.add({ 
                        ticket_id: 'TSK-001',
                        titulo: 'Inspección Técnica de Enlace',
                        descripcion: 'Verificación de potencia y alineación de antena principal.',
                        cliente_id: cId,
                        estado: 'Pendiente',
                        monto: 35
                    });
                    refreshAll();
                }}
                className="btn-gradient px-10 py-4 text-[11px] font-black uppercase tracking-[0.2em] italic"
               >
                 <ClipboardCheck size={18}/> Inicializar Operación
               </button>
             </div>
          )}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { clientes, tecnicos, tareas, servicios, userRole, refreshAll, updateRecord, deleteRecord } = useContext(AppContext);
  const [printingTask, setPrintingTask] = useState(null);
  const [printingClient, setPrintingClient] = useState(null);
  const [showPrinterModal, setShowPrinterModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(localStorage.getItem('printer_address') || '');
  const [selectedPrinterName, setSelectedPrinterName] = useState(localStorage.getItem('printer_name') || '');
  const [isPrinting, setIsPrinting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const handleSaveAsFile = async (tarea, cliente) => {
      try {
          const fecha = new Date().toLocaleString('es-DO', { dateStyle: 'medium', timeStyle: 'short' });
          const content = [
              '================================',
              '       RED ENNIER TASK          ',
              '================================',
              `TICKET  : ${tarea.ticket_id || ('TSK-' + tarea.id)}`,
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
              '\n\n',
          ].join('\n');

          const fileName = `Recibo_${tarea.ticket_id || tarea.id}.txt`;

          if (Capacitor.isNativePlatform()) {
              const savedFile = await Filesystem.writeFile({
                  path: fileName,
                  data: content,
                  directory: Directory.Documents,
                  encoding: 'utf8',
                  recursive: true
              });
              await Share.share({
                  title: 'Recibo Digital Red Ennier',
                  text: 'Comprobante de servicio técnico.',
                  url: savedFile.uri,
                  dialogTitle: 'Guardar Recibo en el Teléfono',
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
          setShowPreview(false);
      } catch (error) {
          console.error('Error al guardar:', error);
          alert('Error al guardar archivo: ' + error.message);
      }
  };

  // Unified Printer Logic


  const selectPrinter = (addr, name) => {
      setSelectedAddress(addr);
      setSelectedPrinterName(name);
      localStorage.setItem('printer_address', addr);
      localStorage.setItem('printer_name', name || 'Impresora');
      setShowPrinterModal(false);
  };

  const executePrint = async (tarea, cliente, address) => {
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
              '      redennierdev.com          ',
              '================================',
              '\n\n\n',
          ].join('\n');

          const sent = await BluetoothPrinter.printRaw(receiptText);
          await BluetoothPrinter.disconnect();
          if (sent) {
              alert("✅ Ticket impreso correctamente.");
          } else {
              alert("⚠️ Conexión establecida pero hubo un error al enviar. Intenta de nuevo.");
          }
      } else {
          alert("❌ No se pudo conectar con la impresora:\n• Verifica que esté encendida.\n• Activa el Bluetooth.\n• Acepta los permisos de Dispositivos Cercanos.");
          setShowPrinterModal(true);
          setPrintingTask(tarea);
          setPrintingClient(cliente);
      }
      setIsPrinting(false);
  };

  const handlePrint = async (tarea, cliente) => {
      setPrintingTask(tarea);
      setPrintingClient(cliente);
      setShowPreview(true);
  };

  const handleSelectAndPrint = async (addr, name) => {
      selectPrinter(addr, name);
      setShowPrinterModal(false);
      if (printingTask) {
          await executePrint(printingTask, printingClient, addr);
          setPrintingTask(null);
          setPrintingClient(null);
      }
  };

   const stats = [
    { label: 'Universo Clientes', value: (clientes || []).length, icon: <Users size={24} />, color: 'bg-white/5 text-blue-400', path: '/users' },
    { label: 'Fuerza Técnica', value: (tecnicos || []).length, icon: <Wrench size={24} />, color: 'bg-white/5 text-violet-400', path: '/technicians' },
    { label: 'Operaciones Cola', value: (tareas || []).filter(t => t.estado === 'Pendiente').length, icon: <FileText size={24} />, color: 'bg-white/5 text-orange-400', path: '/tasks' },
    { label: 'Red de Servicios', value: (servicios || []).length, icon: <LayoutList size={24} />, color: 'bg-white/5 text-fuchsia-400', path: '/services' },
  ];

  return (
    <div className="space-y-6 page-transition">
      {userRole === 'Admin' ? (
        <AdminView stats={stats} tareas={tareas} clientes={clientes} onPrint={handlePrint} onViewDetail={(t) => { setSelectedTask(t); setDetailModalOpen(true); }} onNavigate={(p) => navigate(p)} />
      ) : (
        <TechnicianView tareas={tareas} clientes={clientes} updateRecord={updateRecord} refreshAll={refreshAll} onPrint={handlePrint} onViewDetail={(t) => { setSelectedTask(t); setDetailModalOpen(true); }} onDelete={(id) => deleteRecord('tasks', id).then(refreshAll)} onEdit={(t) => { setSelectedTask(t); setDetailModalOpen(true); }} />
      )}
      
      {/* Preview Modal Integral */}
      <ComprehensiveDetailModal 
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        data={selectedTask}
        type="task"
        clientes={clientes}
        onPrint={(t) => {
            setDetailModalOpen(false);
            handlePrint(t, clientes.find(c => c.id === t.cliente_id));
        }}
        onSave={(t) => {
            setDetailModalOpen(false);
            handleSaveAsFile(t, clientes.find(c => c.id === t.cliente_id));
        }}
      />




      {/* Nuevo Modal Premium Unificado */}
      <PrinterModal 
        isOpen={showPrinterModal}
        onClose={() => setShowPrinterModal(false)}
        onSelect={handleSelectAndPrint}
        selectedAddress={selectedAddress}
      />

      {/* Overlay de impresión */}
      {isPrinting && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/90 backdrop-blur-sm">
              <div className="text-center text-white space-y-4">
                  <Printer size={64} className="mx-auto text-orange-400 animate-bounce" />
                  <p className="font-black uppercase text-xl italic tracking-tighter">Enviando a impresora...</p>
                  <p className="text-slate-400 text-sm">No cierres la aplicación</p>
              </div>
          </div>
      )}

      {/* Modal de Impresión / Guardar (Centralizado) */}
      <PrinterActionModal 
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        task={printingTask}
        client={printingClient}
        onPrint={(t, c) => {
            if (!selectedAddress) {
                setShowPrinterModal(true);
                setShowPreview(false);
            } else {
                executePrint(t, c, selectedAddress);
                setShowPreview(false);
            }
        }}
        onSave={(t, c) => {
            handleSaveAsFile(t, c);
            setShowPreview(false);
        }}
      />

      {/* Visor Recibo Visual HTML Backup */}
      <ReciboTicket data={printingTask || tareas[0]} cliente={printingClient || clientes[0]} />
    </div>
  );
};

export default Dashboard;