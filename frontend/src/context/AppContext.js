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
  const [rates, setRates] = useState({ bcv: 0, usdt: 0, lastUpdate: null });

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

  const fetchRates = useCallback(async () => {
    if (!navigator.onLine) {
        setRates(prev => ({ ...prev, offline: true }));
        return;
    }
    try {
        const response = await fetch('https://pydolarvenezuela-api.vercel.app/api/v1/dollar');
        if (!response.ok) throw new Error('API response not ok');
        const data = await response.json();
        const bcv = data?.monitors?.bcv?.price || 0;
        const usdt = data?.monitors?.binance?.price || data?.monitors?.enparalelovzla?.price || 0;

        if (bcv > 0 || usdt > 0) {
            setRates({ bcv, usdt, lastUpdate: new Date(), offline: false });
        }
    } catch (error) {
        console.error('Error obteniendo tasas:', error);
        // Fallback robusto
        setRates(prev => ({ ...prev, offline: true }));
    }
  }, []);

  useEffect(() => {
    fetchRates();
    const interval = setInterval(fetchRates, 600000); // 10 minutos
    return () => clearInterval(interval);
  }, [fetchRates]);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchClientes(), fetchTecnicos(), fetchTareas(), fetchServicios(), fetchRates()]);
    setLoading(false);
  }, [fetchClientes, fetchTecnicos, fetchTareas, fetchServicios, fetchRates]);

  const deleteRecord = async (endpoint, id) => {
    if (!id) return false;
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
      rates, fetchRates,
      isOnline,
      refreshAll, deleteRecord, updateRecord,
      fetchClientes, fetchTecnicos, fetchTareas, fetchServicios
    }}>
      {children}
    </AppContext.Provider>
  );
};
