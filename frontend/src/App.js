import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';

const Page = ({ name }) => (
  <div className="p-10">
    <h1 className="text-2xl font-bold text-ennier-blue">Panel de {name}</h1>
    <div className="mt-4 p-6 bg-white rounded-xl shadow-md border border-gray-200">
      Estás en el módulo de {name.toLowerCase()}.
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <div className="flex bg-ennier-bg min-h-screen">
        <Navbar />
        <main className="flex-1 ml-64 p-4">
          <Routes>
            <Route path="/" element={<Page name="Dashboard" />} />
            <Route path="/tasks" element={<Page name="Tareas" />} />
            <Route path="/users" element={<Page name="Clientes" />} />
            <Route path="/technicians" element={<Page name="Técnicos" />} />
            <Route path="/services" element={<Page name="Servicios" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;