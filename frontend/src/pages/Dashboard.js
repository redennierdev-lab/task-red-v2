import React, { useContext, useEffect, useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { AppContext } from '../context/AppContext';
import { db, logAction, exportData } from '../db/db';
import { Users, Wrench, FileText, TrendingUp, CheckCircle2, Play, Pause, Navigation, MessageCircle, XCircle, Database, Download, LayoutDashboard, Printer, Bluetooth, LayoutList, ClipboardCheck } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ReciboTicket from '../components/ReciboTicket';
import PrinterModal from '../components/PrinterModal';
import BluetoothPrinter from '../utils/BluetoothPrinter';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

const AdminView = ({ stats, tareas, clientes, onPrint }) => {
  const { theme, rates } = useContext(AppContext);
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
    { name: 'Completadas', value: completadas, color: '#10b981' },
    { name: 'En Proceso', value: enProceso, color: '#f59e0b' },
    { name: 'Pendientes', value: pendientes, color: '#64748b' },
    { name: 'Fallidas', value: fallidas, color: '#ef4444' }
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
                  className="btn-gradient px-6 py-2.5 shadow-xl shadow-orange-500/10"
                >
                  <Download size={14} className={isExporting ? 'animate-bounce' : ''} />
                  <span className="relative z-10 text-[9px]">{isExporting ? 'Generando...' : 'Respaldo Maestro'}</span>
                </button>

                <div className="flex items-center gap-3 bg-orange-50 dark:bg-slate-800 px-4 py-2.5 rounded-2xl border border-orange-100 dark:border-slate-700">
                    <div className="relative flex h-3 w-3">
                      {(dbStatus.state === 'online') && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                      <span className={`relative inline-flex rounded-full h-3 w-3 ${dbStatus.state === 'online' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase italic leading-none">
                            Vault <span className="text-orange-500 opacity-60 ml-0.5">{dbStatus.ping}ms</span>
                        </span>
                    </div>
                </div>
            </div>
        </div>
      </div>
      {/* Text Carousel - Compact & Professional */}
      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-2 px-6 py-2 bg-slate-100/50 dark:bg-slate-800/20 rounded-2xl border border-slate-200/50 dark:border-slate-700/30 overflow-hidden w-full">
          <div className="flex-1 w-full min-w-0">
              <marquee className="text-[10px] sm:text-[11px] font-black uppercase text-orange-600 dark:text-orange-400 tracking-[0.2em] italic flex items-center pt-0.5">
                  DIOS PRIMERO CARLOS.! SALMOS 16:8
              </marquee>
          </div>
          <div className="hidden sm:flex items-center gap-2 border-l border-slate-200 dark:border-slate-700 pl-8 shrink-0">
              <Database size={12} className="text-orange-500/50" />
              <span className="text-[8px] font-bold uppercase text-slate-400 tracking-[0.2em] italic">MODO AUTÓNOMO</span>
          </div>
      </div>

      {/* Stats Grid VIP Refined */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="premium-card p-0 flex flex-col group overflow-hidden relative transform hover:-translate-y-1 transition-all duration-300">
            <div className="h-1 bg-logo-gradient w-full opacity-80 group-hover:h-1.5 transition-all duration-500"></div>
            <div className="p-5 flex flex-col justify-between h-full relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-orange-50 dark:bg-fuchsia-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
            <div className="w-10 h-10 rounded-2xl bg-orange-50 dark:bg-slate-800 flex items-center justify-center mb-3 transition-all duration-500 group-hover:rotate-12 text-orange-500 dark:text-fuchsia-400 group-hover:bg-logo-gradient group-hover:text-white relative z-10">
              {React.cloneElement(stat.icon, { size: 18 })}
            </div>
            <div className="relative z-10">
              <div className="flex items-end justify-between mb-0.5">
                <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-fuchsia-400 transition-colors italic">{stat.value}</span>
              </div>
              <p className="text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-[0.2em] text-[8px] italic">{stat.label}</p>
            </div>
            </div>
            {stat.label === 'Operaciones Cola' && (
                <button 
                  onClick={() => {
                    const firstPending = tareas.find(t => t.estado === 'Pendiente');
                    if (firstPending) {
                        const cliente = clientes.find(c => c.id === Number(firstPending.cliente_id));
                        onPrint(firstPending, cliente);
                    } else {
                        alert('No hay tareas pendientes para imprimir recibo.');
                    }
                  }} 
                  className="absolute bottom-4 right-4 p-2 bg-orange-100 text-orange-600 rounded-full hover:bg-orange-200 transition-all z-20 shadow-sm active:scale-95"
                >
                    <Printer size={16}/>
                </button>
            )}
          </div>
        ))}
      </div>

      {/* ANALYTICS Refined */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="premium-card p-6 relative overflow-hidden group">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-6 flex items-center gap-2 italic">
                 <LayoutDashboard size={18} className="text-fuchsia-500"/> Distribución de Tareas
              </h3>
              <div className="h-[180px] min-h-[180px] w-full relative">
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
                              contentStyle={{ backgroundColor: isDark ? '#0f172a' : '#fff', borderColor: isDark ? '#334155' : '#f1f5f9', borderRadius: '1.2rem', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', fontSize: '11px', color: isDark ? '#fff' : '#1e293b', fontWeight: 900, textTransform: 'uppercase' }} 
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

          <div className="col-span-1 lg:col-span-2 premium-card p-6 flex flex-col justify-between border-2 border-emerald-50 dark:border-emerald-500/10 transition-all duration-500 hover:border-emerald-400 shadow-emerald-500/5">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-2 italic">
                    <TrendingUp size={18} className="text-emerald-500"/> Flujo de Caja (Real)
                </h3>
                <div className="text-right">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Capital Total Auditado</span>
                    <h4 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 italic">${totalIngreso.toLocaleString()}<span className="text-sm text-emerald-300">.00</span></h4>
                </div>
              </div>
              
              <div className="h-[180px] min-h-[180px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ingresosTimeline} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#f1f5f9'} />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: isDark ? '#475569' : '#cbd5e1', fontWeight: 900 }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: isDark ? '#475569' : '#cbd5e1', fontWeight: 900 }} />
                          <Tooltip 
                              cursor={{fill: isDark ? '#1e293b' : '#f8fafc', opacity: 0.5}} 
                              contentStyle={{ backgroundColor: isDark ? '#0f172a' : '#fff', border: 'none', borderRadius: '1.2rem', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', color: isDark ? '#fff' : '#1e293b', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase' }} 
                          />
                          <Bar dataKey="ingreso" fill="#10b981" radius={[8, 8, 0, 0]} maxBarSize={40} />
                      </BarChart>
                  </ResponsiveContainer>
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
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg border border-emerald-500/20 font-mono text-[10px] font-black tracking-tighter shadow-inner">
            <TrendingUp size={12} className="animate-pulse" />
            {elapsed}
        </div>
    );
};

const TechnicianView = ({ tareas, clientes, updateRecord, refreshAll, onPrint }) => {
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

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {activas.map(t => {
              const cliente = clientes.find(c => c.id === Number(t.cliente_id));
              const enProceso = t.estado === 'En proceso';
              const pausada = t.estado === 'Pausada';
              
              const phone = cliente?.whatsapp || cliente?.telefono || '';
              const coords = cliente?.coordenadas || '';

              return (
                  <div key={t.id} className={`premium-card p-0 flex flex-col relative overflow-hidden group border-2 transition-all duration-300 transform hover:-translate-y-1 rounded-[2rem]
                      ${enProceso ? 'border-emerald-400 dark:border-emerald-500/50 ring-2 ring-emerald-50 dark:ring-emerald-500/10' : pausada ? 'border-amber-400 dark:border-amber-500/50 ring-2 ring-amber-50 dark:ring-amber-500/10' : 'border-slate-50 dark:border-slate-800'}`}>
                      
                      <div className="h-1 bg-logo-gradient w-full opacity-80 group-hover:h-1.5 transition-all duration-500"></div>
                      {enProceso && <div className="absolute top-1 left-0 w-full h-1 bg-emerald-500 animate-pulse"></div>}

                      <div className="p-3 bg-white dark:bg-slate-900 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                          <div className="flex flex-col gap-1.5 w-full">
                              <div className="flex items-center justify-between w-full">
                                  <span className="text-[7px] bg-slate-900 dark:bg-slate-800 text-white font-black px-1.5 py-0.5 rounded shadow-sm tracking-widest uppercase italic">
                                      {t.ticket_id || `TSK-${t.id}`}
                                  </span>
                                  {enProceso && <TaskTimer started_at={t.started_at} />}
                              </div>
                              <h3 className="text-sm font-black tracking-tighter leading-tight text-slate-900 dark:text-white italic uppercase truncate">{t.titulo}</h3>
                          </div>
                      </div>
                      
                      <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 mb-3 group-hover:bg-white dark:group-hover:bg-slate-800 group-hover:border-orange-100 dark:group-hover:border-fuchsia-500/30 transition-colors">
                        <p className="text-slate-500 dark:text-slate-400 text-[9px] font-bold leading-tight italic line-clamp-1 mb-1.5">"{t.descripcion}"</p>
                        <div className="flex items-center gap-1.5 text-[7px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-t border-slate-200 dark:border-slate-700 pt-1.5 italic truncate">
                            <Navigation size={8} className="text-orange-500 shrink-0"/>
                            {cliente?.direccion || 'S/D (Ver GPS)'}
                        </div>
                      </div>

                      <div className="mt-auto">
                          {/* Botonera Inicial */}
                          {(!enProceso) && (
                              <button onClick={() => updateEstado(t.id, 'En proceso')} className="w-full btn-gradient py-3 text-[8px]">
                                  <Play size={14}/> INICIAR MISIÓN
                              </button>
                          )}

                          {/* Botonera Activa - Grilla de 6 Botones Compacta */}
                          {enProceso && (
                              <div className="grid grid-cols-3 gap-2">
                                  <a href={`https://wa.me/${phone.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 hover:text-emerald-500 transition-all border border-slate-100 dark:border-slate-700">
                                     <MessageCircle size={16}/><span className="text-[6px] font-black uppercase mt-1">Chat</span>
                                  </a>
                                  <a href={coords ? `https://www.google.com/maps?q=${coords}` : '#'} target={coords ? "_blank" : "_self"} onClick={() => !coords && alert('No hay coordenadas cargadas para este cliente.')} rel="noreferrer" className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 hover:text-blue-500 transition-all border border-slate-100 dark:border-slate-700">
                                     <Navigation size={16}/><span className="text-[6px] font-black uppercase mt-1">Ruta</span>
                                  </a>
                                  <button onClick={() => onPrint(t, cliente)} className="flex flex-col items-center justify-center p-2 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-100 transition-all border border-orange-100 dark:border-orange-500/20">
                                     <Printer size={16}/><span className="text-[6px] font-black uppercase mt-1">Ticket</span>
                                  </button>
                                  <button onClick={() => updateEstado(t.id, 'Pausada')} className="flex flex-col items-center justify-center p-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-100 transition-all border border-amber-100 dark:border-amber-500/20">
                                     <Pause size={16}/><span className="text-[6px] font-black uppercase mt-1">Pausa</span>
                                  </button>
                                  <button onClick={() => updateEstado(t.id, 'Completada')} className="flex flex-col items-center justify-center p-2 rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all">
                                     <CheckCircle2 size={16}/><span className="text-[6px] font-black uppercase mt-1">Listo</span>
                                  </button>
                                  <button onClick={() => updateEstado(t.id, 'No completada')} className="flex flex-col items-center justify-center p-2 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 hover:bg-red-100 transition-all border border-red-100 dark:border-red-500/20">
                                     <XCircle size={16}/><span className="text-[6px] font-black uppercase mt-1">Abort</span>
                                  </button>
                              </div>
                          )}
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
                    const cId = await db.customers.add({ nombre: 'Demo Cliente', telefono: '0412-1234567', direccion: 'Av. Principal Local Demo', status: 'Activo' });
                    await db.tasks.add({ 
                        ticket_id: 'DEMO-001',
                        titulo: 'Misión de Prueba DOOM',
                        descripcion: 'Soporte técnico de emergencia para validar flujo de caja y cronómetros.',
                        cliente_id: cId,
                        estado: 'Pendiente',
                        monto: 50
                    });
                    refreshAll();
                }}
                className="btn-gradient px-10 py-4 text-[11px] font-black uppercase tracking-[0.2em] italic"
               >
                 <ClipboardCheck size={18}/> Generar Misión de Prueba
               </button>
             </div>
          )}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { clientes, tecnicos, tareas, servicios, userRole, refreshAll, updateRecord } = useContext(AppContext);
  const [printingTask, setPrintingTask] = useState(null);
  const [printingClient, setPrintingClient] = useState(null);
  const [showPrinterModal, setShowPrinterModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(localStorage.getItem('printer_address') || '');
  const [selectedPrinterName, setSelectedPrinterName] = useState(localStorage.getItem('printer_name') || '');
  const [isPrinting, setIsPrinting] = useState(false);

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
      if (!selectedAddress) {
          setPrintingTask(tarea);
          setPrintingClient(cliente);
          setShowPrinterModal(true);
          return;
      }
      await executePrint(tarea, cliente, selectedAddress);
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
    { label: 'Universo Clientes', value: clientes.length, icon: <Users size={24} />, color: 'bg-white/5 text-blue-400' },
    { label: 'Fuerza Técnica', value: tecnicos.length, icon: <Wrench size={24} />, color: 'bg-white/5 text-violet-400' },
    { label: 'Operaciones Cola', value: tareas.filter(t => t.estado === 'Pendiente').length, icon: <FileText size={24} />, color: 'bg-white/5 text-orange-400' },
    { label: 'Red de Servicios', value: servicios.length, icon: <LayoutList size={24} />, color: 'bg-white/5 text-fuchsia-400' },
  ];

  return (
    <div className="space-y-6 page-transition">
      {userRole === 'Admin' ? (
        <AdminView stats={stats} tareas={tareas} clientes={clientes} onPrint={handlePrint} />
      ) : (
        <TechnicianView tareas={tareas} clientes={clientes} updateRecord={updateRecord} refreshAll={refreshAll} onPrint={handlePrint} />
      )}
      
      {/* Indicador de impresora activa en esquina */}
      {selectedAddress && (
          <button
            onClick={() => { setShowPrinterModal(true); }}
            className="fixed bottom-24 right-4 z-50 flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 transition-all animate-in zoom-in duration-500"
          >
              <Bluetooth size={12} className="animate-pulse" />
              <span>{selectedPrinterName || 'Impresora Local'}</span>
          </button>
      )}

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

      {/* Visor Recibo Visual HTML Backup */}
      <ReciboTicket data={printingTask || tareas[0]} cliente={printingClient || clientes[0]} />
    </div>
  );
};

export default Dashboard;