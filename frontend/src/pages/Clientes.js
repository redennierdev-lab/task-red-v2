import React, { useState, useEffect } from 'react';

const Clientes = () => {
    const [showForm, setShowForm] = useState(false);
    const [clientes, setClientes] = useState([]);
    const [formData, setFormData] = useState({ nombre: '', identificacion: '', telefono: '', direccion: '' });

    // Función para cargar clientes de la base de datos
    const cargarClientes = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/customers');
            const data = await res.json();
            setClientes(data);
        } catch (err) {
            console.error("Error cargando:", err);
        }
    };

    useEffect(() => { cargarClientes(); }, []);

    // FUNCIÓN PARA GUARDAR
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert("¡Cliente guardado con éxito en RED ENNIER!");
                setShowForm(false);
                setFormData({ nombre: '', identificacion: '', telefono: '', direccion: '' }); // Limpiar
                cargarClientes(); // Refrescar lista
            }
        } catch (err) {
            alert("Error al conectar con el servidor");
        }
    };

    return (
        <div className="relative">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Clientes RED ENNIER</h1>
                <button 
                    onClick={() => setShowForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold shadow-lg transition-all"
                >
                    + Nuevo Cliente
                </button>
            </div>

            {/* Lista de Clientes Real */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clientes.map(c => (
                    <div key={c.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="font-bold text-lg text-blue-700">{c.nombre}</h3>
                        <p className="text-sm text-gray-500">ID: {c.cedula}</p>
                        <p className="text-sm text-gray-600 mt-2">📞 {c.telefono}</p>
                    </div>
                ))}
            </div>

            {/* Modal del Formulario */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">Registrar Cliente</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input 
                                type="text" placeholder="Nombre o Empresa" 
                                className="w-full p-3 bg-gray-50 border rounded-lg outline-none focus:border-blue-500"
                                onChange={e => setFormData({...formData, nombre: e.target.value})} required 
                            />
                            <input 
                                type="text" placeholder="Cédula o RIF" 
                                className="w-full p-3 bg-gray-50 border rounded-lg outline-none focus:border-blue-500"
                                onChange={e => setFormData({...formData, identificacion: e.target.value})} required 
                            />
                            <input 
                                type="text" placeholder="Teléfono" 
                                className="w-full p-3 bg-gray-50 border rounded-lg outline-none focus:border-blue-500"
                                onChange={e => setFormData({...formData, telefono: e.target.value})} 
                            />
                            <div className="flex gap-2 pt-4">
                                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-lg">Cancelar</button>
                                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-md">Guardar Datos</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Clientes;