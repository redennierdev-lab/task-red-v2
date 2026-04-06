import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, Search, Users, Phone, CreditCard, MapPin } from 'lucide-react';

const Clientes = () => {
    const [clientes, setClientes] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [nuevoCliente, setNuevoCliente] = useState({ nombre: '', cedula: '', telefono: '', direccion: '' });
    const [mostrarForm, setMostrarForm] = useState(false);

    // Cargar clientes al iniciar
    useEffect(() => {
        obtenerClientes();
    }, []);

    const obtenerClientes = async () => {
        try {
            const res = await axios.get('/api/customers/all');
            setClientes(res.data);
        } catch (err) {
            console.error("Error cargando clientes", err);
        }
    };

    const manejarGuardar = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/customers', nuevoCliente);
            setNuevoCliente({ nombre: '', cedula: '', telefono: '', direccion: '' });
            setMostrarForm(false);
            obtenerClientes();
            alert("Cliente guardado con éxito");
        } catch (err) {
            alert("Error al guardar cliente");
        }
    };

    const clientesFiltrados = clientes.filter(c => 
        c.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
        c.cedula.includes(busqueda)
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Users className="text-blue-600" /> Gestión de Clientes
                </h2>
                <button 
                    onClick={() => setMostrarForm(!mostrarForm)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <UserPlus size={20} /> {mostrarForm ? 'Cerrar' : 'Nuevo Cliente'}
                </button>
            </div>

            {mostrarForm && (
                <form onSubmit={manejarGuardar} className="bg-white p-6 rounded-xl shadow-md grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300">
                    <input type="text" placeholder="Nombre Completo" className="border p-2 rounded" value={nuevoCliente.nombre} onChange={e => setNuevoCliente({...nuevoCliente, nombre: e.target.value})} required />
                    <input type="text" placeholder="Cédula / RIF" className="border p-2 rounded" value={nuevoCliente.cedula} onChange={e => setNuevoCliente({...nuevoCliente, cedula: e.target.value})} required />
                    <input type="text" placeholder="Teléfono" className="border p-2 rounded" value={nuevoCliente.telefono} onChange={e => setNuevoCliente({...nuevoCliente, telefono: e.target.value})} />
                    <input type="text" placeholder="Dirección" className="border p-2 rounded" value={nuevoCliente.direccion} onChange={e => setNuevoCliente({...nuevoCliente, direccion: e.target.value})} />
                    <button type="submit" className="md:col-span-2 bg-green-600 text-white p-2 rounded font-bold hover:bg-green-700">Guardar Cliente</button>
                </form>
            )}

            <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input 
                    type="text" 
                    placeholder="Buscar por nombre o cédula..." 
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-blue-500"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clientesFiltrados.map(c => (
                    <div key={c.id} className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-blue-500 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                            <h3 className="font-bold text-lg text-gray-800">{c.nombre}</h3>
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">Activo</span>
                        </div>
                        <div className="space-y-2 text-sm text-gray-600">
                            <p className="flex items-center gap-2"><CreditCard size={14}/> {c.cedula}</p>
                            <p className="flex items-center gap-2"><Phone size={14}/> {c.telefono || 'Sin teléfono'}</p>
                            <p className="flex items-center gap-2"><MapPin size={14}/> {c.direccion || 'Sin dirección'}</p>
                        </div>
                    </div>
                ))}
            </div>
            
            {clientesFiltrados.length === 0 && (
                <div className="text-center py-10 text-gray-500">No se encontraron clientes.</div>
            )}
        </div>
    );
};

export default Clientes;