import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, Users, HardHat, Settings, LogOut } from 'lucide-react';
import logo from './LOGO.png'; 

const Navbar = () => {
  const location = useLocation(); // Para saber dónde estamos posicionados

  const menuItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Tareas', path: '/tasks', icon: ClipboardList },
    { label: 'Clientes', path: '/users', icon: Users },
    { label: 'Técnicos', path: '/technicians', icon: HardHat },
    { label: 'Servicios', path: '/services', icon: Settings },
  ];

  return (
    <nav className="bg-ennier-blue text-white w-64 h-screen fixed left-0 top-0 p-4 flex flex-col shadow-2xl border-r border-white/10">
      
      {/* Header con Logo */}
      <div className="mb-8 px-2 pt-4 flex flex-col items-center">
        <img src={logo} alt="Red Ennier" className="w-44 h-auto mb-4" />
        <p className="text-[10px] text-ennier-silver uppercase tracking-[0.3em] font-bold">
          Task Management
        </p>
      </div>

      {/* Menú con botones redondeados y efectos */}
      <ul className="space-y-3 flex-1">
        {menuItems.map((item, index) => {
          const IconComponent = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <li key={index}>
              <Link
                to={item.path}
                className={`
                  flex items-center gap-3 p-3 rounded-xl transition-all duration-300 group
                  ${isActive 
                    ? 'bg-white text-ennier-blue shadow-lg scale-105 font-bold' 
                    : 'hover:bg-white/10 hover:shadow-glow hover:-translate-y-0.5 text-ennier-silver hover:text-white'}
                `}
              >
                <IconComponent size={22} className={isActive ? 'text-ennier-blue' : 'text-ennier-silver group-hover:text-white'} />
                <span className="text-sm">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Botón Salir */}
      <div className="border-t border-white/10 pt-4">
        <button className="flex items-center gap-3 p-3 w-full rounded-xl hover:bg-red-500 hover:text-white text-ennier-silver transition-all duration-300 font-bold text-sm">
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;