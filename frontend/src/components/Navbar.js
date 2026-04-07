import React, { useState, useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { Users, Wrench, FileText, LayoutList, Menu, X, Rocket, History, ToggleLeft, ToggleRight, Lock } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import Modal from './Modal';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { userRole, setUserRole } = useContext(AppContext);

  const menuItems = [
    { path: '/', name: 'Panel Inicio', icon: <LayoutList size={22} />, roles: ['Admin', 'Técnico'] },
    { path: '/tasks', name: 'Gestión Tareas', icon: <FileText size={22} />, roles: ['Admin'] },
    { path: '/historial', name: 'Historial', icon: <History size={22} />, roles: ['Admin'] },
    { path: '/mis-tareas', name: 'Mis Tareas', icon: <History size={22} />, roles: ['Técnico'] },
    { path: '/users', name: 'Directorio Clientes', icon: <Users size={22} />, roles: ['Admin'] },
    { path: '/technicians', name: 'Equipo Técnico', icon: <Wrench size={22} />, roles: ['Admin'] },
    { path: '/services', name: 'Catálogo Servicios', icon: <Rocket size={22} />, roles: ['Admin'] },
  ].filter(i => i.roles.includes(userRole));

  const toggleRole = () => {
      if (userRole === 'Técnico') {
          setIsPasswordModalOpen(true);
          setPasswordInput('');
          setPasswordError('');
      } else {
          setUserRole('Técnico');
      }
  };

  const handlePasswordSubmit = () => {
      if (passwordInput === 'G89qpjksr**..') {
          setUserRole('Admin');
          setIsPasswordModalOpen(false);
          setPasswordInput('');
      } else {
          setPasswordError('Contraseña incorrecta. Acceso denegado.');
      }
  };

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
            <p className="text-[10px] text-white/40 font-bold tracking-widest mt-1 uppercase">Task Manager v3</p>
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
        <div className="p-4 mt-auto space-y-3">
          <button onClick={toggleRole} className={`w-full flex items-center justify-center gap-2 p-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${userRole === 'Admin' ? 'bg-orange-500/20 text-orange-400' : 'bg-fuchsia-500/20 text-fuchsia-400'}`}>
            {userRole === 'Admin' ? <ToggleRight size={16}/> : <ToggleLeft size={16}/>}
            Cambiar Rol: {userRole}
          </button>
          <div className="bg-white/5 rounded-2xl p-3 border border-white/5 flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-logo-gradient flex items-center justify-center text-[10px] font-black shadow-lg">
                {userRole === 'Admin' ? 'AD' : 'TE'}
             </div>
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest line-clamp-1">{userRole === 'Admin' ? 'Ennier' : 'Instalador'}</p>
                <p className="text-[9px] text-gray-500 font-bold">Modo Operativo</p>
             </div>
          </div>
        </div>
      </aside>

      {/* Modal Contraseña Premium */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl transition-all duration-500" onClick={() => setIsPasswordModalOpen(false)}></div>
            <div className="bg-slate-900 border border-white/10 w-full max-w-sm rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col transform transition-all animate-in fade-in zoom-in-95 duration-300">
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 blur-[80px] rounded-full -mr-10 -mt-10 pointer-events-none"></div>
                <div className="p-8 relative z-10">
                    <button onClick={() => setIsPasswordModalOpen(false)} className="absolute top-6 right-6 p-2 text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all">
                        <X size={18} />
                    </button>
                    
                    <div className="text-center mb-8 mt-2">
                        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-500 rounded-[2rem] flex items-center justify-center mb-6 shadow-[0_10px_30px_rgba(249,115,22,0.3)] text-white transform hover:scale-105 transition-all">
                           <Lock size={36} strokeWidth={2.5} />
                        </div>
                        <h3 className="text-xl font-black text-white uppercase tracking-widest">Protocolo de<br/>Seguridad</h3>
                        <p className="text-xs font-bold tracking-widest text-white/40 uppercase mt-3">Credencial Requerida</p>
                    </div>
                    
                    <div className="space-y-4">
                       <div className="space-y-2">
                         <div className="relative group">
                           <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-white/30 group-focus-within:text-orange-400 transition-colors">
                              <Lock size={16} />
                           </div>
                           <input 
                             type="password" 
                             className={`w-full pl-12 pr-5 py-4 bg-white/5 border ${passwordError ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-orange-500/50'} rounded-2xl outline-none focus:bg-white/10 transition-all font-bold text-white shadow-inner tracking-widest`} 
                             placeholder="••••••••••••" 
                             value={passwordInput} 
                             onChange={e => { setPasswordInput(e.target.value); setPasswordError(''); }}
                             onKeyDown={e => { if (e.key === 'Enter') handlePasswordSubmit(); }}
                             autoFocus
                           />
                         </div>
                         <div className="h-4">
                            {passwordError && <p className="text-[10px] text-red-400 font-bold ml-2 uppercase tracking-wider animate-pulse">{passwordError}</p>}
                         </div>
                       </div>
                       
                       <button onClick={handlePasswordSubmit} className="w-full py-4 text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl hover:shadow-[0_0_25px_rgba(249,115,22,0.4)] transition-all hover:-translate-y-1 mt-2">
                         <span>Verificar</span>
                         <Rocket size={16} />
                       </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </>
  );
};

export default Navbar;