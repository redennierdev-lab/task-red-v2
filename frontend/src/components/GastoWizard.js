import React, { useState, useContext } from 'react';
import { X, ArrowRight, ArrowLeft, Send, DollarSign, Package, Utensils, CreditCard, Calendar, Clock, Tag } from 'lucide-react';
import { db, logAction } from '../db/db';
import { AppContext } from '../context/AppContext';

const GastoWizard = ({ isOpen, setIsOpen }) => {
    const { refreshAll } = useContext(AppContext);
    const [step, setStep] = useState(1);
    
    // Gasto category: 'Producto' | 'Comida/Servicio'
    const [categoria, setCategoria] = useState('');
    
    // Form State
    const [form, setForm] = useState({
        producto_nombre: '',
        marca: '',
        modelo: '',
        tipo: '',
        monto: '',
        metodo_pago: 'Efectivo', // Efectivo, Pago Móvil, Divisa
        fecha: new Date().toISOString().split('T')[0],
        hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        descripcion: ''
    });

    const resetFlow = () => {
        setStep(1);
        setCategoria('');
        setForm({
            producto_nombre: '',
            marca: '',
            modelo: '',
            tipo: '',
            monto: '',
            metodo_pago: 'Efectivo',
            fecha: new Date().toISOString().split('T')[0],
            hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
            descripcion: ''
        });
    };

    const handleClose = () => {
        setIsOpen(false);
        setTimeout(resetFlow, 500);
    };

    const handleSubmit = async (e) => {
        e?.preventDefault();
        try {
            const finalData = {
                categoria,
                ...form,
                monto: parseFloat(form.monto) || 0
            };
            
            const id = await db.expenses.add(finalData);
            await logAction('Admin', 'CREACIÓN', 'Expenses', id, `Gasto registrado: ${categoria} - ${form.producto_nombre || form.descripcion}`);
            
            refreshAll();
            alert('¡Gasto registrado en el teléfono con éxito!');
            handleClose();
        } catch (error) {
            console.error('Error guardando gasto:', error);
            alert('Error al guardar el gasto localmente.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" onClick={handleClose}></div>
            <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] border border-white/20">
                
                {/* Header Area */}
                <div className="bg-logo-gradient p-8 text-white relative shrink-0">
                    <button onClick={handleClose} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all">
                        <X size={20} />
                    </button>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tight">Registro de Gasto</h2>
                            <p className="text-white/70 text-[10px] font-bold uppercase tracking-[0.2em]">Flujo de Caja Operativo</p>
                        </div>
                    </div>
                    
                    <div className="flex gap-2 mt-6">
                        {[1, 2, 3].map(s => (
                            <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'bg-white/20'}`} />
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                    
                    {/* Step 1: Category Selection */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h3 className="text-lg font-black text-slate-800 text-center mb-8 uppercase tracking-widest">¿Qué tipo de gasto es?</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <button 
                                    onClick={() => { setCategoria('Producto'); setStep(2); }}
                                    className="group p-8 rounded-[2.5rem] border-2 border-slate-100 hover:border-orange-500 hover:bg-orange-50/50 flex flex-col items-center gap-4 transition-all duration-300"
                                >
                                    <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                                        <Package size={32} />
                                    </div>
                                    <span className="font-black text-slate-700 uppercase tracking-widest text-sm">Hardware / Producto</span>
                                </button>
                                <button 
                                    onClick={() => { setCategoria('Comida/Servicio'); setStep(2); }}
                                    className="group p-8 rounded-[2.5rem] border-2 border-slate-100 hover:border-fuchsia-500 hover:bg-fuchsia-50/50 flex flex-col items-center gap-4 transition-all duration-300"
                                >
                                    <div className="w-16 h-16 bg-fuchsia-100 rounded-2xl flex items-center justify-center text-fuchsia-500 group-hover:scale-110 transition-transform">
                                        <Utensils size={32} />
                                    </div>
                                    <span className="font-black text-slate-700 uppercase tracking-widest text-sm">Comida / Varios</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Specific Data */}
                    {step === 2 && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                <Tag size={14} /> Detalles del Item ({categoria})
                            </h3>
                            
                            {categoria === 'Producto' ? (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2 space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-slate-400 pl-4">Nombre del Producto</label>
                                        <input 
                                            required 
                                            placeholder="Ej: Router AC1200"
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-full focus:bg-white focus:border-orange-500 transition-all font-bold text-slate-700 outline-none"
                                            value={form.producto_nombre}
                                            onChange={e => setForm({...form, producto_nombre: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-slate-400 pl-4">Marca</label>
                                        <input 
                                            placeholder="Tenda, MikroTik..."
                                            className="w-full px-6 py-3 bg-slate-50 border border-slate-200 rounded-full focus:bg-white focus:border-orange-500 transition-all font-bold text-slate-700 text-sm outline-none"
                                            value={form.marca}
                                            onChange={e => setForm({...form, marca: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-slate-400 pl-4">Modelo</label>
                                        <input 
                                            placeholder="V1.2 / Pro..."
                                            className="w-full px-6 py-3 bg-slate-50 border border-slate-200 rounded-full focus:bg-white focus:border-orange-500 transition-all font-bold text-slate-700 text-sm outline-none"
                                            value={form.modelo}
                                            onChange={e => setForm({...form, modelo: e.target.value})}
                                        />
                                    </div>
                                    <div className="col-span-2 space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-slate-400 pl-4">Tipo / Especificación</label>
                                        <input 
                                            placeholder="Ej: Dual Band Wifi 5"
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-full focus:bg-white focus:border-orange-500 transition-all font-bold text-slate-700 outline-none"
                                            value={form.tipo}
                                            onChange={e => setForm({...form, tipo: e.target.value})}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-slate-400 pl-4">Descripción del Gasto</label>
                                        <textarea 
                                            rows="4"
                                            placeholder="Ej: Almuerzo equipo técnico en zona..."
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] focus:bg-white focus:border-fuchsia-500 transition-all font-bold text-slate-700 outline-none resize-none"
                                            value={form.descripcion}
                                            onChange={e => setForm({...form, descripcion: e.target.value})}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 3: Financials */}
                    {step === 3 && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                <DollarSign size={14} /> Información de Pago
                            </h3>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-slate-400 pl-4">Monto Total ($)</label>
                                    <div className="relative group">
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-300 group-focus-within:text-emerald-500 transition-colors">$</span>
                                        <input 
                                            required 
                                            type="number"
                                            step="0.01"
                                            placeholder="15.00"
                                            className="w-full pl-10 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-full focus:bg-white focus:border-emerald-500 transition-all font-black text-2xl text-slate-800 outline-none"
                                            value={form.monto}
                                            onChange={e => setForm({...form, monto: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="col-span-2 space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-slate-400 pl-4">Método de Pago</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['Efectivo', 'Pago Móvil', 'Divisa'].map(method => (
                                            <button 
                                                key={method}
                                                type="button"
                                                onClick={() => setForm({...form, metodo_pago: method})}
                                                className={`py-3 rounded-full border-2 font-black text-[10px] uppercase tracking-widest transition-all ${form.metodo_pago === method ? 'bg-slate-900 border-slate-900 text-white shadow-lg scale-105' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                                            >
                                                {method}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-slate-400 pl-4 flex items-center gap-1"><Calendar size={10}/> Fecha</label>
                                    <input 
                                        type="date"
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-full font-bold text-slate-700 text-xs outline-none"
                                        value={form.fecha}
                                        onChange={e => setForm({...form, fecha: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-slate-400 pl-4 flex items-center gap-1"><Clock size={10}/> Hora</label>
                                    <input 
                                        type="time"
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-full font-bold text-slate-700 text-xs outline-none"
                                        value={form.hora}
                                        onChange={e => setForm({...form, hora: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-slate-50 flex justify-between items-center shrink-0 border-t border-slate-200 rounded-b-[2.5rem]">
                    <button 
                        type="button"
                        onClick={() => step > 1 ? setStep(step - 1) : handleClose()}
                        className="px-6 py-3 font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest text-[10px] flex items-center gap-2 rounded-full hover:bg-slate-200/50 transition-all"
                    >
                        {step === 1 ? 'Cancelar' : <><ArrowLeft size={14}/> Atrás</>}
                    </button>
                    
                    {step < 3 ? (
                        <button 
                            type="button" 
                            disabled={step === 1 && !categoria}
                            onClick={() => setStep(step + 1)} 
                            className="bg-slate-900 text-white rounded-full px-8 py-3.5 font-black uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-xl hover:bg-slate-800 disabled:opacity-50 disabled:grayscale transition-all active:scale-95"
                        >
                            Continuar <ArrowRight size={14}/>
                        </button>
                    ) : (
                        <button 
                            type="button" 
                            onClick={handleSubmit} 
                            className="btn-gradient shadow-emerald-500/20 bg-emerald-500 hover:shadow-emerald-500/40 rounded-full px-10 py-3.5 font-black uppercase tracking-widest text-[10px] flex items-center gap-2 transition-all active:scale-95"
                        >
                            Registrar Gasto <Send size={14}/>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GastoWizard;
