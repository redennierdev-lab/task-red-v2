import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutList, FileText, Users, Wrench, Rocket } from 'lucide-react';

const BottomNav = () => {
  const navItems = [
    { icon: <LayoutList size={18} />, label: 'Inicio', path: '/' },
    { icon: <FileText size={18} />, label: 'Tareas', path: '/tasks' },
    { icon: <Users size={18} />, label: 'Clientes', path: '/users' },
    { icon: <Wrench size={18} />, label: 'Staff', path: '/technicians' },
    { icon: <Rocket size={18} />, label: 'Catálogo', path: '/services' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-6 left-6 right-6 z-50">
      <div className="glass-effect rounded-[2rem] p-2 flex items-center justify-around shadow-2xl border border-white/50 bg-white/80 backdrop-blur-lg">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-11 h-11 rounded-[1.4rem] transition-all duration-500 relative group
              ${isActive 
                ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30' 
                : 'text-slate-400 hover:text-orange-500'}`
            }
          >
            <div className="relative z-10">
              {item.icon}
            </div>
            
            <span className="text-[7px] font-black uppercase tracking-tighter mt-0.5 hidden group-[.active]:block transition-all opacity-80">
                {item.label}
            </span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
