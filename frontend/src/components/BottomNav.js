import React, { useContext, useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutList, FileText, Users, Wrench, History, DollarSign, TrendingUp, Menu, X, LayoutGrid } from 'lucide-react';
import { AppContext } from '../context/AppContext';

const BottomNav = () => {
  const { userRole } = useContext(AppContext);
  const [isExpanded, setIsExpanded] = useState(false);

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
  ].filter(i => i.roles.includes(userRole));

  return (
    <nav className={`lg:hidden fixed bottom-6 z-[1000] flex flex-col items-center gap-3 transition-all duration-500 ease-in-out ${isExpanded ? 'left-6' : '-left-10 hover:left-2'}`}>
      {/* Expanded Menu Items */}
      <div className={`flex flex-col items-center gap-3 transition-all duration-500 origin-bottom ${isExpanded ? 'scale-100 opacity-100 mb-2' : 'scale-0 opacity-0 h-0 pointer-events-none'}`}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setIsExpanded(false)}
            className={({ isActive }) =>
              `w-14 h-14 rounded-full flex items-center justify-center shadow-2xl backdrop-blur-xl border transition-all duration-300 transform active:scale-90
              ${isActive 
                ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white border-orange-400/50 shadow-orange-500/40 ring-4 ring-orange-500/10' 
                : 'bg-white/90 dark:bg-slate-900/90 text-slate-500 dark:text-slate-400 border-white/20 dark:border-slate-800'}`
            }
          >
            {item.icon}
          </NavLink>
        ))}
      </div>

      {/* Main Toggle Button (The "Ball") */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(249,115,22,0.4)] transition-all duration-500 transform active:scale-95 z-10
          ${isExpanded 
            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 rotate-0' 
            : 'bg-gradient-to-br from-orange-500 to-orange-600 text-white'}`}
      >
        {isExpanded ? <X size={28} /> : <Menu size={28} />}
        
        {/* Decorative Ring */}
        {!isExpanded && (
          <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-ping pointer-events-none"></div>
        )}
      </button>

      {/* Backdrop for closing when expanded */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/5 dark:bg-black/20 backdrop-blur-[2px] z-[-1]" 
          onClick={() => setIsExpanded(false)}
        />
      )}
    </nav>
  );
};

export default BottomNav;
