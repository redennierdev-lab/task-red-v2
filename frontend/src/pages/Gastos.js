import React, { useState, useContext, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  TrendingDown, Plus, History, Wallet, X, Edit3,
  DollarSign, Calendar, Tag, CreditCard, Filter
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/database';
import GastoWizard from '../features/finance/components/GastoWizard';
import { AppContext } from '../context/AppContext';
import ConfirmModal from '../components/shared/ConfirmModal';

/* ─── Tooltip custom MD3 ─── */
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
      <p style={{ fontSize: 18, fontWeight: 800, color: isDark ? '#FFB68A' : '#E8700A' }}>
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
      style={{ background: color, boxShadow: `0 4px 14px ${color}55` }}
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

/* ─── Expense Card ─── */
const ExpenseCard = ({ gasto, onEdit, onDelete }) => {
  const isProducto = gasto.categoria === 'Producto';
  return (
    <div className="premium-card p-0 group flex flex-col overflow-hidden transition-all">
      {/* MD3 gradient lip */}
      <div className="h-1 w-full bg-logo-gradient opacity-60 group-hover:opacity-100 group-hover:h-[3px] transition-all duration-300" />

      <div className="p-4 flex flex-col gap-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 min-w-0">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                isProducto
                  ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-500'
                  : 'bg-fuchsia-50 dark:bg-fuchsia-500/10 text-fuchsia-500'
              }`}
            >
              {isProducto ? <Tag size={16} /> : <DollarSign size={16} />}
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-slate-900 dark:text-white text-[13px] tracking-tight truncate leading-tight">
                {gasto.producto_nombre || gasto.descripcion || 'Sin nombre'}
              </h4>
              {gasto.marca && (
                <span className="text-[10px] text-slate-400 font-medium">{gasto.marca}</span>
              )}
            </div>
          </div>

          {/* Action buttons — visible on hover */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button
              onClick={() => onEdit(gasto.id)}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-orange-50 dark:hover:bg-orange-500/10 text-slate-300 hover:text-orange-500 transition-colors"
              aria-label="Editar"
            >
              <Edit3 size={13} />
            </button>
            <button
              onClick={() => onDelete(gasto.id)}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-300 hover:text-red-500 transition-colors"
              aria-label="Eliminar"
            >
              <X size={13} />
            </button>
          </div>
        </div>

        {/* Chips row */}
        <div className="flex flex-wrap gap-1.5">
          <span className={`md-chip ${gasto.metodo_pago === 'Divisa' ? 'md-chip-success' : 'md-chip-neutral'}`}>
            <CreditCard size={9} /> {gasto.metodo_pago || 'N/A'}
          </span>
          <span className="md-chip md-chip-neutral">
            <Tag size={9} /> {gasto.categoria || 'General'}
          </span>
          {gasto.fecha && (
            <span className="md-chip md-chip-neutral">
              <Calendar size={9} /> {gasto.fecha}
            </span>
          )}
        </div>

        {/* Footer: Amount */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60">
          <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            ${parseFloat(gasto.monto).toLocaleString()}
            <span className="text-xs text-slate-400 font-normal ml-1">USD</span>
          </span>
          <span
            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
              isProducto
                ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400'
                : 'bg-fuchsia-50 dark:bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400'
            }`}
          >
            {gasto.categoria}
          </span>
        </div>
      </div>
    </div>
  );
};

/* ─── Empty State ─── */
const EmptyState = ({ onAdd }) => (
  <div className="col-span-full flex flex-col items-center justify-center py-20 rounded-[2rem] border-2 border-dashed border-slate-100 dark:border-slate-800 gap-4">
    <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
      <Wallet size={28} className="text-slate-300 dark:text-slate-600" />
    </div>
    <div className="text-center">
      <p className="text-sm font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">Sin registros</p>
      <p className="text-xs text-slate-300 dark:text-slate-700 mt-1">No hay gastos registrados este período</p>
    </div>
    <button onClick={onAdd} className="btn-gradient px-6 py-2.5">
      <Plus size={15} />
      <span>Registrar primer gasto</span>
    </button>
  </div>
);

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════════════════ */
const Gastos = () => {
  const [isWizardOpen, setIsWizardOpen]   = useState(false);
  const [editingId, setEditingId]         = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  const [filterCategory, setFilterCategory] = useState('all');

  const { theme, deleteRecord, refreshAll } = useContext(AppContext);
  const isDark = theme === 'dark';

  const handleEdit = (id) => {
    setEditingId(id);
    setIsWizardOpen(true);
  };

  const handleDeleteTrigger = (id) => setConfirmDelete({ open: true, id });

  const handleConfirmDelete = async () => {
    if (confirmDelete.id) {
      await deleteRecord('expenses', confirmDelete.id);
      if (refreshAll) await refreshAll();
      setConfirmDelete({ open: false, id: null });
    }
  };

  const rawGastos = useLiveQuery(() => db.expenses.reverse().toArray(), []);

  /* Chart data — grouped by month */
  const chartData = useMemo(() => {
    if (!rawGastos) return [];
    const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    const summary = {};
    rawGastos.forEach(g => {
      if (!g.fecha) return;
      const m = months[new Date(g.fecha).getMonth()];
      summary[m] = (summary[m] || 0) + (parseFloat(g.monto) || 0);
    });
    return months.map(m => ({ mes: m, monto: summary[m] || 0 }));
  }, [rawGastos]);

  /* Total current month */
  const totalMes = useMemo(() => {
    if (!rawGastos) return 0;
    const currentMonth = new Date().getMonth();
    return rawGastos
      .filter(g => new Date(g.fecha).getMonth() === currentMonth)
      .reduce((sum, g) => sum + (parseFloat(g.monto) || 0), 0);
  }, [rawGastos]);

  /* Filtered list */
  const filteredGastos = useMemo(() => {
    if (!rawGastos) return [];
    if (filterCategory === 'all') return rawGastos;
    return rawGastos.filter(g => g.categoria === filterCategory);
  }, [rawGastos, filterCategory]);

  const categories = useMemo(() => {
    if (!rawGastos) return [];
    return [...new Set(rawGastos.map(g => g.categoria).filter(Boolean))];
  }, [rawGastos]);

  /* Loading */
  if (!rawGastos) return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <div className="w-10 h-10 rounded-full border-4 border-orange-500/20 border-t-orange-500 animate-spin" />
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Sincronizando bóveda…</p>
    </div>
  );

  return (
    <div className="space-y-6 page-transition">

      {/* ── Top App Bar / View Header ── */}
      <div className="view-header">
        <div className="flex items-center gap-4">
          <div className="brand-icon bg-gradient-to-br from-rose-500 to-orange-500">
            <TrendingDown size={24} />
          </div>
          <div>
            <h1 className="view-title">Análisis de Gastos</h1>
            <p className="view-subtitle">Control Financiero Operativo · RED ENNIER</p>
          </div>
        </div>

        <button
          id="btn-nuevo-gasto"
          onClick={() => { setEditingId(null); setIsWizardOpen(true); }}
          className="btn-gradient px-6 py-3 shadow-xl"
        >
          <Plus size={17} />
          <span>Nuevo Gasto</span>
        </button>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Total Mes Actual"
          value={`$${totalMes.toLocaleString()}`}
          icon={TrendingDown}
          color="linear-gradient(135deg, #f43f5e, #f97316)"
          sub="En tiempo real"
        />
        <StatCard
          label="Registros Totales"
          value={rawGastos.length}
          icon={History}
          color="linear-gradient(135deg, #8b5cf6, #d946ef)"
          sub={`${categories.length} categoría(s)`}
        />
        <StatCard
          label="Promedio por Gasto"
          value={rawGastos.length > 0 ? `$${(rawGastos.reduce((s, g) => s + (parseFloat(g.monto) || 0), 0) / rawGastos.length).toFixed(2)}` : '$0'}
          icon={DollarSign}
          color="linear-gradient(135deg, #0ea5e9, #6366f1)"
          sub="Histórico acumulado"
        />
      </div>

      {/* ── Area Chart ── */}
      <div className="premium-card p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              Flujo de Egresos Anual
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-0.5">Proyección acumulada por mes</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Gastos</span>
          </div>
        </div>
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gastoGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f43f5e" stopOpacity={isDark ? 0.25 : 0.2} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
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
                stroke={isDark ? '#fb7185' : '#f43f5e'}
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#gastoGradient)"
                dot={false}
                activeDot={{ r: 5, strokeWidth: 2, fill: '#f43f5e', stroke: '#fff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Expense List ── */}
      <div className="space-y-4">
        {/* Section header + filter chips */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <History size={15} className="text-slate-400" />
            <h2 className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest">
              Registros de Bóveda
              {rawGastos.length > 0 && (
                <span className="ml-2 px-1.5 py-0.5 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-full text-[9px]">
                  {filteredGastos.length}
                </span>
              )}
            </h2>
          </div>

          {/* Category filter chips */}
          {categories.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              <button
                onClick={() => setFilterCategory('all')}
                className={`md-chip transition-all ${filterCategory === 'all' ? 'md-chip-primary' : 'md-chip-neutral'}`}
              >
                <Filter size={8} /> Todos
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`md-chip transition-all ${filterCategory === cat ? 'md-chip-primary' : 'md-chip-neutral'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredGastos.length === 0 ? (
            <EmptyState onAdd={() => { setEditingId(null); setIsWizardOpen(true); }} />
          ) : (
            filteredGastos.map(g => (
              <ExpenseCard
                key={g.id}
                gasto={g}
                onEdit={handleEdit}
                onDelete={handleDeleteTrigger}
              />
            ))
          )}
        </div>
      </div>

      {/* Wizard */}
      <GastoWizard
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
        title="Eliminar Gasto"
        message="¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer."
      />
    </div>
  );
};

export default Gastos;
