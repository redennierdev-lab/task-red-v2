import React, { useState, useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { Users, Wrench, FileText, LayoutList, Menu, X, Rocket, History, ToggleLeft, ToggleRight, Lock, DollarSign, Sun, Moon } from 'lucide-react';
import { AppContext } from '../context/AppContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { userRole, setUserRole, theme, toggleTheme } = useContext(AppContext);

  const menuItems = [
    { path: '/', name: 'Panel Inicio', icon: <LayoutList size={22} />, roles: ['Admin', 'Técnico'] },
    { path: '/tasks', name: 'Gestión Tareas', icon: <FileText size={22} />, roles: ['Admin'] },
    { path: '/gastos', name: 'Gestión Gastos', icon: <DollarSign size={22} />, roles: ['Admin'] },
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
      <div className="lg:hidden fixed top-0 left-0 right-0 h-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl z-40 flex items-center justify-between px-8 border-b-2 border-orange-50 dark:border-slate-800 shadow-sm transition-colors duration-500">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-logo-gradient rounded-xl p-1.5 shadow-lg">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain brightness-0 invert" />
            </div>
            <span className="text-base font-black tracking-tighter text-slate-800 dark:text-white uppercase italic">RED ENNIER</span>
         </div>
         <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="p-3 bg-orange-50 dark:bg-slate-800 text-orange-600 dark:text-fuchsia-400 rounded-2xl active:scale-90 transition-all">
                {theme === 'light' ? <Moon size={22} /> : <Sun size={22} />}
            </button>
            <button onClick={() => setIsOpen(true)} className="p-3 bg-orange-50 dark:bg-slate-800 text-orange-600 dark:text-fuchsia-400 rounded-2xl active:scale-90 transition-all">
                <Menu size={26} />
            </button>
         </div>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-orange-900/20 dark:bg-black/60 backdrop-blur-md z-[55] lg:hidden animate-in fade-in duration-500"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar - Desktop & Mobile */}
      <aside className={`fixed inset-y-0 left-0 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 w-64 flex flex-col z-[60] transform transition-all duration-500 ease-in-out border-r-2 border-orange-50 dark:border-slate-800 shadow-2xl
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        
        {/* Logo Area Refined */}
        <div className="p-6 flex flex-col items-center justify-center relative overflow-hidden bg-orange-50/50 dark:bg-slate-950/20">
          <div className="absolute top-0 left-0 w-full h-1 bg-logo-gradient"></div>
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden absolute top-4 right-4 p-2 text-slate-300 dark:text-slate-600 hover:text-orange-500 bg-white dark:bg-slate-800 rounded-full shadow-sm transition-all"
          >
            <X size={18} />
          </button>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl p-2.5 shadow-xl mb-4 relative group border border-orange-100 dark:border-slate-700 transform -rotate-2 hover:rotate-0 transition-transform">
              <img src="/logo.png" alt="RED ENNIER Logo" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-base font-black uppercase tracking-tighter text-slate-900 dark:text-white italic">RED ENNIER</h2>
            <div className="flex items-center gap-3 mt-1">
                <p className="text-[9px] text-orange-500/70 dark:text-fuchsia-400/70 font-black tracking-[0.2em] uppercase">Task Manager v3</p>
                <button onClick={toggleTheme} className="p-1.5 bg-orange-50 dark:bg-slate-800 text-orange-600 dark:text-fuchsia-400 rounded-lg hover:scale-110 transition-all">
                    {theme === 'light' ? <Moon size={12} /> : <Sun size={12} />}
                </button>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-5 py-6 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => 
                `flex items-center space-x-4 px-5 py-4 rounded-3xl transition-all duration-300 group relative overflow-hidden
                ${isActive 
                  ? 'bg-logo-gradient text-white shadow-xl shadow-orange-500/20 scale-105' 
                  : 'text-slate-400 hover:bg-orange-50 dark:hover:bg-slate-800 hover:text-orange-600 dark:hover:text-fuchsia-400'}`
              }
            >
              <div className="relative z-10 transition-transform duration-500 group-hover:scale-125 group-hover:rotate-12">
                {item.icon}
              </div>
              <span className="relative z-10 font-black text-[11px] uppercase tracking-widest italic">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Profile Info Footer */}
        <div className="p-6 mt-auto space-y-4 bg-orange-50/20 dark:bg-slate-950/20">
          <button onClick={toggleRole} className={`w-full flex items-center justify-center gap-3 p-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-sm transform active:scale-95 ${userRole === 'Admin' ? 'bg-orange-500 text-white shadow-orange-500/20' : 'bg-fuchsia-500 text-white shadow-fuchsia-500/20'}`}>
            {userRole === 'Admin' ? <ToggleRight size={18}/> : <ToggleLeft size={18}/>}
            {userRole}
          </button>
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 border-2 border-orange-50 dark:border-slate-700 flex items-center gap-4 shadow-xl">
             <div className="w-10 h-10 rounded-xl bg-logo-gradient flex items-center justify-center text-xs font-black text-white shadow-lg rotate-3 group-hover:rotate-0 transition-transform">
                {userRole === 'Admin' ? 'AD' : 'TE'}
             </div>
             <div>
                <p className="text-sm font-black uppercase tracking-tighter text-slate-800 dark:text-white italic">{userRole === 'Admin' ? 'Ennier' : 'Instalador'}</p>
                <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest">En Línea</p>
                </div>
             </div>
          </div>
        </div>
      </aside>

      {/* Modal Contraseña Premium (VIBRANTE) */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/80 backdrop-blur-2xl transition-all duration-500" onClick={() => setIsPasswordModalOpen(false)}></div>
            <div className="bg-white dark:bg-slate-900 border-2 border-orange-100 dark:border-slate-800 w-full max-w-sm rounded-[3rem] shadow-[0_40px_100px_rgba(249,115,22,0.15)] dark:shadow-none relative overflow-hidden flex flex-col transform transition-all animate-in fade-in zoom-in-95 duration-500">
                <div className="absolute top-0 right-0 w-80 h-80 bg-logo-gradient opacity-5 blur-[100px] rounded-full -mr-20 -mt-20 pointer-events-none"></div>
                <div className="p-10 relative z-10">
                    <button onClick={() => setIsPasswordModalOpen(false)} className="absolute top-8 right-8 p-2.5 text-slate-300 dark:text-slate-600 hover:text-orange-500 bg-orange-50 dark:bg-slate-800 hover:bg-orange-100 dark:hover:bg-slate-700 rounded-full transition-all">
                        <X size={20} />
                    </button>
                    
                    <div className="text-center mb-10 mt-4">
                        <div className="mx-auto w-24 h-24 bg-logo-gradient rounded-[2.5rem] flex items-center justify-center mb-6 shadow-2xl text-white transform hover:scale-110 hover:-rotate-6 transition-all duration-500">
                           <Lock size={42} strokeWidth={3} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter italic">Acceso de Mando</h3>
                        <p className="text-[10px] font-black tracking-[0.2em] text-orange-500 dark:text-fuchsia-400 uppercase mt-2 italic">Seguridad Biométrica Red Ennier</p>
                    </div>
                    
                    <div className="space-y-5">
                       <div className="space-y-2">
                         <div className="relative group">
                           <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-300 dark:text-slate-600 group-focus-within:text-orange-500 dark:group-focus-within:text-fuchsia-500 transition-colors">
                              <Lock size={18} />
                           </div>
                           <input 
                             type="password" 
                             className={`w-full pl-14 pr-6 py-5 bg-orange-50/50 dark:bg-slate-950/50 border-2 ${passwordError ? 'border-red-400 focus:border-red-500' : 'border-orange-50 dark:border-slate-800 focus:border-orange-500 dark:focus:border-fuchsia-500'} rounded-3xl outline-none focus:bg-white dark:focus:bg-slate-900 transition-all font-black text-slate-800 dark:text-slate-200 shadow-inner tracking-widest text-lg italic uppercase`} 
                             placeholder="••••••••" 
                             value={passwordInput} 
                             onChange={e => { setPasswordInput(e.target.value); setPasswordError(''); }}
                             onKeyDown={e => { if (e.key === 'Enter') handlePasswordSubmit(); }}
                             autoFocus
                           />
                         </div>
                         <div className="h-4">
                            {passwordError && <p className="text-[10px] text-red-500 font-black ml-3 uppercase tracking-widest animate-pulse italic">{passwordError}</p>}
                         </div>
                       </div>
                       
                       <button onClick={handlePasswordSubmit} className="w-full py-5 text-sm font-black uppercase tracking-widest flex items-center justify-center gap-3 bg-logo-gradient text-white rounded-3xl hover:shadow-[0_20px_40px_rgba(249,115,22,0.3)] transition-all hover:-translate-y-2 mt-4 active:scale-95 shadow-xl italic">
                         <span>Desbloquear</span>
                         <Rocket size={18} className="animate-bounce" />
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