import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Users, Wrench, FileText, LayoutList, Menu, X } from 'lucide-react';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { path: '/', name: 'Inicio', icon: <LayoutList size={20} /> },
    { path: '/tasks', name: 'Tareas', icon: <FileText size={20} /> },
    { path: '/users', name: 'Clientes', icon: <Users size={20} /> },
    { path: '/technicians', name: 'Técnicos', icon: <Wrench size={20} /> },
    { path: '/services', name: 'Servicios', icon: <FileText size={20} /> },
  ];

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-primary text-white rounded-md shadow-md"
      >
        <Menu size={24} />
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 bg-primary text-white w-64 flex flex-col z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} border-r border-secondary/50 shadow-xl`}>
        <div className="h-16 flex items-center justify-between px-6 bg-secondary/30">
          <h1 className="text-xl font-bold tracking-wider">RED ENNIER</h1>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-gray-300 hover:text-white">
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => 
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive 
                  ? 'bg-secondary text-white shadow-md' 
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-secondary/50 text-xs text-gray-400 text-center">
          &copy; 2026 Red Ennier C.A.
        </div>
      </aside>
    </>
  );
};

export default Sidebar;