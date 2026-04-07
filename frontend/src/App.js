import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Clientes from './pages/Clientes';
import Tecnicos from './pages/Tecnicos';
import Tareas from './pages/Tareas';
import Servicios from './pages/Servicios';
import { AppProvider } from './context/AppContext';

function App() {
  return (
    <AppProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="flex bg-light min-h-screen font-sans text-gray-800">
          <Navbar /> 
          <main className="flex-1 lg:ml-64 p-4 lg:p-8 w-full max-w-[100vw] overflow-x-hidden pt-16 lg:pt-8 transition-all duration-300">
            <div className="max-w-6xl mx-auto">
              <Routes>
                <Route path="/" element={<div className="bg-white rounded-2xl shadow-sm p-10 border border-gray-100 flex flex-col items-center justify-center text-center py-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h1 className="text-4xl font-bold text-primary mb-4">Bienvenido al Sistema</h1>
                  <p className="text-gray-500 text-lg">RED ENNIER C.A. Task Management</p>
                </div>} />
                <Route path="/users" element={<Clientes />} />
                <Route path="/technicians" element={<Tecnicos />} />
                <Route path="/tasks" element={<Tareas />} />
                <Route path="/services" element={<Servicios />} />
              </Routes>
            </div>
          </main>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;