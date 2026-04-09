import React, { useState, useContext, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Plus, History, Wallet, X, ArrowUpRight, Zap, Briefcase, Edit3 } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import IngresoWizard from '../components/IngresoWizard';
import { AppContext } from '../context/AppContext';

const Ingresos = () => {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const { theme } = useContext(AppContext);
  const isDark = theme === 'dark';

  // Consultar ingresos de la DB local en tiempo real
  const rawIngresos = useLiveQuery(() => db.incomes.reverse().toArray(), []);

  const handleEdit = (id) => {
      setEditingId(id);
      setIsWizardOpen(true);
  };

  // Agrupar por mes para la gráfica
  const chartData = useMemo(() => {
    if (!rawIngresos) return [];
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const summary = {};
    
    rawIngresos.forEach(i => {
        if (!i.fecha) return;
        const monthIndex = new Date(i.fecha).getMonth();
        const monthName = months[monthIndex];
        summary[monthName] = (summary[monthName] || 0) + (parseFloat(i.monto) || 0);
    });

    return months.map(m => ({ mes: m, monto: summary[m] || 0 }));
  }, [rawIngresos]);

  const totalMes = useMemo(() => {
      if (!rawIngresos) return 0;
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      return rawIngresos
        .filter(i => {
            const d = new Date(i.fecha);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        })
        .reduce((sum, i) => sum + (parseFloat(i.monto) || 0), 0);
  }, [rawIngresos]);

  if (!rawIngresos) return <div className="p-20 text-center font-black animate-pulse text-slate-300 dark:text-slate-700 tracking-[0.5em] uppercase">Sincronizando Bóveda de Capital...</div>;

  return (
    <div className="space-y-6 page-transition pb-20">
      <div className="view-header">
        <div className="relative z-10 flex items-center gap-6">
            <div className="brand-icon bg-emerald-500 shadow-emerald-500/20">
                <TrendingUp size={32} />
            </div>
            <div>
              <h2 className="view-title">Gestión de Ingresos</h2>
              <p className="view-subtitle">Captación Activa de Capital RED ENNIER</p>
            </div>
        </div>
        
        <button 
          onClick={() => setIsWizardOpen(true)}
          className="btn-gradient relative z-10 flex items-center gap-3 px-10 shadow-2xl shadow-orange-500/20"
        >
          <Plus size={18} />
          <span>Nuevo Ingreso</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card Resumen Vibrante Emerald */}
        <div className="premium-card p-8 flex items-center justify-between col-span-1 bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-none shadow-2xl relative overflow-hidden group transition-all duration-500 hover:scale-[1.02]">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all"></div>
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/70 mb-2 italic">Capital Captado Mensual</p>
            <h3 className="text-5xl font-black text-white tracking-tighter">${totalMes.toLocaleString()}<span className="text-base text-white/40 ml-1">.00</span></h3>
            <div className="mt-4 flex items-center gap-2 bg-white/20 w-fit px-4 py-1.5 rounded-full backdrop-blur-md border border-white/20">
                <Zap size={12} className="text-yellow-300 fill-yellow-300" />
                <span className="text-[9px] font-black uppercase tracking-widest italic">Flujo Positivo</span>
            </div>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-[2rem] flex items-center justify-center text-white backdrop-blur-xl shadow-inner relative z-10 border border-white/30 transform rotate-3">
            <ArrowUpRight size={28} />
          </div>
        </div>
        
        {/* Card Grafica de Ingresos */}
        <div className="premium-card p-8 col-span-2 border-2 border-emerald-50 dark:border-slate-800">
            <div className="w-full">
                <div className="flex justify-between items-center mb-8">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-2 italic">
                        <TrendingUp size={16} className="text-emerald-500" /> Rendimiento de Cobros Anual
                    </p>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            <span className="text-[9px] font-black uppercase text-slate-400">Ingresos</span>
                        </div>
                    </div>
                </div>
                <div className="h-[180px] min-h-[180px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorIngreso" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#f1f5f9'} />
                            <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: isDark ? '#475569' : '#cbd5e1', fontWeight: 900 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: isDark ? '#475569' : '#cbd5e1', fontWeight: 900 }} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: isDark ? '#0f172a' : '#fff', border: 'none', borderRadius: '1.2rem', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', color: isDark ? '#fff' : '#1e293b', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase' }} 
                                cursor={{ stroke: '#10b981', strokeWidth: 2 }}
                            />
                            <Area type="monotone" dataKey="monto" stroke="#10b981" strokeWidth={5} fillOpacity={1} fill="url(#colorIngreso)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
      </div>

      {/* Listado de Ingresos Recientes */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-2">
            <History size={16} className="text-slate-400 dark:text-slate-600" />
            <h3 className="text-xs font-black text-slate-500 dark:text-slate-600 uppercase tracking-widest italic">Historial de Cobros Reales</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rawIngresos.length === 0 ? (
                <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2.5rem] transition-colors">
                    <Wallet size={40} className="mx-auto text-slate-100 dark:text-slate-800 mb-4" />
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] italic">Bóveda vacía. No se registran ingresos locales</p>
                </div>
            ) : (
                rawIngresos.map(i => (
                    <div key={i.id} className="premium-card p-0 group flex flex-col relative overflow-hidden transform hover:-translate-y-0.5 transition-all duration-300">
                        <div className="h-1 bg-logo-gradient w-full opacity-80 group-hover:h-1.5 transition-all duration-500"></div>
                        
                        <div className="p-3 bg-white dark:bg-slate-900 relative">
                            <div className="flex justify-between items-start mb-2">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${i.tipo_origen === 'Automático' ? 'bg-fuchsia-50 dark:bg-fuchsia-500/10 text-fuchsia-500' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500'}`}>
                                    {i.tipo_origen === 'Automático' ? <Zap size={14} /> : <Briefcase size={14} />}
                                </div>
                                <div className="text-right">
                                    <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded-full ${i.metodo_pago === 'Zelle' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600' : i.metodo_pago === 'Binance' ? 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                                        {i.metodo_pago}
                                    </span>
                                    <p className="text-[7px] text-slate-300 dark:text-slate-700 font-black mt-0.5 uppercase italic">{i.fecha}</p>
                                </div>
                            </div>
                            
                            <h4 className="font-black text-slate-800 dark:text-white text-[10px] uppercase truncate mb-1 italic">
                                {i.descripcion || 'Sin descripción'}
                            </h4>
                            <div className="flex gap-1 mb-2">
                                <span className="text-[6px] font-black bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-700 uppercase italic">{i.categoria}</span>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-800">
                                <div className="flex flex-col">
                                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 italic">${parseFloat(i.monto).toLocaleString()}</span>
                                </div>
                                <div className="flex gap-1">
                                    <button 
                                        onClick={() => handleEdit(i.id)}
                                        className="p-1 text-slate-300 dark:text-slate-700 hover:text-orange-500 transition-colors"
                                    >
                                        <Edit3 size={14} />
                                    </button>
                                    <button 
                                        onClick={() => db.incomes.delete(i.id)}
                                        className="p-1 text-slate-300 dark:text-slate-700 hover:text-red-500 transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>

      <IngresoWizard 
        isOpen={isWizardOpen} 
        setIsOpen={setIsWizardOpen} 
        editingId={editingId}
        setEditingId={setEditingId}
      />
    </div>
  );
};

export default Ingresos;
