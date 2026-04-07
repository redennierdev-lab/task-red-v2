import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Users, Wrench, FileText, LayoutList, Menu, X, Rocket } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { path: '/', name: 'Panel Inicio', icon: <LayoutList size={22} /> },
    { path: '/tasks', name: 'Gestión Tareas', icon: <FileText size={22} /> },
    { path: '/users', name: 'Directorio Clientes', icon: <Users size={22} /> },
    { path: '/technicians', name: 'Equipo Técnico', icon: <Wrench size={22} /> },
    { path: '/services', name: 'Catálogo Servicios', icon: <Rocket size={22} /> },
  ];

  return (
    <>
      {/* Top Bar for Mobile */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md z-40 flex items-center justify-between px-6 border-b border-gray-100">
         <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="h-8 object-contain" />
            <span className="text-sm font-black tracking-tight text-slate-800">TASK-RED</span>
         </div>
         <button onClick={() => setIsOpen(true)} className="p-2 text-slate-600">
            <Menu size={24} />
         </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[55] lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar - Desktop & Mobile */}
      <aside className={`fixed inset-y-0 left-0 bg-slate-900 text-white w-64 flex flex-col z-[60] transform transition-all duration-500 ease-in-out border-r border-white/5
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        
        {/* Logo Area */}
        <div className="p-6 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-logo-gradient"></div>
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden absolute top-4 right-4 p-2 text-white/40 hover:text-white"
          >
            <X size={20} />
          </button>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-12 h-12 bg-white rounded-xl p-2 shadow-2xl mb-4 relative group">
              <div className="absolute inset-0 bg-logo-gradient rounded-xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <img src="/logo.png" alt="RED ENNIER Logo" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-white/90">RED ENNIER</h2>
            <p className="text-[10px] text-white/40 font-bold tracking-widest mt-1 uppercase">Task Manager v2</p>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => 
                `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group
                ${isActive 
                  ? 'bg-white/10 text-secondary shadow-lg border border-white/5' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'}`
              }
            >
              <div className="transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                {item.icon}
              </div>
              <span className="font-bold text-[11px] uppercase tracking-widest">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Profile Info Footer */}
        <div className="p-4 mt-auto">
          <div className="bg-white/5 rounded-2xl p-3 border border-white/5 flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-logo-gradient flex items-center justify-center text-[10px] font-black shadow-lg">RE</div>
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest">Ennier Admin</p>
                <p className="text-[9px] text-gray-500 font-bold">Modo Operativo</p>
             </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Navbar;