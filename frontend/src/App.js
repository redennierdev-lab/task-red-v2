import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { App as CapApp } from '@capacitor/app';
import BluetoothPrinter from './features/printer/services/BluetoothPrinter';
import Navbar    from './components/layout/Navbar';
import BottomNav from './components/layout/BottomNav';
import Sidebar   from './components/layout/Sidebar';

import Clientes      from './pages/Clientes';
import Tecnicos      from './pages/Tecnicos';
import Tareas        from './pages/Tareas';
import Historial     from './pages/Historial';
import HistorialAdmin from './pages/HistorialAdmin';
import Servicios     from './pages/Servicios';
import Dashboard     from './pages/Dashboard';
import Gastos        from './pages/Gastos';
import Ingresos      from './pages/Ingresos';
import Parametros    from './pages/Parametros';

import { AppProvider, AppContext } from './context/AppContext';

/* ─── Offline Screen ─── */
const OfflineScreen = () => (
  <div className="fixed inset-0 z-[1000] bg-[#141211] flex flex-col items-center justify-center p-8 text-center">
    <div
      className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 border border-red-500/20 bg-red-500/8"
      style={{ boxShadow: '0 0 40px rgba(239,68,68,0.15)' }}
    >
      {/* Spinner icon */}
      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className="text-red-500 animate-pulse">
        <path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/>
        <path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/>
        <path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/>
        <path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/>
      </svg>
    </div>
    <h2 className="text-2xl font-bold text-white tracking-tight mb-2">Conexión Requerida</h2>
    <p className="text-slate-500 text-sm font-medium max-w-xs leading-relaxed">
      Esta aplicación requiere Internet para sincronizar tasas y operar en tiempo real.
    </p>
    <div className="mt-8 flex items-center gap-2 text-xs font-semibold text-red-500 uppercase tracking-widest animate-bounce">
      Reintentando conexión…
    </div>
  </div>
);

/* ─── App Content ─── */
const AppContent = () => {
  const { theme, isOnline } = React.useContext(AppContext);

  useEffect(() => {
    // Bluetooth cleanup on app background
    const handleAppStateChange = async ({ isActive }) => {
      if (!isActive) {
        await BluetoothPrinter.disconnect();
      }
    };
    let handler;
    CapApp.addListener('appStateChange', handleAppStateChange).then(h => { handler = h; });
    return () => { if (handler) handler.remove(); };
  }, []);

  if (!isOnline) return <OfflineScreen />;

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        {/*
          Layout:
          - Desktop: fixed left nav rail (w-72) + scrollable main
          - Mobile:  fixed top bar (h-14) + bottom nav bar (h-20) + scrollable main
        */}
        <div className="flex bg-slate-50 dark:bg-[#141211] min-h-screen font-jakarta text-slate-900 dark:text-slate-100 transition-colors duration-300">

          {/* Desktop Navigation Rail (hidden on mobile) */}
          <Navbar />

          {/* Mobile Sidebar Drawer (overlay, MD3) */}
          <Sidebar />

          {/* ── Main Content Area ── */}
          <main
            className={`
              flex-1 w-full max-w-[100vw] overflow-x-hidden
              /* Mobile: top-bar (56px) + floating button clearance */
              pt-14 pb-8
              /* Desktop: left rail (288px), reset padding */
              lg:pl-72 lg:pt-0 lg:pb-0
              /* Internal padding */
              px-3 py-3
              lg:px-8 lg:py-8
            `}
          >
            <div className="max-w-7xl mx-auto w-full">
              <Routes>
                <Route path="/"             element={<Dashboard />} />
                <Route path="/users"        element={<Clientes />} />
                <Route path="/technicians"  element={<Tecnicos />} />
                <Route path="/tasks"        element={<Tareas />} />
                <Route path="/historial"    element={<HistorialAdmin />} />
                <Route path="/mis-tareas"   element={<Historial />} />
                <Route path="/services"     element={<Servicios />} />
                <Route path="/gastos"       element={<Gastos />} />
                <Route path="/ingresos"     element={<Ingresos />} />
                <Route path="/parametros"   element={<Parametros />} />
              </Routes>
            </div>
          </main>

          {/* MD3 Bottom Navigation Bar (mobile only) */}
          <BottomNav />
        </div>
      </Router>
    </div>
  );
};

/* ─── Root ─── */
function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;