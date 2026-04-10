import React, { useState, useContext, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  TrendingUp, Plus, History, Wallet, X, Edit3,
  Zap, Briefcase, Calendar, CreditCard, Filter, DollarSign
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/database';
import IngresoWizard from '../features/finance/components/IngresoWizard';
import { AppContext } from '../context/AppContext';
import ConfirmModal from '../components/shared/ConfirmModal';

/* ─── Custom MD3 Tooltip ─── */
const CustomTooltip = ({ active, payload, label, isDark }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: isDark ? '#251D1A' : '#fff',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
      borderRadius: 16,
      padding: '10px 16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
    }}>
      <p style={{ fontSize: 10, fontWeight: 700, color: '#A08D89', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 18, fontWeight: 800, color: '#10b981' }}>
        ${Number(payload[0].value).toLocaleString()}
      </p>
    </div>
  );
};

/* ─── Stat Card ─── */
const StatCard = ({ label, value, icon: Icon, color, sub }) => (
  <div className="premium-card p-5 flex items-center gap-4">
    <div
      className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md"
      style={{ background: color }}
    >
      <Icon size={22} className="text-white" />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">{value}</p>
      {sub && <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{sub}</p>}
    </div>
  </div>
);

/* ─── Income Card ─── */
const IncomeCard = ({ ingreso, onEdit, onDelete }) => {
  const isAuto = ingreso.tipo_origen === 'Automático';
  const methodColors = {
    Zelle:   'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
    Binance: 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/20',
    Efectivo:'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
  };
  const methodClass = methodColors[ingreso.metodo_pago] || 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700';

  return (
    <div className="premium-card p-0 group flex flex-col overflow-hidden">
      {/* Gradient top line */}
      <div className="h-[3px] w-full bg-gradient-to-r from-emerald-400 to-teal-500 opacity-70 group-hover:opacity-100 transition-opacity" />

      <div className="p-4 flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 min-w-0">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                isAuto
                  ? 'bg-fuchsia-50 dark:bg-fuchsia-500/10 text-fuchsia-500'
                  : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500'
              }`}
            >
              {isAuto ? <Zap size={16} /> : <Briefcase size={16} />}
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-slate-900 dark:text-white text-[13px] tracking-tight truncate leading-tight">
                {ingreso.descripcion || 'Sin descripción'}
              </h4>
              <p className="text-[10px] text-slate-400 font-medium">{ingreso.categoria || 'General'}</p>
            </div>
          </div>

          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button
              onClick={() => onEdit(ingreso.id)}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-slate-300 hover:text-emerald-500 transition-colors"
              aria-label="Editar"
            >
              <Edit3 size={13} />
            </button>
            <button
              onClick={() => onDelete(ingreso.id)}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-300 hover:text-red-500 transition-colors"
              aria-label="Eliminar"
            >
              <X size={13} />
            </button>
          </div>
        </div>

        {/* Chips */}
        <div className="flex flex-wrap gap-1.5">
          <span className={`md-chip border ${methodClass}`}>
            <CreditCard size={9} /> {ingreso.metodo_pago || 'N/A'}
          </span>
          {ingreso.fecha && (
            <span className="md-chip md-chip-neutral">
              <Calendar size={9} /> {ingreso.fecha}
            </span>
          )}
          {isAuto && (
            <span className="md-chip md-chip-primary">
              <Zap size={9} /> Auto
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60">
          <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
            ${parseFloat(ingreso.monto).toLocaleString()}
            <span className="text-xs text-slate-400 font-normal ml-1">USD</span>
          </span>
          <div className="w-6 h-6 flex items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/10">
            <TrendingUp size={12} className="text-emerald-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Empty State ─── */
const EmptyState = ({ onAdd }) => (
  <div className="col-span-full flex flex-col items-center justify-center py-20 rounded-[2rem] border-2 border-dashed border-slate-100 dark:border-slate-800 gap-4">
    <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
      <Wallet size={28} className="text-emerald-400 dark:text-emerald-600" />
    </div>
    <div className="text-center">
      <p className="text-sm font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">Bóveda vacía</p>
      <p className="text-xs text-slate-300 dark:text-slate-700 mt-1">No hay ingresos registrados en este período</p>
    </div>
    <button onClick={onAdd} className="btn-gradient px-6 py-2.5">
      <Plus size={15} />
      <span>Registrar primer ingreso</span>
    </button>
  </div>
);

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════════════════ */
const Ingresos = () => {
  const [isWizardOpen, setIsWizardOpen]   = useState(false);
  const [editingId, setEditingId]         = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  const [filterMethod, setFilterMethod]   = useState('all');

  const { theme, deleteRecord, refreshAll } = useContext(AppContext);
  const isDark = theme === 'dark';

  const handleEdit   = (id) => { setEditingId(id); setIsWizardOpen(true); };
  const handleDelete = (id) => setConfirmDelete({ open: true, id });

  const handleConfirmDelete = async () => {
    if (confirmDelete.id) {
      await deleteRecord('incomes', confirmDelete.id);
      if (refreshAll) await refreshAll();
      setConfirmDelete({ open: false, id: null });
    }
  };

  const rawIngresos = useLiveQuery(() => db.incomes.reverse().toArray(), []);

  /* Chart data */
  const chartData = useMemo(() => {
    if (!rawIngresos) return [];
    const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    const summary = {};
    rawIngresos.forEach(i => {
      if (!i.fecha) return;
      const m = months[new Date(i.fecha).getMonth()];
      summary[m] = (summary[m] || 0) + (parseFloat(i.monto) || 0);
    });
    return months.map(m => ({ mes: m, monto: summary[m] || 0 }));
  }, [rawIngresos]);

  /* Total current month */
  const totalMes = useMemo(() => {
    if (!rawIngresos) return 0;
    const now = new Date();
    return rawIngresos
      .filter(i => {
        const d = new Date(i.fecha);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, i) => sum + (parseFloat(i.monto) || 0), 0);
  }, [rawIngresos]);

  /* Methods */
  const methods = useMemo(() => {
    if (!rawIngresos) return [];
    return [...new Set(rawIngresos.map(i => i.metodo_pago).filter(Boolean))];
  }, [rawIngresos]);

  /* Filtered */
  const filtered = useMemo(() => {
    if (!rawIngresos) return [];
    if (filterMethod === 'all') return rawIngresos;
    return rawIngresos.filter(i => i.metodo_pago === filterMethod);
  }, [rawIngresos, filterMethod]);

  /* Loading */
  if (!rawIngresos) return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <div className="w-10 h-10 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Sincronizando bóveda de capital…</p>
    </div>
  );

  return (
    <div className="space-y-6 page-transition">

      {/* ── View Header ── */}
      <div className="view-header">
        <div className="flex items-center gap-4">
          <div
            className="brand-icon shadow-emerald-500/25"
            style={{ background: 'linear-gradient(135deg, #10b981, #14b8a6)' }}
          >
            <TrendingUp size={24} />
          </div>
          <div>
            <h1 className="view-title">Gestión de Ingresos</h1>
            <p className="view-subtitle">Captación Activa de Capital · RED ENNIER</p>
          </div>
        </div>
        <button
          id="btn-nuevo-ingreso"
          onClick={() => { setEditingId(null); setIsWizardOpen(true); }}
          className="btn-gradient px-6 py-3"
          style={{ background: 'linear-gradient(135deg, #10b981, #14b8a6)' }}
        >
          <Plus size={17} />
          <span>Nuevo Ingreso</span>
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Capital Captado — Mes"
          value={`$${totalMes.toLocaleString()}`}
          icon={TrendingUp}
          color="linear-gradient(135deg, #10b981, #059669)"
          sub="Flujo positivo activo"
        />
        <StatCard
          label="Registros Totales"
          value={rawIngresos.length}
          icon={History}
          color="linear-gradient(135deg, #6366f1, #8b5cf6)"
          sub={`${methods.length} método(s) de pago`}
        />
        <StatCard
          label="Promedio por Ingreso"
          value={rawIngresos.length > 0
            ? `$${(rawIngresos.reduce((s,i) => s + (parseFloat(i.monto)||0), 0) / rawIngresos.length).toFixed(2)}`
            : '$0'
          }
          icon={DollarSign}
          color="linear-gradient(135deg, #0ea5e9, #38bdf8)"
          sub="Histórico acumulado"
        />
      </div>

      {/* ── Area Chart ── */}
      <div className="premium-card p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              Rendimiento de Cobros Anual
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-0.5">Proyección acumulada por mes</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Ingresos</span>
          </div>
        </div>
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="ingresoGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={isDark ? 0.25 : 0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}
              />
              <XAxis
                dataKey="mes"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: isDark ? '#5C443C' : '#C2A79F', fontWeight: 600 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: isDark ? '#5C443C' : '#C2A79F', fontWeight: 600 }}
              />
              <Tooltip content={<CustomTooltip isDark={isDark} />} />
              <Area
                type="monotone"
                dataKey="monto"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#ingresoGradient)"
                dot={false}
                activeDot={{ r: 5, strokeWidth: 2, fill: '#10b981', stroke: '#fff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Income List ── */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <History size={15} className="text-slate-400" />
            <h2 className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest">
              Historial de Cobros
              {rawIngresos.length > 0 && (
                <span className="ml-2 px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[9px]">
                  {filtered.length}
                </span>
              )}
            </h2>
          </div>

          {methods.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              <button
                onClick={() => setFilterMethod('all')}
                className={`md-chip transition-all ${filterMethod === 'all' ? 'md-chip-success' : 'md-chip-neutral'}`}
              >
                <Filter size={8} /> Todos
              </button>
              {methods.map(m => (
                <button
                  key={m}
                  onClick={() => setFilterMethod(m)}
                  className={`md-chip transition-all ${filterMethod === m ? 'md-chip-success' : 'md-chip-neutral'}`}
                >
                  {m}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.length === 0 ? (
            <EmptyState onAdd={() => { setEditingId(null); setIsWizardOpen(true); }} />
          ) : (
            filtered.map(i => (
              <IncomeCard
                key={i.id}
                ingreso={i}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </div>

      {/* Wizard */}
      <IngresoWizard
        isOpen={isWizardOpen}
        setIsOpen={setIsWizardOpen}
        editingId={editingId}
        setEditingId={setEditingId}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null })}
        onConfirm={handleConfirmDelete}
        title="Eliminar Ingreso"
        message="¿Estás seguro de que deseas eliminar este registro de ingreso? Esta acción no se puede deshacer."
      />
    </div>
  );
};

export default Ingresos;
