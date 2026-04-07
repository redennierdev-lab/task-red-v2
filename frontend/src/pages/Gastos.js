import React, { useState, useContext, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowDownRight, TrendingUp, Plus, LayoutList, History, DollarSign, Wallet, X } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import GastoWizard from '../components/GastoWizard';
import { AppContext } from '../context/AppContext';

const Gastos = () => {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const { deleteRecord } = useContext(AppContext);

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

  if (!rawGastos) return <div className="p-20 text-center font-black animate-pulse text-slate-300 tracking-[0.5em] uppercase">Sincronizando Bóveda...</div>;

  return (
    <div className="space-y-8 page-transition pb-20">
      <div className="view-header">
        <div className="relative z-10 flex items-center gap-6">
            <div className="brand-icon">
                <TrendingUp size={32} />
            </div>
            <div>
              <h2 className="view-title italic uppercase tracking-tighter">Análisis de Gastos</h2>
              <p className="view-subtitle tracking-[0.4em] font-black opacity-80 uppercase italic">Control Financiero Operativo RED ENNIER</p>
            </div>
        </div>
        
        <button 
          onClick={() => setIsWizardOpen(true)}
          className="btn-gradient relative z-10 flex items-center gap-3 px-10 shadow-2xl shadow-orange-500/20 active:scale-95 transition-all text-white font-black uppercase tracking-widest italic"
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
        <div className="premium-card p-8 col-span-2 border-2 border-orange-50">
            <div className="w-full">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-2"><TrendingUp size={16} className="text-fuchsia-500" /> Flujo de Egreso Anual (Proyectado)</p>
                <div className="h-[180px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorGasto" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#cbd5e1', fontWeight: 900 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#cbd5e1', fontWeight: 900 }} />
                            <Tooltip contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '1.2rem', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', color: '#1e293b', fontSize: '11px', fontWeight: 900, fontFamily: 'Plus Jakarta Sans', textTransform: 'uppercase' }} />
                            <Area type="monotone" dataKey="monto" stroke="#f43f5e" strokeWidth={5} fillOpacity={1} fill="url(#colorGasto)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
      </div>

      {/* Listado de Gastos Recientes */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-2">
            <History size={16} className="text-slate-400" />
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Registros de Bóveda</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rawGastos.length === 0 ? (
                <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-100 rounded-[2.5rem]">
                    <Wallet size={40} className="mx-auto text-slate-100 mb-4" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">No hay gastos registrados en la memoria local</p>
                </div>
            ) : (
                rawGastos.map(g => (
                    <div key={g.id} className="premium-card p-5 group hover:border-slate-300 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${g.categoria === 'Producto' ? 'bg-orange-50 text-orange-500' : 'bg-fuchsia-50 text-fuchsia-500'}`}>
                                {g.categoria === 'Producto' ? <Plus size={20} /> : <DollarSign size={20} />}
                            </div>
                            <div className="text-right">
                                <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${g.metodo_pago === 'Divisa' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                    {g.metodo_pago}
                                </span>
                                <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase">{g.fecha}</p>
                            </div>
                        </div>
                        
                        <h4 className="font-black text-slate-800 text-sm uppercase truncate mb-1">
                            {g.producto_nombre || g.descripcion || 'Sin nombre'}
                        </h4>
                        <div className="flex gap-2 mb-4">
                            {g.marca && <span className="text-[8px] font-bold bg-slate-50 text-slate-400 px-2 py-0.5 rounded border border-slate-100 uppercase">{g.marca}</span>}
                            <span className="text-[8px] font-bold bg-slate-50 text-slate-400 px-2 py-0.5 rounded border border-slate-100 uppercase">{g.categoria}</span>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                            <span className="text-lg font-black text-slate-900">${parseFloat(g.monto).toLocaleString()}</span>
                            <button 
                                onClick={() => db.expenses.delete(g.id)}
                                className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>

      <GastoWizard isOpen={isWizardOpen} setIsOpen={setIsWizardOpen} />
    </div>
  );
};

export default Gastos;

