import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { App as CapApp } from '@capacitor/app';
import BluetoothPrinter from './utils/BluetoothPrinter';
import TopHeader from './components/Navbar';
import Clientes from './pages/Clientes';
import Tecnicos from './pages/Tecnicos';
import Tareas from './pages/Tareas';
import Historial from './pages/Historial';
import HistorialAdmin from './pages/HistorialAdmin';
import Servicios from './pages/Servicios';
import { AppContext, AppProvider } from './context/AppContext';

import Dashboard from './pages/Dashboard';
import Gastos from './pages/Gastos';
import Ingresos from './pages/Ingresos';
import Parametros from './pages/Parametros';
import BottomNav from './components/BottomNav';
import SplashScreen from './components/SplashScreen';

const AppContent = () => {
  const { theme, isOnline } = React.useContext(AppContext);
  const [showSplash, setShowSplash] = React.useState(true);

  useEffect(() => {
    // Bluetooth connection cleanup on app exit/background
    const handleAppStateChange = async ({ isActive }) => {
      if (!isActive) {
        console.log("App inactive - Disconnecting Bluetooth...");
        await BluetoothPrinter.disconnect();
      }
    };

    let handler;
    CapApp.addListener('appStateChange', handleAppStateChange).then(h => {
      handler = h;
    });
    
    return () => {
      if (handler) handler.remove();
    };
  }, []);

  if (!isOnline) {
    return (
      <div className="fixed inset-0 z-[1000] bg-slate-950 flex flex-col items-center justify-center p-8 text-center text-white">
        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 animate-pulse"><path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/></svg>
        </div>
        <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-2">Conexión Requerida</h2>
        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest max-w-xs">Esta aplicación requiere acceso a Internet para sincronizar tasas y operaciones en tiempo real.</p>
        <div className="mt-8 flex items-center gap-2 text-[10px] font-black text-red-500 uppercase tracking-[0.3em] animate-bounce">
          Reintentando Conexión...
        </div>
      </div>
    );
  }

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="flex bg-[#FDFDFD] dark:bg-slate-950 min-h-screen font-jakarta text-[#1e293b] dark:text-slate-100 transition-colors duration-500">
          <TopHeader /> 
          <main className="flex-1 lg:ml-64 p-3 lg:p-8 w-full max-w-[100vw] overflow-x-hidden pt-16 lg:pt-8 transition-all duration-300">
            <div className="max-w-7xl mx-auto w-full">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/users" element={<Clientes />} />
                <Route path="/technicians" element={<Tecnicos />} />
                <Route path="/tasks" element={<Tareas />} />
                <Route path="/historial" element={<HistorialAdmin />} />
                <Route path="/mis-tareas" element={<Historial />} />
                <Route path="/services" element={<Servicios />} />
                <Route path="/gastos" element={<Gastos />} />
                <Route path="/ingresos" element={<Ingresos />} />
                <Route path="/parametros" element={<Parametros />} />
              </Routes>
            </div>
            
            <div className="h-24 lg:hidden"></div>
          </main>

          {!showSplash && <BottomNav />}
        </div>
      </Router>
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;