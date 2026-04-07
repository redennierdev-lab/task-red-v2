import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { db, logAction, exportData } from '../db/db';
import { Users, Wrench, FileText, Rocket, TrendingUp, CheckCircle2, Play, Pause, Navigation, MessageCircle, XCircle, Database, Download, LayoutDashboard, History } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminView = ({ stats, tareas, clientes }) => {
  const { theme } = useContext(AppContext);
  const [dbStatus, setDbStatus] = useState({ state: 'checking', ping: 0 });
  const [isExporting, setIsExporting] = useState(false);

  const isDark = theme === 'dark';

  const handleBackup = async () => {
    try {
        setIsExporting(true);
        const data = await exportData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `RedEnnier_Backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        await logAction('Admin', 'RESPALDO', 'System', 0, 'Se generó un respaldo maestro de la base de datos');
        alert('Respaldo generado y descargado con éxito.');
    } catch (error) {
        console.error('Error en respaldo:', error);
        alert('Error al generar el respaldo.');
    } finally {
        setIsExporting(false);
    }
  };

  useEffect(() => {
    // Check IndexedDB readiness instead of remote server
    const checkLocalDB = async () => {
        try {
            const start = Date.now();
            await db.on('ready'); // Dexie ready check
            setDbStatus({ state: 'online', ping: Date.now() - start });
        } catch (e) {
            setDbStatus({ state: 'error', ping: 0 });
        }
    };
    checkLocalDB();
  }, []);

  // Metricas
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

  // Ingreso Hipotético: $35 por Tarea Completada
  const ingresosData = (tareas || []).slice(-7).map((t, idx) => ({
      name: `T-${t.id}`,
      ingreso: t.estado === 'Completada' ? 35 : (t.estado === 'En proceso' ? 15 : 0)
  }));
  
  const totalIngreso = completadas * 35;

  return (
    <div className="space-y-8 page-transition pb-20">
      {/* Welcome Header & DB Monitor Refined */}
      <div className="view-header">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center w-full gap-8">
            <div className="flex items-center gap-6">
                <div className="brand-icon">
                    <LayoutDashboard size={32} />
                </div>
                <div>
                   <h2 className="view-title">Centro de Mando</h2>
                   <p className="view-subtitle">Monitoreo absoluto RED ENNIER V3</p>
                </div>
            </div>
          
            <div className="flex flex-wrap gap-4 justify-center md:justify-end items-center">
                <button 
                  onClick={handleBackup}
                  disabled={isExporting}
                  className="btn-gradient relative overflow-hidden group px-10 shadow-2xl shadow-orange-500/20"
                >
                  <Download size={18} className={isExporting ? 'animate-bounce' : ''} />
                  <span className="relative z-10">{isExporting ? 'Generando...' : 'Respaldo Maestro JSON'}</span>
                </button>

                <div className="flex items-center gap-4 bg-orange-50 dark:bg-slate-800 px-6 py-4 rounded-[2rem] border-2 border-orange-100 dark:border-slate-700 shadow-inner">
                    <div className="relative flex h-4 w-4">
                      {(dbStatus.state === 'online') && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                      <span className={`relative inline-flex rounded-full h-4 w-4 ${dbStatus.state === 'online' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest italic">Vault Local DB</span>
                        <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase italic">
                            Autónomo <span className="text-orange-500 opacity-60 ml-1">{dbStatus.ping}ms</span>
                        </span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between px-4">
        <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.3em] flex items-center gap-2">
            <Database size={14} className="text-orange-500"/> Modo 100% Desconectado Activo para Seguridad de Datos
        </span>
      </div>

      {/* Stats Grid VIP Refined */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="premium-card p-8 flex flex-col justify-between group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 dark:bg-fuchsia-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
            <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-slate-800 flex items-center justify-center mb-6 transition-all duration-500 group-hover:rotate-12 text-orange-500 dark:text-fuchsia-400 group-hover:bg-logo-gradient group-hover:text-white relative z-10">
              {React.cloneElement(stat.icon, { size: 24 })}
            </div>
            <div className="relative z-10">
              <div className="flex items-end justify-between mb-2">
                <span className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-fuchsia-400 transition-colors italic">{stat.value}</span>
              </div>
              <p className="text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-[0.2em] text-[10px] italic">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ANALYTICS Refined */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="premium-card p-10 relative overflow-hidden group">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-8 flex items-center gap-2 italic">
                 <LayoutDashboard size={18} className="text-fuchsia-500"/> Distribución de Tareas
              </h3>
              <div className="h-[220px] w-full relative">
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

          <div className="col-span-1 lg:col-span-2 premium-card p-10 flex flex-col justify-between border-2 border-emerald-50 dark:border-emerald-500/10">
              <div className="flex justify-between items-start mb-8">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-2 italic">
                    <TrendingUp size={18} className="text-emerald-500"/> Ingresos Operativos
                </h3>
                <div className="text-right">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Total Estimado</span>
                    <h4 className="text-3xl font-black text-emerald-600 dark:text-emerald-400 italic">${totalIngreso}<span className="text-base text-emerald-300">.00</span></h4>
                </div>
              </div>
              
              <div className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ingresosData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
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

const TechnicianView = ({ tareas, clientes, updateRecord }) => {
  const activas = (tareas || []).filter(t => t.estado !== 'Completada' && t.estado !== 'No completada');

  const updateEstado = async (id, nuevoEstado) => {
      try {
          const payload = { estado: nuevoEstado };
          if (nuevoEstado === 'En proceso') {
              payload.started_at = Date.now();
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
                <Rocket size={32} />
            </div>
            <div>
                <h2 className="view-title">Tablero de Ejecución</h2>
                <p className="view-subtitle">Control Operativo de Campo</p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {activas.map(t => {
              const cliente = clientes.find(c => c.id === Number(t.cliente_id));
              const enProceso = t.estado === 'En proceso';
              const pausada = t.estado === 'Pausada';
              
              const phone = cliente?.whatsapp || cliente?.telefono || '';
              const coords = cliente?.coordenadas || '';

              return (
                  <div key={t.id} className={`premium-card p-6 flex flex-col relative overflow-hidden group border-2 transition-all duration-300
                      ${enProceso ? 'border-emerald-400 dark:border-emerald-500/50 ring-4 ring-emerald-50 dark:ring-emerald-500/10' : pausada ? 'border-amber-400 dark:border-amber-500/50 ring-4 ring-amber-50 dark:ring-amber-500/10' : 'border-slate-50 dark:border-slate-800'}`}>
                      
                      {enProceso && <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500 animate-pulse"></div>}

                      <div className="flex justify-between items-start mb-5">
                          <div className="flex flex-col gap-3">
                              <div className="flex items-center gap-2">
                                  <span className="text-[9px] bg-slate-900 dark:bg-slate-800 text-white font-black px-2.5 py-1 rounded shadow-lg tracking-widest uppercase italic">
                                      {t.ticket_id || `TSK-${t.id}`}
                                  </span>
                                  {enProceso && <span className="bg-emerald-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full animate-bounce">ACTIVO</span>}
                              </div>
                              <h3 className="text-xl font-black tracking-tighter leading-tight text-slate-900 dark:text-white italic uppercase">{t.titulo}</h3>
                          </div>
                      </div>
                      
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 mb-6 group-hover:bg-white dark:group-hover:bg-slate-800 group-hover:border-orange-100 dark:group-hover:border-fuchsia-500/30 transition-colors">
                        <p className="text-slate-500 dark:text-slate-400 text-[11px] font-bold leading-relaxed italic line-clamp-3">"{t.descripcion}"</p>
                      </div>

                      <div className="mt-auto space-y-3">
                          {/* Botonera Inicial */}
                          {(!enProceso) && (
                              <button onClick={() => updateEstado(t.id, 'En proceso')} className="w-full btn-gradient py-5 text-[10px]">
                                  <Play size={18}/> INICIAR MISIÓN
                              </button>
                          )}

                          {/* Botonera Activa */}
                          {enProceso && (
                              <div className="grid grid-cols-2 gap-3">
                                  <a href={`https://wa.me/${phone.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center py-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all font-black text-[9px] uppercase tracking-widest border border-slate-100 dark:border-slate-700 border-dashed">
                                     <MessageCircle size={20} className="mb-2"/> WhatsApp
                                  </a>
                                  <a href={`https://www.google.com/maps?q=${coords}`} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center py-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 transition-all font-black text-[9px] uppercase tracking-widest border border-slate-100 dark:border-slate-700 border-dashed">
                                     <Navigation size={20} className="mb-2"/> GPS Ruta
                                  </a>
                                  
                                  <button onClick={() => updateEstado(t.id, 'Pausada')} className="col-span-2 flex items-center justify-center gap-3 py-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-all font-black text-[10px] uppercase tracking-widest border border-amber-100 dark:border-amber-500/20">
                                     <Pause size={18}/> Congelar Misión
                                  </button>

                                  <button onClick={() => updateEstado(t.id, 'Completada')} className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all font-black text-[10px] uppercase tracking-widest italic">
                                     <CheckCircle2 size={16}/> Misión Útil
                                  </button>

                                  <button onClick={() => updateEstado(t.id, 'No completada')} className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all font-black text-[10px] uppercase tracking-widest border border-red-100 dark:border-red-500/20">
                                     <XCircle size={16}/> Abortar
                                  </button>
                              </div>
                          )}
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
               <p className="text-[10px] text-slate-300 dark:text-slate-600 font-black uppercase tracking-widest">A la espera de nuevas órdenes operativas</p>
             </div>
          )}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { clientes, tecnicos, tareas, servicios, userRole, refreshAll } = useContext(AppContext);

  const stats = [
    { label: 'Universo Clientes', value: clientes.length, icon: <Users size={24} />, color: 'bg-white/5 text-blue-400' },
    { label: 'Fuerza Técnica', value: tecnicos.length, icon: <Wrench size={24} />, color: 'bg-white/5 text-violet-400' },
    { label: 'Operaciones Cola', value: tareas.filter(t => t.estado === 'Pendiente').length, icon: <FileText size={24} />, color: 'bg-white/5 text-orange-400' },
    { label: 'Red de Servicios', value: servicios.length, icon: <Rocket size={24} />, color: 'bg-white/5 text-fuchsia-400' },
  ];

  return (
    <div className="space-y-6 page-transition">
      {userRole === 'Admin' ? (
        <AdminView stats={stats} tareas={tareas} clientes={clientes} />
      ) : (
        <TechnicianView tareas={tareas} clientes={clientes} refreshAll={refreshAll} />
      )}
    </div>
  );
};

export default Dashboard;