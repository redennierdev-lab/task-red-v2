import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AppContext = createContext();

const API_BASE_URL = 'http://localhost:5000/api';

export const AppProvider = ({ children }) => {
  const [clientes, setClientes] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [tareas, setTareas] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchClientes = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/customers`);
      setClientes(data);
    } catch (error) {
      console.error('Error fetching clientes:', error);
    }
  };

  const fetchTecnicos = async () => {
    try {
      // Mocked if GET not available, but let's try the real endpoint
      const { data } = await axios.get(`${API_BASE_URL}/technicians`);
      setTecnicos(data);
    } catch (error) {
      console.error('Error fetching tecnicos:', error);
      // Fallback
      setTecnicos([{ id: 1, nombre: 'Técnico Prueba', status: 'Activo' }]);
    }
  };

  const fetchTareas = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/tasks`);
      setTareas(data);
    } catch (error) {
      console.error('Error fetching tareas:', error);
      setTareas([{ id: 1, titulo: 'Tarea Prueba', descripcion: 'Desc', estado: 'Pendiente' }]);
    }
  };

  const fetchServicios = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/services`);
      setServicios(data);
    } catch (error) {
      console.error('Error fetching servicios:', error);
      setServicios([{ id: 1, nombre: 'Servicio Prueba', precio: 100 }]);
    }
  };

  const refreshAll = async () => {
    setLoading(true);
    await Promise.all([fetchClientes(), fetchTecnicos(), fetchTareas(), fetchServicios()]);
    setLoading(false);
  };

  useEffect(() => {
    refreshAll();
  }, []);

  return (
    <AppContext.Provider value={{
      clientes, tecnicos, tareas, servicios, loading,
      refreshAll,
      fetchClientes, fetchTecnicos, fetchTareas, fetchServicios
    }}>
      {children}
    </AppContext.Provider>
  );
};
