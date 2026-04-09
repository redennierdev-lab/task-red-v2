import React, { useState, useContext, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowDownRight, TrendingUp, Plus, LayoutList, History, DollarSign, Wallet, X, Edit3 } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import GastoWizard from '../components/GastoWizard';
import { AppContext } from '../context/AppContext';

const Gastos = () => {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const { theme, deleteRecord } = useContext(AppContext);
  const isDark = theme === 'dark';

  const handleEdit = (id) => {
      setEditingId(id);
      setIsWizardOpen(true);
  };

  // Consultar gastos de la DB local en tiempo real
  const rawGastos = useLiveQuery(() => db.expenses.reverse().toArray(), []);

  // Agrupar por mes para la gráfica
  const chartData = useMemo(() => {
    if (!rawGastos) return [];
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const summary = {};
    
    rawGastos.forEach(g => {
        if (!g.fecha) return;
        const monthIndex = new Date(g.fecha).getMonth();
        const monthName = months[monthIndex];
        summary[monthName] = (summary[monthName] || 0) + (parseFloat(g.monto) || 0);
    });

    return months.map(m => ({ mes: m, monto: summary[m] || 0 }));
  }, [rawGastos]);

  const totalMes = useMemo(() => {
      if (!rawGastos) return 0;
      const currentMonth = new Date().getMonth();
      return rawGastos
        .filter(g => new Date(g.fecha).getMonth() === currentMonth)
        .reduce((sum, g) => sum + (parseFloat(g.monto) || 0), 0);
  }, [rawGastos]);

  if (!rawGastos) return <div className="p-20 text-center font-black animate-pulse text-slate-300 dark:text-slate-700 tracking-[0.5em] uppercase">Sincronizando Bóveda...</div>;

  return (
    <div className="space-y-6 page-transition pb-20">
      <div className="view-header">
        <div className="relative z-10 flex items-center gap-6">
            <div className="brand-icon">
                <TrendingUp size={32} />
            </div>
            <div>
              <h2 className="view-title">Análisis de Gastos</h2>
              <p className="view-subtitle">Control Financiero Operativo RED ENNIER</p>
            </div>
        </div>
        
        <button 
          onClick={() => setIsWizardOpen(true)}
          className="btn-gradient relative z-10 flex items-center gap-3 px-10 shadow-2xl shadow-orange-500/20"
        >
          <TrendingUp size={18} />
          <span>Nuevo Gasto</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card Resumen Vibrante */}
        <div className="premium-card p-8 flex items-center justify-between col-span-1 bg-logo-gradient text-white border-none shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/70 mb-2 italic">Total Gastos Mensuales</p>
            <h3 className="text-5xl font-black text-white tracking-tighter">${totalMes.toLocaleString()}<span className="text-base text-white/40 ml-1">.00</span></h3>
            <div className="mt-4 flex items-center gap-2 bg-white/20 w-fit px-3 py-1 rounded-full backdrop-blur-md">
                <TrendingUp size={12} className="text-yellow-300" />
                <span className="text-[9px] font-black uppercase tracking-widest">En Tiempo Real</span>
            </div>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-[2rem] flex items-center justify-center text-white backdrop-blur-xl shadow-inner relative z-10 border border-white/30">
            <DollarSign size={28} />
          </div>
        </div>
        
        {/* Card Grafica */}
        <div className="premium-card p-8 col-span-2 border-2 border-orange-50 dark:border-slate-800">
            <div className="w-full">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-8 flex items-center gap-2 italic"><TrendingUp size={16} className="text-fuchsia-500" /> Flujo de Egreso Anual (Proyectado)</p>
                <div className="h-[180px] min-h-[180px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorGasto" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={isDark ? '#f43f5e' : '#ef4444'} stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#f1f5f9'} />
                            <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: isDark ? '#475569' : '#cbd5e1', fontWeight: 900 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: isDark ? '#475569' : '#cbd5e1', fontWeight: 900 }} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: isDark ? '#0f172a' : '#fff', border: 'none', borderRadius: '1.2rem', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', color: isDark ? '#fff' : '#1e293b', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase' }} 
                                itemStyle={{ color: isDark ? '#fff' : '#1e293b' }}
                            />
                            <Area type="monotone" dataKey="monto" stroke={isDark ? '#fb7185' : '#f43f5e'} strokeWidth={5} fillOpacity={1} fill="url(#colorGasto)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
      </div>

      {/* Listado de Gastos Recientes */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-2">
            <History size={16} className="text-slate-400 dark:text-slate-600" />
            <h3 className="text-xs font-black text-slate-500 dark:text-slate-600 uppercase tracking-widest italic">Registros de Bóveda</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rawGastos.length === 0 ? (
                <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2.5rem] transition-colors">
                    <Wallet size={40} className="mx-auto text-slate-100 dark:text-slate-800 mb-4" />
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] italic">No hay gastos registrados en la memoria local</p>
                </div>
            ) : (
                rawGastos.map(g => (
                    <div key={g.id} className="premium-card p-0 group flex flex-col relative overflow-hidden transform hover:-translate-y-0.5 transition-all duration-300">
                        <div className="h-1 bg-logo-gradient w-full opacity-80 group-hover:h-1.5 transition-all duration-500"></div>
                        
                        <div className="p-3 bg-white dark:bg-slate-900 relative">
                            <div className="flex justify-between items-start mb-2">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${g.categoria === 'Producto' ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-500' : 'bg-fuchsia-50 dark:bg-fuchsia-500/10 text-fuchsia-500'}`}>
                                    {g.categoria === 'Producto' ? <Plus size={14} /> : <DollarSign size={14} />}
                                </div>
                                <div className="text-right">
                                    <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded-full ${g.metodo_pago === 'Divisa' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                                        {g.metodo_pago}
                                    </span>
                                    <p className="text-[7px] text-slate-300 dark:text-slate-700 font-black mt-0.5 uppercase italic">{g.fecha}</p>
                                </div>
                            </div>
                            
                            <h4 className="font-black text-slate-800 dark:text-white text-[10px] uppercase truncate mb-1 italic">
                                {g.producto_nombre || g.descripcion || 'Sin nombre'}
                            </h4>
                            <div className="flex gap-1 mb-2">
                                {g.marca && <span className="text-[6px] font-black bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-700 uppercase italic">{g.marca}</span>}
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-800">
                                <span className="text-sm font-black text-slate-900 dark:text-emerald-400 italic">${parseFloat(g.monto).toLocaleString()}</span>
                                <div className="flex gap-1">
                                    <button 
                                        onClick={() => handleEdit(g.id)}
                                        className="p-1 text-slate-300 dark:text-slate-700 hover:text-orange-500 transition-colors"
                                    >
                                        <Edit3 size={14} />
                                    </button>
                                    <button 
                                        onClick={() => db.expenses.delete(g.id)}
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

      <GastoWizard 
        isOpen={isWizardOpen} 
        setIsOpen={setIsWizardOpen} 
        editingId={editingId}
        setEditingId={setEditingId}
      />
    </div>
  );
};

export default Gastos;

