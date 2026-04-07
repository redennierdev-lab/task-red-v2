import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Users, Wrench, FileText, Rocket, TrendingUp, CheckCircle2, Play, Pause, Navigation, MessageCircle, XCircle } from 'lucide-react';
import axios from 'axios';

const AdminView = ({ stats, tareas }) => (
  <>
    {/* Welcome Header */}
    <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-6 lg:p-10 text-white shadow-xl">
      <div className="absolute top-0 right-0 w-64 h-64 bg-logo-gradient opacity-20 blur-[80px] rounded-full -mr-15 -mt-15 animate-pulse"></div>
      <div className="relative z-10 max-w-xl">
        <h1 className="text-3xl lg:text-5xl font-black tracking-tight mb-3">¡Hola, Ennier!</h1>
        <p className="text-slate-400 text-base font-medium leading-relaxed">Bienvenido al centro de mando táctico de <span className="text-white font-bold">RED ENNIER TASK-RED</span>.</p>
        
        <div className="mt-6 flex flex-wrap gap-3">
          <div className="bg-white/5 backdrop-blur-md px-4 py-2 rounded-xl flex items-center gap-2 border border-white/10">
            <TrendingUp size={14} className="text-secondary" />
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Rendimiento Óptimo</span>
          </div>
          <div className="bg-white/5 backdrop-blur-md px-4 py-2 rounded-xl flex items-center gap-2 border border-white/10">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Servidores Online</span>
          </div>
        </div>
      </div>
    </div>

    {/* Stats Grid */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <div key={idx} className="premium-card p-4 flex flex-col justify-between group">
          <div className={`w-9 h-9 rounded-xl ${stat.color} flex items-center justify-center mb-3 transition-all duration-500 group-hover:rotate-12 inset-0 shadow-sm border border-black/5`}>
            {stat.icon && React.cloneElement(stat.icon, { size: 16 })}
          </div>
          <div>
            <div className="flex items-end justify-between mb-0.5">
              <span className="text-2xl font-black tracking-tighter text-slate-900">{stat.value}</span>
              <span className="text-[7px] font-black uppercase tracking-widest text-emerald-500 mb-1">{stat.trend}</span>
            </div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[8px]">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>

    {/* Recent Activity Mini-Widget */}
    <div className="premium-card p-5">
       <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-black uppercase tracking-widest text-slate-800 italic">Actividad Reciente</h3>
          <div className="h-1 w-12 bg-logo-gradient rounded-full"></div>
       </div>
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {tareas.slice(0, 6).map((tarea, i) => (
             <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-transparent hover:border-slate-200 transition-all cursor-pointer group">
                <div className={`w-1.5 h-8 rounded-full ${tarea.estado === 'Pendiente' ? 'bg-orange-500' : 'bg-emerald-500'}`} />
                <div>
                  <h4 className="font-black text-[11px] text-slate-700 uppercase tracking-tight group-hover:text-secondary transition-colors line-clamp-1">{tarea.titulo}</h4>
                  <p className="text-[8px] text-slate-400 font-bold mt-0.5 whitespace-nowrap">Ticket #{tarea.ticket_id || tarea.id} • {tarea.estado}</p>
                </div>
             </div>
          ))}
          {tareas.length === 0 && <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[9px] py-6 text-center col-span-2">Sin actividad reciente</p>}
       </div>
    </div>
  </>
);

const TechnicianView = ({ tareas, clientes, refreshAll }) => {
  const activas = tareas.filter(t => t.estado !== 'Completada' && t.estado !== 'No completada');

  const updateEstado = async (id, nuevoEstado) => {
      try {
          const payload = { estado: nuevoEstado };
          if (nuevoEstado === 'En proceso') {
              payload.started_at = Date.now();
          }
          await axios.put(`http://10.51.182.11:5000/api/tasks/${id}/state`, payload);
          refreshAll();
      } catch (error) {
          console.error("Error actualizando estado:", error);
      }
  };

  return (
    <>
      <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden mb-6 shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500 opacity-20 blur-[80px] rounded-full -mr-20 -mt-20"></div>
        <div className="relative z-10 flex items-center justify-between">
            <div>
                <h2 className="text-2xl font-black tracking-tight mb-1">Tablero de Ejecución</h2>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Técnico de Campo</p>
            </div>
            <div className="bg-white/10 p-3 rounded-2xl border border-white/20">
                <Wrench className="text-fuchsia-400"/>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {activas.map(t => {
              const cliente = clientes.find(c => c.id === Number(t.cliente_id));
              const enProceso = t.estado === 'En proceso';
              const pausada = t.estado === 'Pausada';
              
              const phone = cliente?.whatsapp || cliente?.telefono || '';
              const coords = cliente?.coordenadas || '';

              return (
                  <div key={t.id} className={`p-4 rounded-[1.5rem] border-2 shadow-sm transition-all duration-300 flex flex-col relative overflow-hidden bg-white
                      ${enProceso ? 'border-emerald-400 shadow-emerald-500/10' : pausada ? 'border-amber-300' : 'border-slate-100 hover:border-slate-300'}`}>
                      
                      {enProceso && <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 animate-pulse"></div>}

                      <div className="flex justify-between items-start mb-3">
                          <div>
                              <span className="text-[7px] bg-slate-900 text-white font-black px-1.5 py-0.5 rounded shadow-sm">
                                  {t.ticket_id || `TSK-${t.id}`}
                              </span>
                              <h3 className="text-base font-black text-slate-800 tracking-tight leading-tight mt-1 italic">{t.titulo}</h3>
                          </div>
                      </div>
                      
                      <p className="text-slate-500 text-[10px] font-medium line-clamp-2 mb-4 bg-slate-50 p-2 rounded-lg border border-slate-100 italic">{t.descripcion}</p>

                      <div className="mt-auto space-y-3">
                          {/* Botonera Inicial */}
                          {(!enProceso) && (
                              <button onClick={() => updateEstado(t.id, 'En proceso')} className="w-full btn-gradient py-3 text-xs flex justify-center items-center gap-2 bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30">
                                  <Play size={16}/> INICIAR TAREA
                              </button>
                          )}

                          {/* Botonera Activa */}
                          {enProceso && (
                              <div className="grid grid-cols-2 gap-2">
                                  <a href={`https://wa.me/${phone.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 transition-colors font-black text-[9px] uppercase tracking-wider">
                                     <MessageCircle size={20} className="mb-1"/> Contactar
                                  </a>
                                  <a href={`https://www.google.com/maps?q=${coords}`} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center p-3 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-colors font-black text-[9px] uppercase tracking-wider">
                                     <Navigation size={20} className="mb-1"/> GPS
                                  </a>
                                  
                                  <button onClick={() => updateEstado(t.id, 'Pausada')} className="col-span-2 flex items-center justify-center gap-2 p-3 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100 transition-colors font-black text-[10px] uppercase tracking-wider">
                                     <Pause size={16}/> Pausar Tarea
                                  </button>

                                  <button onClick={() => updateEstado(t.id, 'Completada')} className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors font-black text-[10px] uppercase tracking-wider">
                                     <CheckCircle2 size={16}/> Hecho
                                  </button>

                                  <button onClick={() => updateEstado(t.id, 'No completada')} className="flex items-center justify-center gap-2 p-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors font-black text-[10px] uppercase tracking-wider">
                                     <XCircle size={16}/> Fallido
                                  </button>
                              </div>
                          )}
                      </div>
                  </div>
              );
          })}
          
          {activas.length === 0 && (
             <div className="col-span-1 md:col-span-2 text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
               <FileText size={48} className="mx-auto text-slate-200 mb-4"/>
               <h3 className="text-lg font-black text-slate-400 uppercase tracking-[0.2em] mb-2">No hay tareas pendientes</h3>
               <p className="text-xs text-slate-300 font-bold uppercase tracking-widest">Estás libre por ahora</p>
             </div>
          )}
      </div>
    </>
  );
};

const Dashboard = () => {
  const { clientes, tecnicos, tareas, servicios, userRole, refreshAll } = useContext(AppContext);

  const stats = [
    { label: 'Clientes', value: clientes.length, icon: <Users size={24} />, color: 'bg-blue-50 text-blue-600', trend: '+12%' },
    { label: 'Staff Técnico', value: tecnicos.length, icon: <Wrench size={24} />, color: 'bg-violet-50 text-violet-600', trend: 'Activo' },
    { label: 'Tickets Activos', value: tareas.filter(t => t.estado === 'Pendiente').length, icon: <FileText size={24} />, color: 'bg-orange-50 text-orange-600', trend: 'En cola' },
    { label: 'Servicios', value: servicios.length, icon: <Rocket size={24} />, color: 'bg-accent/10 text-accent', trend: 'Catálogo' },
  ];

  return (
    <div className="space-y-6 page-transition">
      {userRole === 'Admin' ? (
        <AdminView stats={stats} tareas={tareas} />
      ) : (
        <TechnicianView tareas={tareas} clientes={clientes} refreshAll={refreshAll} />
      )}
    </div>
  );
};

export default Dashboard;