import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TopHeader from './components/Navbar';
import Clientes from './pages/Clientes';
import Tecnicos from './pages/Tecnicos';
import Tareas from './pages/Tareas';
import Historial from './pages/Historial';
import HistorialAdmin from './pages/HistorialAdmin';
import Servicios from './pages/Servicios';
import { AppProvider } from './context/AppContext';

import Dashboard from './pages/Dashboard';
import Gastos from './pages/Gastos';
import BottomNav from './components/BottomNav';
import SplashScreen from './components/SplashScreen';

function App() {
  const [showSplash, setShowSplash] = React.useState(true);

  return (
    <AppProvider>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="flex bg-[#FDFDFD] min-h-screen font-jakarta text-[#1e293b]">
          <TopHeader /> 
          
          <main className="flex-1 lg:ml-64 p-4 lg:p-10 w-full max-w-[100vw] overflow-x-hidden pt-24 lg:pt-10 transition-all duration-300">
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
              </Routes>
            </div>
            
            {/* Espaciador para no tapar contenido con el BottomNav en móvil */}
            <div className="h-24 lg:hidden"></div>
          </main>

          <BottomNav />
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;