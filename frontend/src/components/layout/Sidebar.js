import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import {
  X, LayoutDashboard, ClipboardList, Users, Wrench,
  History, Settings, TrendingUp, TrendingDown,
  Rocket, Sun, Moon, ShieldCheck, ChevronRight,
  Lock, ToggleLeft, ToggleRight
} from 'lucide-react';
import { AppContext } from '../../context/AppContext';

const NAV_GROUPS = [
  {
    label: 'Principal',
    items: [
      { path: '/',        icon: LayoutDashboard, label: 'Dashboard',       roles: ['Admin', 'Técnico'] },
      { path: '/tasks',   icon: ClipboardList,   label: 'Tickets / Tareas', roles: ['Admin'] },
      { path: '/mis-tareas', icon: ClipboardList, label: 'Mis Tareas',     roles: ['Técnico'] },
    ],
  },
  {
    label: 'Gestión',
    items: [
      { path: '/users',       icon: Users,    label: 'Clientes',     roles: ['Admin'] },
      { path: '/technicians', icon: Wrench,   label: 'Especialistas',roles: ['Admin'] },
      { path: '/services',    icon: Rocket,   label: 'Catálogo RED', roles: ['Admin'] },
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
      { path: '/historial',   icon: History,  label: 'Auditoría',    roles: ['Admin'] },
      { path: '/parametros',  icon: Settings, label: 'Configuración',roles: ['Admin'] },
    ],
  },
];

const Sidebar = () => {
  const {
    isSidebarOpen, setIsSidebarOpen,
    theme, toggleTheme,
    userRole, setUserRole,
  } = useContext(AppContext);

  const [showPasswordModal, setShowPasswordModal] = React.useState(false);
  const [pwInput, setPwInput]     = React.useState('');
  const [pwError, setPwError]     = React.useState('');

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
      setPwError('Contraseña incorrecta. Acceso denegado.');
    }
  };

  const filteredGroups = NAV_GROUPS
    .map(group => ({
      ...group,
      items: group.items.filter(i => i.roles.includes(userRole)),
    }))
    .filter(group => group.items.length > 0);

  if (!isSidebarOpen) return null;

  return (
    <>
      {/* Scrim / Overlay — MD3 modal navigation drawer */}
      <div
        className="fixed inset-0 z-[1000] bg-black/40 backdrop-blur-sm animate-in fade-in duration-300 lg:hidden"
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Navigation Drawer Panel */}
      <div
        className="fixed inset-y-0 left-0 z-[1001] w-[300px] flex flex-col overflow-hidden animate-in slide-in-from-left duration-400"
        style={{ background: theme === 'dark' ? '#0F172A' : '#F8FAFC' }}
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
      >
        {/* — Drawer Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 bg-logo-gradient rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20"
            >
              <ShieldCheck size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-none tracking-tight">
                RED ENNIER
              </h1>
              <p className="text-[10px] font-semibold text-indigo-500 uppercase tracking-widest mt-0.5">
                Task Manager v3.1
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors active:scale-90"
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
        </div>

        {/* — User Account Card */}
        <div className="px-4 py-3">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
            <div className="w-10 h-10 rounded-full bg-logo-gradient p-0.5 shadow-md shadow-indigo-500/20 shrink-0">
              <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-indigo-600 font-bold text-xs">
                {userRole === 'Admin' ? 'AD' : 'TE'}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-tight">
                {userRole === 'Admin' ? 'Ennier · Admin' : 'Instalador'}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-widest">
                  Local Node Online
                </span>
              </div>
            </div>
            <button
              onClick={handleRoleToggle}
              className="shrink-0 p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Cambiar rol"
            >
              {userRole === 'Admin'
                ? <ToggleRight size={18} className="text-indigo-500" />
                : <ToggleLeft  size={18} className="text-slate-400" />
              }
            </button>
          </div>
        </div>

        {/* — Navigation List */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 custom-scrollbar">
          {filteredGroups.map(group => (
            <div key={group.label} className="mb-4">
              <p className="section-label">{group.label}</p>
              <div className="space-y-0.5">
                {group.items.map(item => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 transition-all duration-200 group relative ripple
                      ${isActive
                        ? 'bg-indigo-50 dark:bg-indigo-500/12 text-indigo-700 dark:text-indigo-300'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                      }`
                    }
                    style={{ borderRadius: 'var(--md-shape-lg)' }}
                  >
                    {({ isActive }) => (
                      <>
                        {/* Active indicator bar */}
                        {isActive && (
                          <span
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-r-full"
                          />
                        )}
                        <span className={`shrink-0 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
                          <item.icon
                            size={20}
                            strokeWidth={isActive ? 2.5 : 1.8}
                          />
                        </span>
                        <span className={`flex-1 text-[13px] font-semibold tracking-tight ${isActive ? 'font-bold' : ''}`}>
                          {item.label}
                        </span>
                        {isActive && (
                          <ChevronRight size={14} className="opacity-40 shrink-0" />
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* — Footer Actions */}
        <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800/60 space-y-1">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all ripple"
          >
            <div className="flex items-center gap-3">
              {theme === 'dark'
                ? <Moon size={18} className="text-indigo-400" />
                : <Sun  size={18} className="text-amber-500" />
              }
              <span className="text-[13px] font-semibold">
                Tema {theme === 'dark' ? 'Oscuro' : 'Claro'}
              </span>
            </div>
            {/* MD3 Switch */}
            <div className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-300 ${theme === 'dark' ? 'bg-indigo-500' : 'bg-slate-200'}`}>
              <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 transform ${theme === 'dark' ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
          </button>
        </div>

        {/* — Version Footer */}
        <div className="px-6 py-4 text-center">
          <p className="text-[10px] text-slate-300 dark:text-slate-700 font-semibold uppercase tracking-[0.3em]">
            RED ENNIER · v3.1
          </p>
        </div>
      </div>

      {/* ——— Password Modal ——— */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-md"
            onClick={() => setShowPasswordModal(false)}
          />
          <div
            className="relative w-full max-w-sm bg-white dark:bg-[#1E293B] rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 p-8"
          >
            {/* Gradient top line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-logo-gradient" />

            <button
              onClick={() => setShowPasswordModal(false)}
              className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="text-center mb-7 mt-2">
              <div className="mx-auto w-16 h-16 bg-logo-gradient rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-indigo-500/30">
                <Lock size={30} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Acceso de Admin
              </h3>
              <p className="text-[11px] text-indigo-500 font-semibold uppercase tracking-widest mt-1">
                Ingresa la contraseña de mando
              </p>
            </div>

            <div className="space-y-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center text-slate-300 dark:text-slate-600 pointer-events-none">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  className={`w-full pl-11 pr-4 py-4 rounded-2xl text-sm font-semibold outline-none transition-all
                    bg-slate-50 dark:bg-slate-800 border-2 tracking-[0.25em]
                    ${pwError
                      ? 'border-red-400 dark:border-red-500'
                      : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500'
                    }
                    text-slate-800 dark:text-white`}
                  placeholder="••••••••••••"
                  value={pwInput}
                  onChange={e => { setPwInput(e.target.value); setPwError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handlePasswordSubmit()}
                  autoFocus
                />
              </div>

              {pwError && (
                <p className="text-[11px] text-red-500 font-semibold pl-2 animate-pulse">{pwError}</p>
              )}

              <button
                onClick={handlePasswordSubmit}
                className="w-full py-4 btn-gradient text-sm font-bold uppercase tracking-widest mt-2"
              >
                <Lock size={16} />
                <span>Desbloquear</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
