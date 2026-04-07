import React, { createContext, useState, useEffect, useCallback } from 'react';
import { db, logAction } from '../db/db';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [clientes, setClientes] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [tareas, setTareas] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState('Admin'); // 'Admin' | 'Técnico'
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const fetchClientes = useCallback(async () => {
    try {
      const all = await db.customers.toArray();
      // Unir con fichas tecnicas
      const enriched = await Promise.all(all.map(async (c) => {
          const eq = await db.client_equipments.where('cliente_id').equals(c.id).first();
          return { ...c, ...eq };
      }));
      setClientes(enriched);
    } catch (error) {
      console.error('Error fetching clientes de LocalDB:', error);
    }
  }, []);

  const fetchTecnicos = useCallback(async () => {
    try {
      const data = await db.technicians.toArray();
      setTecnicos(data);
    } catch (error) {
      console.error('Error fetching tecnicos de LocalDB:', error);
    }
  }, []);

  const fetchTareas = useCallback(async () => {
    try {
      const data = await db.tasks.toArray();
      setTareas(data);
    } catch (error) {
      console.error('Error fetching tareas de LocalDB:', error);
    }
  }, []);

  const fetchServicios = useCallback(async () => {
    try {
      const data = await db.services.toArray();
      setServicios(data);
    } catch (error) {
      console.error('Error fetching servicios de LocalDB:', error);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchClientes(), fetchTecnicos(), fetchTareas(), fetchServicios()]);
    setLoading(false);
  }, [fetchClientes, fetchTecnicos, fetchTareas, fetchServicios]);

  const deleteRecord = async (endpoint, id) => {
    if (!id) return false;
    
    // Map endpoints to table names
    const tableMap = {
        'customers': 'customers',
        'technicians': 'technicians',
        'tasks': 'tasks',
        'services': 'services'
    };
    const table = tableMap[endpoint];

    try {
      if (endpoint === 'customers') {
          await db.client_equipments.where('cliente_id').equals(id).delete();
      }
      await db[table].delete(id);
      
      logAction('Admin', 'ELIMINACIÓN', endpoint, id, `Registro eliminado de LocalDB`);
      await refreshAll();
      return true;
    } catch (error) {
      console.error(`Error deleting from LocalDB:`, error);
      return false;
    }
  };

  const updateRecord = async (endpoint, id, data) => {
    const tableMap = {
        'customers': 'customers',
        'technicians': 'technicians',
        'tasks': 'tasks',
        'services': 'services'
    };
    const table = tableMap[endpoint];
    try {
      await db[table].update(id, data);
      logAction('Admin', 'EDICIÓN', endpoint, id, `Actualizado en LocalDB`);
      await refreshAll();
      return true;
    } catch (error) {
      console.error(`Error updating LocalDB:`, error);
      return false;
    }
  };

  useEffect(() => {
    // Inicializar DB con datos de ejemplo si esta vacia (Opcional)
    const init = async () => {
        const count = await db.services.count();
        if (count === 0) {
            await db.services.bulkAdd([
                { nombre: 'Instalación Premium', descripcion: 'Configuración 5G', precio: 150 },
                { nombre: 'Mantenimiento Preventivo', descripcion: 'Limpieza de antena', precio: 45 }
            ]);
        }
        refreshAll();
    };
    init();
  }, [refreshAll]);

  return (
    <AppContext.Provider value={{
      clientes, tecnicos, tareas, servicios, loading,
      userRole, setUserRole,
      theme, toggleTheme,
      refreshAll, deleteRecord, updateRecord,
      fetchClientes, fetchTecnicos, fetchTareas, fetchServicios
    }}>
      {children}
    </AppContext.Provider>
  );
};
