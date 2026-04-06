import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Clientes from './pages/Clientes';

// Componente simple para las otras páginas mientras las creamos
const Placeholder = ({ name }) => (
  <div className="p-10"><h1 className="text-2xl font-bold">{name}</h1></div>
);

function App() {
  return (
    <Router>
      <div className="flex bg-gray-50 min-h-screen">
        {/* Navbar fijo a la izquierda */}
        <Navbar /> 
        
        {/* Contenido principal desplazado a la derecha por el ancho del navbar */}
        <main className="flex-1 ml-64 p-8">
          <Routes>
            <Route path="/" element={<Placeholder name="Dashboard" />} />
            <Route path="/tasks" element={<Placeholder name="Tareas" />} />
            <Route path="/users" element={<Clientes />} /> {/* Clientes en la ruta /users */}
            <Route path="/technicians" element={<Placeholder name="Técnicos" />} />
            <Route path="/services" element={<Placeholder name="Servicios" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;