import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const AppContext = createContext();

const API_BASE_URL = 'http://localhost:5000/api';

export const AppProvider = ({ children }) => {
  const [clientes, setClientes] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [tareas, setTareas] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchClientes = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/customers`);
      setClientes(data);
    } catch (error) {
      console.error('Error fetching clientes:', error);
    }
  }, []);

  const fetchTecnicos = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/technicians`);
      setTecnicos(data);
    } catch (error) {
      console.error('Error fetching tecnicos:', error);
    }
  }, []);

  const fetchTareas = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/tasks`);
      setTareas(data);
    } catch (error) {
      console.error('Error fetching tareas:', error);
    }
  }, []);

  const fetchServicios = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/services`);
      setServicios(data);
    } catch (error) {
      console.error('Error fetching servicios:', error);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchClientes(), fetchTecnicos(), fetchTareas(), fetchServicios()]);
    setLoading(false);
  }, [fetchClientes, fetchTecnicos, fetchTareas, fetchServicios]);

  const deleteRecord = async (endpoint, id) => {
    console.log(`🔷 FRONTEND: Intentando eliminar ${endpoint} con ID: ${id}`);
    if (!id) {
      console.error("❌ ERROR: No se proporcionó una ID válida para eliminar.");
      return false;
    }
    try {
      const response = await axios.delete(`${API_BASE_URL}/${endpoint}/${id}`);
      console.log(`✅ FRONTEND: Respuesta de eliminación:`, response.data);
      await refreshAll();
      return true;
    } catch (error) {
      console.error(`❌ FRONTEND Error deleting ${endpoint}:`, error.response?.data || error.message);
      return false;
    }
  };

  const updateRecord = async (endpoint, id, data) => {
    try {
      await axios.put(`${API_BASE_URL}/${endpoint}/${id}`, data);
      await refreshAll();
      return true;
    } catch (error) {
      console.error(`Error updating ${endpoint}:`, error);
      return false;
    }
  };

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  return (
    <AppContext.Provider value={{
      clientes, tecnicos, tareas, servicios, loading,
      refreshAll, deleteRecord, updateRecord,
      fetchClientes, fetchTecnicos, fetchTareas, fetchServicios
    }}>
      {children}
    </AppContext.Provider>
  );
};
