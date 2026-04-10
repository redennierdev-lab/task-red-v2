import React, { useContext, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, ClipboardList, Users, Wrench, Rocket,
  History, Settings, TrendingUp, TrendingDown,
  Sun, Moon, RotateCcw, RotateCw, Menu,
  ToggleLeft, ToggleRight, Lock, X, ChevronRight, ShieldCheck
} from 'lucide-react';
import { AppContext } from '../../context/AppContext';

/* ─── Desktop Navigation Rail (left sidebar on lg+) ─── */
const DesktopNav = () => {
  const {
    userRole, setUserRole,
    theme, toggleTheme,
    undo, redo, canUndo, canRedo,
    setIsSidebarOpen,
  } = useContext(AppContext);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pwInput, setPwInput] = useState('');
  const [pwError, setPwError] = useState('');

  const navGroups = [
    {
      label: 'Principal',
      items: [
        { path: '/',          icon: LayoutDashboard, label: 'Dashboard',       roles: ['Admin', 'Técnico'] },
        { path: '/tasks',     icon: ClipboardList,   label: 'Tareas',          roles: ['Admin'] },
        { path: '/mis-tareas',icon: ClipboardList,   label: 'Mis Tareas',      roles: ['Técnico'] },
      ],
    },
    {
      label: 'Gestión',
      items: [
        { path: '/users',       icon: Users,  label: 'Clientes',      roles: ['Admin'] },
        { path: '/technicians', icon: Wrench, label: 'Especialistas', roles: ['Admin'] },
        { path: '/services',    icon: Rocket, label: 'Catálogo',      roles: ['Admin'] },
      ],
    },
    {
      label: 'Finanzas',
      items: [
        { path: '/ingresos', icon: TrendingUp,   label: 'Ingresos', roles: ['Admin'] },
        { path: '/gastos',   icon: TrendingDown, label: 'Gastos',   roles: ['Admin'] },
      ],
    },
    {
      label: 'Sistema',
      items: [
        { path: '/historial',  icon: History,  label: 'Auditoría',     roles: ['Admin'] },
        { path: '/parametros', icon: Settings, label: 'Configuración', roles: ['Admin'] },
      ],
    },
  ];

  const filteredGroups = navGroups
    .map(g => ({ ...g, items: g.items.filter(i => i.roles.includes(userRole)) }))
    .filter(g => g.items.length > 0);

  const handleRoleToggle = () => {
    if (userRole === 'Admin') {
      setUserRole('Técnico');
    } else {
      setShowPasswordModal(true);
      setPwInput('');
      setPwError('');
    }
  };

  const handlePasswordSubmit = () => {
    if (pwInput === 'G89qpjksr**..') {
      setUserRole('Admin');
      setShowPasswordModal(false);
    } else {
      setPwError('Contraseña incorrecta.');
    }
  };

  return (
    <>
      {/* ── Desktop Navigation Rail ── */}
      <aside
        className={`hidden lg:flex fixed inset-y-0 left-0 z-50 flex-col w-72 
          bg-slate-50 dark:bg-slate-950 
          border-r border-slate-200 dark:border-slate-800/60
          shadow-sm transition-colors duration-300`}
      >
         <div className="px-5 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-logo-gradient rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <ShieldCheck size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-none">
                RED ENNIER
              </h1>
              <p className="text-[10px] font-semibold text-indigo-500 uppercase tracking-widest mt-0.5">
                Task Manager v3.1
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 custom-scrollbar">
          {filteredGroups.map(group => (
            <div key={group.label} className="mb-5">
              <p className="section-label">{group.label}</p>
              <div className="space-y-0.5">
                {group.items.map(item => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-2.5 transition-all duration-200 group relative ripple
                      ${isActive
                        ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                      }`
                    }
                    style={{ borderRadius: 'var(--md-shape-lg)' }}
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-500 rounded-r-full" />
                        )}
                        <item.icon
                          size={18}
                          strokeWidth={isActive ? 2.5 : 1.8}
                          className="shrink-0 transition-transform group-hover:scale-110"
                        />
                        <span className={`flex-1 text-[13px] tracking-tight ${isActive ? 'font-bold' : 'font-semibold'}`}>
                          {item.label}
                        </span>
                        {isActive && <ChevronRight size={12} className="opacity-30 shrink-0" />}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800/60 space-y-2">
          {/* User card */}
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/40">
            <div className="w-8 h-8 rounded-full bg-logo-gradient p-0.5 shadow shrink-0">
              <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-orange-600 font-bold text-[10px]">
                {userRole === 'Admin' ? 'AD' : 'TE'}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-slate-800 dark:text-white uppercase tracking-tight truncate">
                {userRole === 'Admin' ? 'Ennier · Admin' : 'Instalador'}
              </p>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-widest">En línea</span>
              </div>
            </div>
            <button
              onClick={handleRoleToggle}
              className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Cambiar rol"
            >
              {userRole === 'Admin'
                ? <ToggleRight size={16} className="text-indigo-500" />
                : <ToggleLeft  size={16} className="text-slate-400" />
              }
            </button>
          </div>

          {/* Undo / Redo + Theme row */}
          <div className="flex items-center gap-1.5 px-1">
            <button
              onClick={undo}
              disabled={!canUndo}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-semibold uppercase transition-all
                disabled:opacity-30 enabled:hover:bg-slate-100 dark:enabled:hover:bg-slate-800 text-slate-500"
            >
              <RotateCcw size={13} /> Undo
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-semibold uppercase transition-all
                disabled:opacity-30 enabled:hover:bg-slate-100 dark:enabled:hover:bg-slate-800 text-slate-500"
            >
              <RotateCw size={13} /> Redo
            </button>
            <button
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
            >
              {theme === 'dark' ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
            </button>
          </div>
        </div>
      </aside>

      {/* ── Mobile Top App Bar ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 z-40 flex items-center justify-between px-4
        bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-xl
        border-b border-slate-200 dark:border-slate-800/60
        shadow-sm transition-colors duration-300">

        <button
          onClick={() => setIsSidebarOpen(true)}
          className="w-10 h-10 flex items-center justify-center rounded-full
            bg-orange-50 dark:bg-slate-800 text-orange-600 dark:text-orange-400
            active:scale-90 transition-all"
          aria-label="Abrir menú"
          id="topbar-menu-btn"
        >
          <Menu size={22} />
        </button>

        {/* Center — App name */}
        <div className="flex flex-col items-center">
          <span className="text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-widest leading-none">
            RED ENNIER
          </span>
          <span className="text-[8px] font-semibold text-indigo-500 uppercase tracking-[0.2em] mt-0.5">
            System Online
          </span>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="w-9 h-9 flex items-center justify-center rounded-full transition-all active:scale-90
              disabled:opacity-25 enabled:hover:bg-slate-100 dark:enabled:hover:bg-slate-800
              text-slate-500 dark:text-slate-400"
            aria-label="Deshacer"
          >
            <RotateCcw size={17} />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="w-9 h-9 flex items-center justify-center rounded-full transition-all active:scale-90
              disabled:opacity-25 enabled:hover:bg-slate-100 dark:enabled:hover:bg-slate-800
              text-slate-500 dark:text-slate-400"
            aria-label="Rehacer"
          >
            <RotateCw size={17} />
          </button>
          <button
            onClick={toggleTheme}
            className="w-9 h-9 flex items-center justify-center rounded-full
              bg-orange-50 dark:bg-slate-800 text-orange-600 dark:text-orange-400
              active:scale-90 transition-all"
            aria-label="Cambiar tema"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>

      {/* ── Password Modal ── */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-md"
            onClick={() => setShowPasswordModal(false)}
          />
          <div className="relative w-full max-w-sm bg-white dark:bg-[#251D1A] rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 p-8">
            <div className="absolute top-0 left-0 right-0 h-1 bg-logo-gradient" />
            <button
              onClick={() => setShowPasswordModal(false)}
              className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
            >
              <X size={18} />
            </button>
            <div className="text-center mb-6 mt-2">
              <div className="mx-auto w-14 h-14 bg-logo-gradient rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-indigo-500/30">
                <Lock size={26} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Acceso Admin</h3>
              <p className="text-[11px] text-indigo-500 font-semibold uppercase tracking-widest mt-1">Contraseña de mando</p>
            </div>
            <div className="space-y-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-300 dark:text-slate-600">
                  <Lock size={15} />
                </div>
                <input
                  type="password"
                  className={`w-full pl-10 pr-4 py-3.5 rounded-2xl text-sm font-semibold outline-none transition-all tracking-widest
                    bg-slate-50 dark:bg-[#1E1916] border-2 text-slate-800 dark:text-white
                    ${pwError ? 'border-red-400' : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500'}`}
                  placeholder="••••••••••••"
                  value={pwInput}
                  onChange={e => { setPwInput(e.target.value); setPwError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handlePasswordSubmit()}
                  autoFocus
                />
              </div>
              {pwError && <p className="text-[11px] text-red-500 font-semibold pl-2">{pwError}</p>}
              <button
                onClick={handlePasswordSubmit}
                className="w-full py-3.5 btn-gradient text-sm font-bold uppercase tracking-widest"
              >
                <Lock size={15} />
                <span>Desbloquear</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DesktopNav;