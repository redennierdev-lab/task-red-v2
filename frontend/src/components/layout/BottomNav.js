import React, { useContext } from 'react';
import { Menu } from 'lucide-react';
import { AppContext } from '../../context/AppContext';

const BottomNav = () => {
  const { setIsSidebarOpen } = useContext(AppContext);

  return (
    <button
      onClick={() => setIsSidebarOpen(true)}
      className="lg:hidden fixed bottom-6 right-6 z-[200] w-14 h-14 flex items-center justify-center rounded-2xl
        bg-white dark:bg-slate-900
        border border-slate-100 dark:border-slate-800
        text-orange-600 dark:text-orange-400
        shadow-lg shadow-orange-500/10
        active:scale-90 transition-all duration-200"
      aria-label="Abrir menú"
      id="bottom-nav-menu-btn"
    >
      <Menu size={24} strokeWidth={2} aria-hidden="true" />
    </button>
  );
};

export default BottomNav;
