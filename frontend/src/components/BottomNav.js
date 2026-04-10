import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutList, FileText, Users, Wrench, History, DollarSign, TrendingUp, LayoutGrid, Settings2 } from 'lucide-react';
import { AppContext } from '../context/AppContext';

const BottomNav = () => {
  const { userRole } = useContext(AppContext);

  const navItems = [
    { icon: <LayoutList size={20} />, label: 'Inicio', path: '/', roles: ['Admin', 'Técnico'] },
    { icon: <FileText size={20} />, label: 'Tareas', path: '/tasks', roles: ['Admin'] },
    { icon: <TrendingUp size={20} />, label: 'Cash', path: '/ingresos', roles: ['Admin'] },
    { icon: <DollarSign size={20} />, label: 'Gastos', path: '/gastos', roles: ['Admin'] },
    { icon: <History size={20} />, label: 'Log', path: '/historial', roles: ['Admin'] },
    { icon: <History size={20} />, label: 'Tareas', path: '/mis-tareas', roles: ['Técnico'] },
    { icon: <Users size={20} />, label: 'Clientes', path: '/users', roles: ['Admin'] },
    { icon: <Wrench size={20} />, label: 'Staff', path: '/technicians', roles: ['Admin'] },
    { icon: <LayoutGrid size={20} />, label: 'Servicios', path: '/services', roles: ['Admin'] },
    { icon: <Settings2 size={20} />, label: 'Config', path: '/parametros', roles: ['Admin'] },
  ].filter(i => i.roles.includes(userRole));

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[200] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t-2 border-orange-50 dark:border-slate-800 shadow-2xl px-2 py-1 safe-bottom">
      <div className="flex items-center justify-around gap-1 overflow-x-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-2 rounded-2xl transition-all duration-200 min-w-[46px] active:scale-90
              ${isActive
                ? 'text-orange-500 bg-orange-50 dark:bg-orange-500/10'
                : 'text-slate-400 dark:text-slate-500 hover:text-orange-400'}`
            }
          >
            {item.icon}
            <span className="text-[7px] font-black uppercase tracking-wider leading-none">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
