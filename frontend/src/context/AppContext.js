import React, { createContext, useState, useEffect, useCallback } from 'react';
import { db, logAction } from '../services/database';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [clientes, setClientes] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [tareas, setTareas] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [userRole, setUserRole] = useState('Admin');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

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
    const tableMap = {
        'customers': 'customers',
        'technicians': 'technicians',
        'tasks': 'tasks',
        'services': 'services',
        'expenses': 'expenses',
        'incomes': 'incomes'
    };
    const table = tableMap[endpoint];
    try {
      // CAPTURE FOR HISTORY
      const recordToDelete = await db[table].get(id);
      
      if (endpoint === 'customers') {
          await db.client_equipments.where('cliente_id').equals(id).delete();
      }
      await db[table].delete(id);
      
      // RECORD TO HISTORY
      if (recordToDelete) {
          pushHistory({
              type: 'DELETE',
              table: table,
              id: id,
              prev: recordToDelete,
              endpoint: endpoint
          });
      }

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
        'services': 'services',
        'expenses': 'expenses',
        'incomes': 'incomes'
    };
    const table = tableMap[endpoint];
    try {
      // CAPTURE FOR HISTORY
      const recordBefore = await db[table].get(id);
      
      await db[table].update(id, data);
      
      // RECORD TO HISTORY
      pushHistory({
          type: 'UPDATE',
          table: table,
          id: id,
          prev: recordBefore,
          payload: data,
          endpoint: endpoint
      });

      logAction('Admin', 'EDICIÓN', endpoint, id, `Actualizado en LocalDB`);
      await refreshAll();
      return true;
    } catch (error) {
      console.error(`Error updating LocalDB:`, error);
      return false;
    }
  };

  const pushHistory = (action) => {
    setHistory(prev => {
        const newHistory = prev.slice(0, historyIndex + 1);
        newHistory.push(action);
        // Limit to 5
        if (newHistory.length > 5) {
            newHistory.shift();
        }
        return newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, 4));
  };

  const addRecord = async (endpoint, data) => {
    const tableMap = {
        'customers': 'customers',
        'technicians': 'technicians',
        'tasks': 'tasks',
        'services': 'services',
        'expenses': 'expenses',
        'incomes': 'incomes'
    };
    const table = tableMap[endpoint];
    try {
      const id = await db[table].add(data);
      
      // RECORD TO HISTORY
      pushHistory({
          type: 'CREATE',
          table: table,
          id: id,
          payload: data,
          endpoint: endpoint
      });

      logAction('Admin', 'CREACIÓN', endpoint, id, `Nuevo registro en LocalDB`);
      await refreshAll();
      return id;
    } catch (error) {
      console.error(`Error adding to LocalDB:`, error);
      return false;
    }
  };

  const undo = async () => {
    if (historyIndex < 0) return;
    const action = history[historyIndex];
    try {
        if (action.type === 'UPDATE') {
            await db[action.table].put(action.prev);
        } else if (action.type === 'DELETE') {
            await db[action.table].add(action.prev);
        } else if (action.type === 'CREATE') {
            await db[action.table].delete(action.id);
        }
        setHistoryIndex(prev => prev - 1);
        await refreshAll();
    } catch (err) {
        console.error("Undo failed:", err);
    }
  };

  const redo = async () => {
    if (historyIndex >= history.length - 1) return;
    const action = history[historyIndex + 1];
    try {
        if (action.type === 'UPDATE') {
            await db[action.table].update(action.id, action.payload);
        } else if (action.type === 'DELETE') {
            await db[action.table].delete(action.id);
        } else if (action.type === 'CREATE') {
            await db[action.table].add(action.payload);
        }
        setHistoryIndex(prev => prev + 1);
        await refreshAll();
    } catch (err) {
        console.error("Redo failed:", err);
    }
  };

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const init = async () => {
        try {
            const serviceCount = await db.services.count();
            if (serviceCount === 0) {
                await db.services.bulkAdd([
                    { nombre: 'Soporte Internet Residencial', descripcion: 'Configuración de router y cableado', precio: 25 },
                    { nombre: 'Instalación Antena 5G', descripcion: 'Montaje y alineación', precio: 120 },
                    { nombre: 'Mantenimiento Cámaras', descripcion: 'Limpieza y ajuste de visión', precio: 40 },
                    { nombre: 'Reparación Hardware PC', descripcion: 'Diagnóstico y cambio piezas', precio: 30 }
                ]);
            }
            const techCount = await db.technicians.count();
            if (techCount === 0) {
                await db.technicians.bulkAdd([
                    { nombre: 'Red Ennier Admin', especialidad: 'Administración Global', telefono: '000-RED-ENNIER', status: 'Activo' },
                    { nombre: 'Técnico Campo 01', especialidad: 'Fibra & Antenas', telefono: 'N/A', status: 'Activo' }
                ]);
            }
            await refreshAll();
        } catch (error) {
            console.error("Error en inicialización:", error);
        }
    };
    init();
  }, [refreshAll]);

  return (
    <AppContext.Provider value={{
      clientes, tecnicos, tareas, servicios, loading,
      userRole, setUserRole,
      theme, toggleTheme,
      isOnline, isSidebarOpen, setIsSidebarOpen,
      refreshAll, deleteRecord, updateRecord, addRecord,
      undo, redo, canUndo: historyIndex >= 0, canRedo: historyIndex < history.length - 1,
      fetchClientes, fetchTecnicos, fetchTareas, fetchServicios
    }}>
      {children}
    </AppContext.Provider>
  );
};
