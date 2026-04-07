import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Users, Wrench, FileText, Rocket, TrendingUp, CheckCircle2 } from 'lucide-react';

const Dashboard = () => {
  const { clientes, tecnicos, tareas, servicios } = useContext(AppContext);

  const stats = [
    { label: 'Clientes', value: clientes.length, icon: <Users size={24} />, color: 'bg-blue-50 text-blue-600', trend: '+12%' },
    { label: 'Staff Técnico', value: tecnicos.length, icon: <Wrench size={24} />, color: 'bg-violet-50 text-violet-600', trend: 'Activo' },
    { label: 'Tickets Activos', value: tareas.filter(t => t.estado === 'Pendiente').length, icon: <FileText size={24} />, color: 'bg-orange-50 text-orange-600', trend: 'En cola' },
    { label: 'Servicios', value: servicios.length, icon: <Rocket size={24} />, color: 'bg-accent/10 text-accent', trend: 'Catálogo' },
  ];

  return (
    <div className="space-y-6 page-transition">
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
          <div key={idx} className="premium-card p-6 flex flex-col justify-between group">
            <div className={`w-11 h-11 rounded-2xl ${stat.color} flex items-center justify-center mb-4 transition-all duration-500 group-hover:rotate-12 inset-0 shadow-sm border border-black/5`}>
              {stat.icon && React.cloneElement(stat.icon, { size: 18 })}
            </div>
            <div>
              <div className="flex items-end justify-between mb-1">
                <span className="text-3xl font-black tracking-tighter text-slate-900">{stat.value}</span>
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 mb-1.5">{stat.trend}</span>
              </div>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Mini-Widget */}
      <div className="premium-card p-8">
         <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black uppercase tracking-widest text-slate-800 italic">Actividad Reciente</h3>
            <div className="h-1 w-16 bg-logo-gradient rounded-full"></div>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tareas.slice(0, 4).map((tarea, i) => (
               <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-200 transition-all cursor-pointer group">
                  <div className={`w-2 h-10 rounded-full ${tarea.estado === 'Pendiente' ? 'bg-orange-500' : 'bg-emerald-500'}`} />
                  <div>
                    <h4 className="font-black text-xs text-slate-700 uppercase tracking-tight group-hover:text-secondary transition-colors">{tarea.titulo}</h4>
                    <p className="text-[9px] text-slate-400 font-bold mt-0.5">Ticket #{tarea.id} • {tarea.estado}</p>
                  </div>
               </div>
            ))}
            {tareas.length === 0 && <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[9px] py-6 text-center col-span-2">Sin actividad reciente</p>}
         </div>
      </div>
    </div>
  );
};

export default Dashboard;